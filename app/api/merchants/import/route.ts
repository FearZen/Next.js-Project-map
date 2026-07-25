import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const importPayloadSchema = z.object({
  fileName: z.string(),
  overwriteDuplicate: z.boolean().default(false),
  data: z.array(
    z.object({
      sheetName: z.string(),
      name: z.string(),
      jenis: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = importPayloadSchema.parse(body);

    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid untuk diimpor' }, { status: 400 });
    }

    // 1. Fetch valid user ID in DB for FK constraints
    let dbUser = await prisma.user.findFirst({
      where: { email: session.user.email || 'admin@mandirimap.com' },
    });

    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
    }

    const userId = dbUser?.id;

    // 2. Get default status "BELUM_DIKUNJUNGI"
    let defaultStatus = await prisma.merchantStatus.findUnique({
      where: { code: 'BELUM_DIKUNJUNGI' },
    });

    if (!defaultStatus) {
      defaultStatus = await prisma.merchantStatus.findFirst();
    }

    const statusId = defaultStatus?.id;
    if (!statusId) {
      return NextResponse.json(
        { error: 'Master status belum di-seed di database. Jalankan `npx prisma db seed`.' },
        { status: 500 }
      );
    }

    // 3. Batch Ensure Categories Exist
    const uniqueSheetNames = Array.from(new Set(parsed.data.map((d) => d.sheetName)));
    const categoryMap: Record<string, string> = {};

    for (const sheetName of uniqueSheetNames) {
      const cat = await prisma.merchantCategory.upsert({
        where: { name: sheetName },
        update: {},
        create: { name: sheetName, description: `Dibuat otomatis dari Sheet Excel "${sheetName}"` },
      });
      categoryMap[sheetName] = cat.id;
    }

    // 4. Create ImportLog record if valid user exists
    let importLogId: string | undefined;
    if (userId) {
      const importLog = await prisma.importLog.create({
        data: {
          userId,
          fileName: parsed.fileName,
          totalRows: parsed.data.length,
          successCount: 0,
          failedCount: 0,
          status: 'PROCESSING',
        },
      });
      importLogId = importLog.id;
    }

    // 5. Build existing merchant cache for duplicate check
    const existingMerchants = await prisma.merchant.findMany({
      select: { name: true, categoryId: true, latitude: true, longitude: true },
    });

    const existingSet = new Set<string>();
    existingMerchants.forEach((m) => {
      const key = `${m.name.trim().toLowerCase()}_${m.categoryId}_${m.latitude.toFixed(5)}_${m.longitude.toFixed(5)}`;
      existingSet.add(key);
    });

    const toCreate: any[] = [];
    let duplicateSkipped = 0;
    const processedSet = new Set<string>();

    for (const row of parsed.data) {
      const categoryId = categoryMap[row.sheetName];
      const dupKey = `${row.name.trim().toLowerCase()}_${categoryId}_${row.latitude.toFixed(5)}_${row.longitude.toFixed(5)}`;

      // Skip duplicate if already in DB and overwriteDuplicate is false
      if (!parsed.overwriteDuplicate && (existingSet.has(dupKey) || processedSet.has(dupKey))) {
        duplicateSkipped++;
        continue;
      }

      processedSet.add(dupKey);

      toCreate.push({
        id: `mer_${randomUUID().replace(/-/g, '').slice(0, 20)}`,
        name: row.name,
        jenis: row.jenis,
        latitude: row.latitude,
        longitude: row.longitude,
        address: row.address || null,
        categoryId,
        statusId,
        importLogId: importLogId || null,
      });
    }

    // 6. Bulk Insert using createMany (Fast, atomic, serverless-safe)
    let successCount = 0;

    if (toCreate.length > 0) {
      const result = await prisma.merchant.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      successCount = result.count;
    }

    // Update Import Log status if created
    if (importLogId) {
      await prisma.importLog.update({
        where: { id: importLogId },
        data: {
          successCount,
          failedCount: 0,
          status: 'SUCCESS',
        },
      });
    }

    return NextResponse.json({
      success: true,
      importLogId,
      summary: {
        totalRows: parsed.data.length,
        successCount,
        duplicateSkipped,
        failedCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Error in import API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menyimpan data impor ke database Supabase.',
      },
      { status: 500 }
    );
  }
}
