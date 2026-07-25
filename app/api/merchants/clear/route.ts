import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Single atomic delete statement (Cascade deletes visit histories & notes automatically)
    await prisma.merchant.deleteMany({});
    await prisma.importLog.deleteMany({});

    return NextResponse.json({ success: true, message: 'Seluruh data merchant berhasil dikosongkan.' });
  } catch (error: any) {
    console.error('Error clearing merchants:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
