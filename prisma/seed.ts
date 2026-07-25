import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Checking & upserting master seed data safely...');

  // 1. Seed Master Role ADMIN (Non-destructive)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { description: 'System Administrator dengan akses penuh' },
    create: { name: 'ADMIN', description: 'System Administrator dengan akses penuh' },
  });

  // 2. Seed Master Merchant Statuses (Non-destructive)
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

  // 3. Seed ONLY System Admin User (Non-destructive)
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

  console.log('✅ Master seed completed safely without touching merchant data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
