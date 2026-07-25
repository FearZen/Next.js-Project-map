import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const statuses = await prisma.merchantStatus.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(statuses);
  } catch (error) {
    // Fallback master statuses
    return NextResponse.json([
      { id: 'st_1', code: 'BELUM_DIKUNJUNGI', name: 'Belum Dikunjungi', colorHex: '#EF4444', sortOrder: 1 },
      { id: 'st_2', code: 'SURVEY', name: 'Survey', colorHex: '#F59E0B', sortOrder: 2 },
      { id: 'st_3', code: 'NEGOSIASI', name: 'Negosiasi', colorHex: '#3B82F6', sortOrder: 3 },
      { id: 'st_4', code: 'AKUISISI', name: 'Akuisisi', colorHex: '#10B981', sortOrder: 4 },
      { id: 'st_5', code: 'DITOLAK', name: 'Ditolak', colorHex: '#6B7280', sortOrder: 5 },
    ]);
  }
}
