import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

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

    let successCount = 0;
    let duplicateSkipped = 0;
    let failedCount = 0;

    // 3. Cache Categories
    const categoryCache: Record<string, string> = {};
    const existingCategories = await prisma.merchantCategory.findMany();
    existingCategories.forEach((c) => {
      categoryCache[c.name] = c.id;
    });

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

    // 5. Process Rows
    for (const row of parsed.data) {
      try {
        // Ensure category exists
        if (!categoryCache[row.sheetName]) {
          const createdCat = await prisma.merchantCategory.upsert({
            where: { name: row.sheetName },
            update: {},
            create: { name: row.sheetName, description: `Dibuat otomatis dari Sheet Excel "${row.sheetName}"` },
          });
          categoryCache[row.sheetName] = createdCat.id;
        }

        const categoryId = categoryCache[row.sheetName];

        // Duplicate Check (by name & category & lat/long proximity)
        const existing = await prisma.merchant.findFirst({
          where: {
            name: row.name,
            categoryId,
            latitude: row.latitude,
            longitude: row.longitude,
          },
        });

        if (existing) {
          if (!parsed.overwriteDuplicate) {
            duplicateSkipped++;
            continue; // Skip duplicate
          } else {
            // Overwrite existing data
            await prisma.merchant.update({
              where: { id: existing.id },
              data: {
                jenis: row.jenis,
                address: row.address || null,
                importLogId,
              },
            });
            successCount++;
            continue;
          }
        }

        // Create new Merchant
        const newMerchant = await prisma.merchant.create({
          data: {
            name: row.name,
            jenis: row.jenis,
            latitude: row.latitude,
            longitude: row.longitude,
            address: row.address || null,
            categoryId,
            statusId,
            importLogId,
          },
        });

        // Add initial visit history if userId exists
        if (userId) {
          await prisma.visitHistory.create({
            data: {
              merchantId: newMerchant.id,
              userId,
              previousStatusId: statusId,
              newStatusId: statusId,
              noteText: `Merchant diimpor dari file "${parsed.fileName}" (Sheet: ${row.sheetName})`,
            },
          });
        }

        successCount++;
      } catch (err) {
        console.error('Error importing row:', err);
        failedCount++;
      }
    }

    // Update Import Log status if created
    if (importLogId) {
      await prisma.importLog.update({
        where: { id: importLogId },
        data: {
          successCount,
          failedCount,
          status: failedCount === 0 ? 'SUCCESS' : 'PARTIAL',
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
        failedCount,
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
