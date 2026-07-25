import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalMerchants, statuses, categories, recentVisits] = await Promise.all([
      prisma.merchant.count(),
      prisma.merchantStatus.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { merchants: true } } },
      }),
      prisma.merchantCategory.findMany({
        include: { _count: { select: { merchants: true } } },
      }),
      prisma.visitHistory.findMany({
        take: 5,
        orderBy: { visitedAt: 'desc' },
        include: {
          merchant: { select: { name: true } },
          user: { select: { name: true } },
          newStatus: { select: { name: true, colorHex: true } },
        },
      }),
    ]);

    const acquiredStatus = statuses.find((s) => s.code === 'AKUISISI');
    const totalAcquired = acquiredStatus ? acquiredStatus._count.merchants : 0;
    const conversionRate = totalMerchants > 0 ? (totalAcquired / totalMerchants) * 100 : 0;

    const byStatus = statuses.map((st) => ({
      code: st.code,
      name: st.name,
      count: st._count.merchants,
      colorHex: st.colorHex,
    }));

    const byCategory = categories.map((cat) => ({
      name: cat.name,
      count: cat._count.merchants,
    }));

    return NextResponse.json({
      kpi: {
        totalMerchants,
        totalAcquired,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
      },
      byStatus,
      byCategory,
      recentVisits,
    });
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    return NextResponse.json({
      kpi: {
        totalMerchants: 0,
        totalAcquired: 0,
        conversionRate: 0.0,
      },
      byStatus: [],
      byCategory: [],
      recentVisits: [],
    });
  }
}
