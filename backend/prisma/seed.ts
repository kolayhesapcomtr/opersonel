import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      email: 'info@democompany.com',
      phone: '+90 555 123 4567',
      planType: 'premium',
      subscriptionStatus: 'active',
      maxUsers: 50,
      maxStorage: 10,
    },
  });

  console.log('✅ Tenant created:', tenant.name);

  // Create departments
  const hrDept = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      name: 'İnsan Kaynakları',
      code: 'HR',
      description: 'İnsan Kaynakları Departmanı',
    },
  });

  const itDept = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      name: 'Bilgi Teknolojileri',
      code: 'IT',
      description: 'Bilgi Teknolojileri Departmanı',
    },
  });

  const salesDept = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      name: 'Satış',
      code: 'SALES',
      description: 'Satış Departmanı',
    },
  });

  console.log('✅ Departments created');

  // Create positions
  const hrManagerPos = await prisma.position.create({
    data: {
      tenantId: tenant.id,
      departmentId: hrDept.id,
      title: 'İK Müdürü',
      code: 'HR-MGR',
      level: 'Senior',
    },
  });

  const hrSpecialistPos = await prisma.position.create({
    data: {
      tenantId: tenant.id,
      departmentId: hrDept.id,
      title: 'İK Uzmanı',
      code: 'HR-SPEC',
      level: 'Mid',
    },
  });

  const itManagerPos = await prisma.position.create({
    data: {
      tenantId: tenant.id,
      departmentId: itDept.id,
      title: 'IT Müdürü',
      code: 'IT-MGR',
      level: 'Senior',
    },
  });

  const developerPos = await prisma.position.create({
    data: {
      tenantId: tenant.id,
      departmentId: itDept.id,
      title: 'Yazılım Geliştirici',
      code: 'DEV',
      level: 'Mid',
    },
  });

  console.log('✅ Positions created');

  // Create employees
  const hrManager = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      email: 'ayse.yilmaz@democompany.com',
      phone: '+90 555 111 2233',
      employeeNumber: 'EMP001',
      hireDate: new Date('2020-01-15'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      departmentId: hrDept.id,
      positionId: hrManagerPos.id,
      gender: 'FEMALE',
      maritalStatus: 'MARRIED',
      salary: 25000,
      currency: 'TRY',
    },
  });

  const hrSpecialist = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Mehmet',
      lastName: 'Demir',
      email: 'mehmet.demir@democompany.com',
      phone: '+90 555 222 3344',
      employeeNumber: 'EMP002',
      hireDate: new Date('2021-03-10'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      departmentId: hrDept.id,
      positionId: hrSpecialistPos.id,
      managerId: hrManager.id,
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      salary: 18000,
      currency: 'TRY',
    },
  });

  const itManager = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Fatma',
      lastName: 'Kaya',
      email: 'fatma.kaya@democompany.com',
      phone: '+90 555 333 4455',
      employeeNumber: 'EMP003',
      hireDate: new Date('2019-06-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      departmentId: itDept.id,
      positionId: itManagerPos.id,
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      salary: 30000,
      currency: 'TRY',
    },
  });

  const developer = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Ali',
      lastName: 'Çelik',
      email: 'ali.celik@democompany.com',
      phone: '+90 555 444 5566',
      employeeNumber: 'EMP004',
      hireDate: new Date('2022-01-15'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      departmentId: itDept.id,
      positionId: developerPos.id,
      managerId: itManager.id,
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      salary: 20000,
      currency: 'TRY',
    },
  });

  console.log('✅ Employees created');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@democompany.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      employeeId: hrManager.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'fatma.kaya@democompany.com',
      password: hashedPassword,
      role: UserRole.MANAGER,
      employeeId: itManager.id,
    },
  });

  const employeeUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'ali.celik@democompany.com',
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
      employeeId: developer.id,
    },
  });

  console.log('✅ Users created');

  // Create leave types
  await prisma.leaveType.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Yıllık İzin',
        code: 'ANNUAL',
        description: 'Yıllık ücretli izin',
        daysPerYear: 20,
        requiresApproval: true,
        isPaid: true,
        canCarryForward: true,
      },
      {
        tenantId: tenant.id,
        name: 'Hastalık İzni',
        code: 'SICK',
        description: 'Hastalık durumunda kullanılacak izin',
        daysPerYear: 10,
        requiresApproval: true,
        isPaid: true,
        canCarryForward: false,
      },
      {
        tenantId: tenant.id,
        name: 'Mazeret İzni',
        code: 'EXCUSE',
        description: 'Kısa süreli mazeret izni',
        daysPerYear: 5,
        requiresApproval: true,
        isPaid: true,
        canCarryForward: false,
      },
      {
        tenantId: tenant.id,
        name: 'Ücretsiz İzin',
        code: 'UNPAID',
        description: 'Ücretsiz izin',
        daysPerYear: 0,
        requiresApproval: true,
        isPaid: false,
        canCarryForward: false,
      },
    ],
  });

  console.log('✅ Leave types created');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📝 Demo login credentials:');
  console.log('   Admin: admin@democompany.com / password123');
  console.log('   Manager: fatma.kaya@democompany.com / password123');
  console.log('   Employee: ali.celik@democompany.com / password123');
  console.log('\n   Tenant: demo-company');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
