import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateStatusSchema = z.object({
  merchantId: z.string(),
  newStatusId: z.string(),
  noteText: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateStatusSchema.parse(body);

    // 1. Fetch valid user ID in DB for FK constraints
    let dbUser = await prisma.user.findFirst({
      where: { email: session.user.email || 'admin@mandirimap.com' },
    });

    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
    }

    const userId = dbUser?.id;

    // 2. Fetch target merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: parsed.merchantId },
      include: { status: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant tidak ditemukan' }, { status: 404 });
    }

    const previousStatusId = merchant.statusId;

    // 3. Update Merchant Status directly first
    const updatedMerchant = await prisma.merchant.update({
      where: { id: parsed.merchantId },
      data: { statusId: parsed.newStatusId },
      include: { status: true, category: true },
    });

    // 4. Create Visit History Log if valid DB user exists
    if (userId) {
      try {
        await prisma.visitHistory.create({
          data: {
            merchantId: parsed.merchantId,
            userId,
            previousStatusId,
            newStatusId: parsed.newStatusId,
            noteText: parsed.noteText || null,
          },
        });

        if (parsed.noteText && parsed.noteText.trim() !== '') {
          await prisma.note.create({
            data: {
              merchantId: parsed.merchantId,
              userId,
              content: parsed.noteText,
            },
          });
        }
      } catch (logErr) {
        console.warn('Visit log record skipped:', logErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Status merchant berhasil diperbarui ke database Supabase',
      merchant: updatedMerchant,
    });
  } catch (error: any) {
    console.error('Error updating merchant status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengubah status di database' },
      { status: 500 }
    );
  }
}
