import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusId = searchParams.get('statusId');
  const categoryId = searchParams.get('categoryId');
  const search = searchParams.get('search');
  const format = searchParams.get('format') || 'geojson';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const where: any = {};

    if (statusId && statusId !== 'ALL') {
      where.statusId = statusId;
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { jenis: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (format === 'geojson') {
      const merchants = await prisma.merchant.findMany({
        where,
        include: {
          category: true,
          status: true,
        },
      });

      const features = merchants.map((m) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [m.longitude, m.latitude],
        },
        properties: {
          id: m.id,
          name: m.name,
          jenis: m.jenis,
          address: m.address,
          category: m.category?.name || 'Umum',
          categoryId: m.categoryId,
          statusId: m.statusId,
          status: {
            code: m.status?.code || 'BELUM_DIKUNJUNGI',
            name: m.status?.name || 'Belum Dikunjungi',
            colorHex: m.status?.colorHex || '#EF4444',
          },
          updatedAt: m.updatedAt,
        },
      }));

      return NextResponse.json({
        type: 'FeatureCollection',
        features,
      });
    }

    // Default JSON Paginated Table Response
    const skip = (page - 1) * limit;
    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        include: {
          category: true,
          status: true,
          visitLogs: {
            take: 1,
            orderBy: { visitedAt: 'desc' },
            include: { user: { select: { name: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.merchant.count({ where }),
    ]);

    return NextResponse.json({
      merchants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching merchants from DB:', error);
    if (format === 'geojson') {
      return NextResponse.json({ type: 'FeatureCollection', features: [], error: error.message });
    }
    return NextResponse.json({
      merchants: [],
      pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
      error: error.message,
    });
  }
}
