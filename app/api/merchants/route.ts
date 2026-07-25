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

    if (
      statusId &&
      statusId.trim() !== '' &&
      statusId.toUpperCase() !== 'ALL' &&
      statusId !== 'undefined' &&
      statusId !== 'null'
    ) {
      where.statusId = statusId;
    }

    if (
      categoryId &&
      categoryId.trim() !== '' &&
      categoryId.toUpperCase() !== 'ALL' &&
      categoryId !== 'undefined' &&
      categoryId !== 'null'
    ) {
      where.categoryId = categoryId;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { jenis: { contains: search.trim(), mode: 'insensitive' } },
        { address: { contains: search.trim(), mode: 'insensitive' } },
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
          coordinates: [m.longitude || 0, m.latitude || 0],
        },
        properties: {
          id: m.id,
          name: m.name || 'Merchant Tanpa Nama',
          jenis: m.jenis || 'Umum',
          address: m.address || '',
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
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.merchant.count({ where }),
    ]);

    const sanitizedMerchants = merchants.map((m) => ({
      ...m,
      category: m.category || { name: 'Umum' },
      status: m.status || { code: 'BELUM_DIKUNJUNGI', name: 'Belum Dikunjungi', colorHex: '#EF4444' },
    }));

    return NextResponse.json({
      merchants: sanitizedMerchants,
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
