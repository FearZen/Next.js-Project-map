import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        category: true,
        status: true,
        visitLogs: {
          orderBy: { visitedAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            previousStatus: true,
            newStatus: true,
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(merchant);
  } catch (error) {
    console.error('Error fetching merchant detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete related logs & notes first (or rely on Cascade)
    await prisma.visitHistory.deleteMany({ where: { merchantId: id } });
    await prisma.note.deleteMany({ where: { merchantId: id } });
    await prisma.merchant.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Merchant berhasil dihapus dari database Supabase' });
  } catch (error: any) {
    console.error('Error deleting merchant:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus merchant' }, { status: 500 });
  }
}
