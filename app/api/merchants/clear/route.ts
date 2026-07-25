import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.visitHistory.deleteMany();
    await prisma.note.deleteMany();
    await prisma.merchant.deleteMany();
    await prisma.importLog.deleteMany();

    return NextResponse.json({ success: true, message: 'Seluruh data merchant berhasil dikosongkan.' });
  } catch (error: any) {
    console.error('Error clearing merchants:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
