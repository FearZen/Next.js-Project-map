import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Supabase database master seeding...');

  // 1. Delete dependent records first before deleting users & roles
  await prisma.visitHistory.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.importLog.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Master Role ADMIN only
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { description: 'System Administrator dengan akses penuh' },
    create: { name: 'ADMIN', description: 'System Administrator dengan akses penuh' },
  });

  console.log('✅ Master Role ADMIN updated');

  // 3. Seed Master Merchant Statuses
  const statusesData = [
    { code: 'BELUM_DIKUNJUNGI', name: 'Belum Dikunjungi', colorHex: '#EF4444', sortOrder: 1 },
    { code: 'SURVEY', name: 'Survey', colorHex: '#F59E0B', sortOrder: 2 },
    { code: 'NEGOSIASI', name: 'Negosiasi', colorHex: '#3B82F6', sortOrder: 3 },
    { code: 'AKUISISI', name: 'Akuisisi', colorHex: '#10B981', sortOrder: 4 },
    { code: 'DITOLAK', name: 'Ditolak', colorHex: '#6B7280', sortOrder: 5 },
  ];

  for (const st of statusesData) {
    await prisma.merchantStatus.upsert({
      where: { code: st.code },
      update: { name: st.name, colorHex: st.colorHex, sortOrder: st.sortOrder },
      create: st,
    });
  }
  console.log('✅ Master Statuses seeded');

  // 4. Seed ONLY System Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@mandirimap.com' },
    update: { name: 'System Admin', passwordHash: adminPasswordHash, roleId: adminRole.id },
    create: {
      name: 'System Admin',
      email: 'admin@mandirimap.com',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
    },
  });
  console.log('✅ Only System Admin User seeded');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
