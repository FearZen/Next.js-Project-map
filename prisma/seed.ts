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
  await prisma.role.deleteMany({ where: { name: 'TEAM_LEADER' } });

  // 2. Seed Master Roles (Team Leader removed)
  const rolesData = [
    { name: 'ADMIN', description: 'System Administrator dengan akses penuh' },
    { name: 'MARKETING', description: 'Sales Officer (Wira) di lapangan' },
    { name: 'KEPALA_CABANG', description: 'Kepala Cabang (Ibnu Perdana) memantau analytics' },
  ];

  const rolesMap: Record<string, string> = {};
  for (const role of rolesData) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    rolesMap[role.name] = createdRole.id;
  }
  console.log('✅ Master Roles updated (Team Leader removed)');

  // 3. Seed Master Merchant Statuses with Color Hex
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

  // 4. Seed Updated Users: Wira (Marketing), Ibnu Perdana (Kepala Cabang), System Admin
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const usersData = [
    {
      name: 'System Admin',
      email: 'admin@mandirimap.com',
      passwordHash: adminPasswordHash,
      roleId: rolesMap['ADMIN'],
    },
    {
      name: 'Wira (Marketing)',
      email: 'wira@mandirimap.com',
      passwordHash: defaultPasswordHash,
      roleId: rolesMap['MARKETING'],
    },
    {
      name: 'Ibnu Perdana (Kepala Cabang)',
      email: 'ibnu@mandirimap.com',
      passwordHash: defaultPasswordHash,
      roleId: rolesMap['KEPALA_CABANG'],
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash: u.passwordHash, roleId: u.roleId },
      create: u,
    });
  }
  console.log('✅ Updated Users seeded: Wira (Marketing), Ibnu Perdana (Kepala Cabang), System Admin');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
