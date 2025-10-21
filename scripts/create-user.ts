import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
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
      console.error(
        `❌ L'utilisateur avec l'email ${userData.email} existe déjà.`
      );
      return null;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
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

    console.log("✅ Utilisateur créé avec succès :", user);
    return user;
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur :", error);
    return null;
  }
}

async function main() {
  console.log("🔄 Création des membres de la cellule de crise Ooredoo...");

  const users = [
    // Crisis Committee (CC)
    {
      firstName: "Wafa",
      lastName: "HABABOU",
      email: "wafa.hababou@ooredoo.tn",
      phone: "20123456",
      role: Role.USER,
    },
    {
      firstName: "Mansoor Rashid Y",
      lastName: "Al-Khater",
      email: "malkhater@ooredoo.tn",
      phone: "20123457",
      role: Role.USER,
    },
    {
      firstName: "Philippe",
      lastName: "CHEVALIER",
      email: "philippe.chevalier@ooredoo.tn",
      phone: "20123458",
      role: Role.USER,
    },
    {
      firstName: "Zehia",
      lastName: "ABDELKAFI",
      email: "zehia.abdelkafi@ooredoo.tn",
      phone: "20123459",
      role: Role.USER,
    },
    {
      firstName: "Noaman",
      lastName: "BEN ABDESSALEM",
      email: "noaman.benabdessalem@ooredoo.tn",
      phone: "20123460",
      role: Role.USER,
    },
    {
      firstName: "Khaled",
      lastName: "BESROUR",
      email: "khaled.besrour@ooredoo.tn",
      phone: "20123461",
      role: Role.USER,
    },
    {
      firstName: "Mohamed Amine",
      lastName: "BOUSNINA",
      email: "medamine.bousnina@ooredoo.tn",
      phone: "20123462",
      role: Role.USER,
    },
    {
      firstName: "Houssem",
      lastName: "GHORBEL",
      email: "houssem.ghorbel@ooredoo.tn",
      phone: "20123463",
      role: Role.USER,
    },
    {
      firstName: "Bassem",
      lastName: "BOUZEMMI",
      email: "bassem.bouzemmi@ooredoo.tn",
      phone: "20123464",
      role: Role.USER,
    },
    {
      firstName: "Mathias",
      lastName: "HANEL",
      email: "mathias.hanel@ooredoo.tn",
      phone: "20123465",
      role: Role.USER,
    },
    {
      firstName: "Hatem",
      lastName: "MESTIRI",
      email: "hatem.mestiri@ooredoo.tn",
      phone: "20123466",
      role: Role.USER,
    },
    {
      firstName: "Sunil",
      lastName: "MISHRA",
      email: "sunil.mishra@ooredoo.tn",
      phone: "20123467",
      role: Role.USER,
    },
    {
      firstName: "Mohamed Ali",
      lastName: "BEN HAFSIA",
      email: "medali.benhafsia@ooredoo.tn",
      phone: "20123468",
      role: Role.USER,
    },
    {
      firstName: "Yassine",
      lastName: "SOUSSI",
      email: "yassine.soussi@ooredoo.tn",
      phone: "20123469",
      role: Role.USER,
    },

    // Crisis Management Team (CMT)
    {
      firstName: "Mohamed",
      lastName: "ABBES",
      email: "mohamed.abbes@ooredoo.tn",
      phone: "20123470",
      role: Role.USER,
    },
    {
      firstName: "Hatem",
      lastName: "ABOUDA",
      email: "hatem.abouda@ooredoo.tn",
      phone: "20123471",
      role: Role.USER,
    },
    {
      firstName: "Riadh",
      lastName: "AGREBI",
      email: "riadh.agrebi@ooredoo.tn",
      phone: "20123472",
      role: Role.USER,
    },
    {
      firstName: "Taha",
      lastName: "AKREMI",
      email: "taha.akremi@ooredoo.tn",
      phone: "20123473",
      role: Role.USER,
    },
    {
      firstName: "Karim",
      lastName: "AYADI",
      email: "karim.ayadi@ooredoo.tn",
      phone: "20123474",
      role: Role.USER,
    },
    {
      firstName: "Mohamed",
      lastName: "BELLIL",
      email: "mohamed.bellil@ooredoo.tn",
      phone: "20123475",
      role: Role.USER,
    },
    {
      firstName: "Amel",
      lastName: "BEN ABDALLAH",
      email: "amel.benabdallah@ooredoo.tn",
      phone: "20123476",
      role: Role.USER,
    },
    {
      firstName: "Imene",
      lastName: "BEN AMOR",
      email: "imene.benamor@ooredoo.tn",
      phone: "20123477",
      role: Role.USER,
    },
    {
      firstName: "Noomen",
      lastName: "BEN GADRI",
      email: "noomen.bengadri@ooredoo.tn",
      phone: "20123478",
      role: Role.USER,
    },
    {
      firstName: "Hanene",
      lastName: "BEN RADHIA",
      email: "hanene.benradhia@ooredoo.tn",
      phone: "20123479",
      role: Role.USER,
    },
    {
      firstName: "Wajih",
      lastName: "BEN SLIMANE",
      email: "wajih.benslimane@ooredoo.tn",
      phone: "20123480",
      role: Role.USER,
    },
    {
      firstName: "Olfa",
      lastName: "CHAKROUN",
      email: "olfa.chakroun@ooredoo.tn",
      phone: "20123481",
      role: Role.USER,
    },
    {
      firstName: "Naoufel",
      lastName: "DEBBABI",
      email: "naoufel.debbabi@ooredoo.tn",
      phone: "20123482",
      role: Role.USER,
    },
    {
      firstName: "Faycal",
      lastName: "DHAHRI",
      email: "faycal.dhahri@ooredoo.tn",
      phone: "20123483",
      role: Role.USER,
    },
    {
      firstName: "Makram",
      lastName: "EL MDHOUKHI",
      email: "makram.elmdoukhi@ooredoo.tn",
      phone: "20123484",
      role: Role.USER,
    },
    {
      firstName: "Foued",
      lastName: "ELOUATI",
      email: "foued.elouati@ooredoo.tn",
      phone: "20123485",
      role: Role.USER,
    },
    {
      firstName: "Helmi",
      lastName: "FITATI",
      email: "helmi.fitati@ooredoo.tn",
      phone: "20123486",
      role: Role.USER,
    },
    {
      firstName: "Naoufel",
      lastName: "HAMDI",
      email: "naoufel.hamdi@ooredoo.tn",
      phone: "20123487",
      role: Role.USER,
    },
    {
      firstName: "Ramzi",
      lastName: "HMANI",
      email: "ramzi.hmani@ooredoo.tn",
      phone: "20123488",
      role: Role.USER,
    },
    {
      firstName: "Amira",
      lastName: "ISSAOUI",
      email: "amira.issaoui@ooredoo.tn",
      phone: "20123489",
      role: Role.USER,
    },
    {
      firstName: "Mohamed",
      lastName: "ISSAOUI",
      email: "mohamed.issaoui@ooredoo.tn",
      phone: "20123490",
      role: Role.USER,
    },
    {
      firstName: "Sofiene",
      lastName: "JEDDI",
      email: "sofiene.jeddi@ooredoo.tn",
      phone: "20123491",
      role: Role.USER,
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const person of users) {
    const result = await createUser({
      email: person.email,
      password: "ooredoo123",
      firstName: person.firstName,
      lastName: person.lastName,
      phone: person.phone,
      role: person.role,
    });

    if (result) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ ${successCount} utilisateurs créés avec succès`);
  console.log(`❌ ${errorCount} erreurs rencontrées`);
  console.log("=".repeat(50));
  console.log("\n📋 Récapitulatif :");
  console.log(`   • Total d'utilisateurs traités : ${users.length}`);
  console.log(`   • Crisis Committee (CC) : 14 membres`);
  console.log(`   • Crisis Management Team (CMT) : 22 membres`);
  console.log(`   • Mot de passe par défaut : ooredoo123`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("Erreur inattendue :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
