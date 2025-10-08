import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

interface UserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: Role;
}

async function createUser(userData: UserData) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.error(`❌ L'utilisateur avec l'email ${userData.email} existe déjà.`);
      return null;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        role: userData.role || Role.USER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('✅ Utilisateur créé avec succès :', user);
    return user;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur :', error);
    return null;
  }
}

async function main() {
  console.log('🔄 Création des membres de la cellule de crise...');

  const users = [
    { firstName: 'Walid', lastName: 'Jari', phone: '9810795' },
    { firstName: 'Bellila', lastName: 'Wissem', phone: '98161402' },
    { firstName: 'Mohamed', lastName: 'Allegue', phone: '98162720' },
    { firstName: 'Khaireddin', lastName: 'Becha', phone: '98162727' },
    { firstName: 'Mohamed', lastName: 'Gara', phone: '98106502' },
    { firstName: 'Lassaed', lastName: 'Ben Alaya', phone: '98164366' },
    { firstName: 'Med Amine', lastName: 'Ben Hamida', phone: '98161403' },
    { firstName: 'Anis', lastName: 'Gharbi', phone: '98106520' },
  ];

  for (const person of users) {
    const email = `${person.firstName.toLowerCase().replace(/\s/g, '')}.${person.lastName.toLowerCase().replace(/\s/g, '')}@groupedelice.com.tn`;

    await createUser({
      email,
      password: 'DeliceDelta123!',
      firstName: person.firstName,
      lastName: person.lastName,
      phone: person.phone,
      role: Role.USER,
    });
  }

  console.log('✅ Tous les membres ont été créés.');
}

main()
  .catch((e) => {
    console.error('Erreur inattendue :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
