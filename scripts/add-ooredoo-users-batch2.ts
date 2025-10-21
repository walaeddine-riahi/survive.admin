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
      console.log(
        `⚠️  L'utilisateur ${userData.firstName} ${userData.lastName} (${userData.email}) existe déjà.`
      );
      return existingUser;
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

    console.log(
      `✅ ${userData.firstName} ${userData.lastName} créé avec succès`
    );
    return user;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la création de ${userData.firstName} ${userData.lastName} :`,
      error
    );
    return null;
  }
}

async function main() {
  console.log("🔄 Ajout des utilisateurs Ooredoo - Batch 2 (CMT & OPT)...\n");

  const users = [
    // CMT - Crisis Management Team
    {
      firstName: "Slim",
      lastName: "KEFI",
      email: "slim.kefi@ooredoo.tn",
      phone: "20200001",
      role: Role.USER,
    },
    {
      firstName: "Sinda",
      lastName: "MELAOUAH",
      email: "sinda.melaouah@ooredoo.tn",
      phone: "20200002",
      role: Role.USER,
    },
    {
      firstName: "Zied",
      lastName: "MENCHARI",
      email: "zied.menchari@ooredoo.tn",
      phone: "20200003",
      role: Role.USER,
    },
    {
      firstName: "Hichem",
      lastName: "MRABET",
      email: "hichem.mrabet@ooredoo.tn",
      phone: "20200004",
      role: Role.USER,
    },
    {
      firstName: "Nadia",
      lastName: "TAGA",
      email: "nadia.taga@ooredoo.tn",
      phone: "20200005",
      role: Role.USER,
    },
    {
      firstName: "Nejib",
      lastName: "SAGHROUNI",
      email: "nejib.saghrouni@ooredoo.tn",
      phone: "20200006",
      role: Role.USER,
    },
    {
      firstName: "Ahmed",
      lastName: "SAMAALI",
      email: "ahmed.samaali@ooredoo.tn",
      phone: "20200007",
      role: Role.USER,
    },
    {
      firstName: "Walid",
      lastName: "SANAA",
      email: "walid.sanaa@ooredoo.tn",
      phone: "20200008",
      role: Role.USER,
    },
    {
      firstName: "Oussama",
      lastName: "SELMI",
      email: "oussama.selmi@ooredoo.tn",
      phone: "20200009",
      role: Role.USER,
    },
    {
      firstName: "Wajdi",
      lastName: "SNOUSSI",
      email: "wajdi.snoussi@ooredoo.tn",
      phone: "20200010",
      role: Role.USER,
    },
    {
      firstName: "Mahmoud",
      lastName: "SOBHI",
      email: "mahmoud.sobhi@ooredoo.tn",
      phone: "20200011",
      role: Role.USER,
    },
    {
      firstName: "Medwalid",
      lastName: "ZAMMIT",
      email: "medwalid.zammit@ooredoo.tn",
      phone: "20200012",
      role: Role.USER,
    },
    {
      firstName: "Mariem",
      lastName: "ZMERLI",
      email: "mariem.zmerli@ooredoo.tn",
      phone: "20200013",
      role: Role.USER,
    },
    {
      firstName: "Ines",
      lastName: "BEN ROMDHANE",
      email: "ines.benromdhane@ooredoo.tn",
      phone: "20200014",
      role: Role.USER,
    },

    // OPT - Operational Team
    {
      firstName: "Medhedi",
      lastName: "BERGUELLIL",
      email: "medhedi.berguellil@ooredoo.tn",
      phone: "20200015",
      role: Role.USER,
    },
    {
      firstName: "Kamel",
      lastName: "TRABELSI",
      email: "kamel.trabelsi@ooredoo.tn",
      phone: "20200016",
      role: Role.USER,
    },
    {
      firstName: "Mahmoud",
      lastName: "TAJOURI",
      email: "mahmoud.tajouri@ooredoo.tn",
      phone: "20200017",
      role: Role.USER,
    },
    {
      firstName: "Moncef",
      lastName: "AZIZI",
      email: "moncef.azizi@ooredoo.tn",
      phone: "20200018",
      role: Role.USER,
    },
    {
      firstName: "Hatem",
      lastName: "DEROUICHE",
      email: "hatem.derouiche@ooredoo.tn",
      phone: "20200019",
      role: Role.USER,
    },
    {
      firstName: "Jaouhar",
      lastName: "AZIZI",
      email: "jaouhar.azizi@ooredoo.tn",
      phone: "20200020",
      role: Role.USER,
    },
    {
      firstName: "Faouzi",
      lastName: "HIDOURI",
      email: "faouzi.hidouri@ooredoo.tn",
      phone: "20200021",
      role: Role.USER,
    },
    {
      firstName: "Moncef",
      lastName: "FOURATI",
      email: "moncef.fourati@ooredoo.tn",
      phone: "20200022",
      role: Role.USER,
    },
    {
      firstName: "Salim",
      lastName: "TRABELSI",
      email: "salim.trabelsi@ooredoo.tn",
      phone: "20200023",
      role: Role.USER,
    },
    {
      firstName: "Mohamed",
      lastName: "JMAL",
      email: "mohamed.jmal@ooredoo.tn",
      phone: "20200024",
      role: Role.USER,
    },
    {
      firstName: "Wassim",
      lastName: "BEN SLIMANE",
      email: "wassim.benslimane@ooredoo.tn",
      phone: "20200025",
      role: Role.USER,
    },
    {
      firstName: "Kamel",
      lastName: "MOUSSA",
      email: "kamel.moussa@ooredoo.tn",
      phone: "20200026",
      role: Role.USER,
    },
    {
      firstName: "Slim",
      lastName: "CHARFI",
      email: "slim.charfi@ooredoo.tn",
      phone: "20200027",
      role: Role.USER,
    },
    {
      firstName: "Majdi",
      lastName: "BEJAOUI",
      email: "majdi.bejaoui@ooredoo.tn",
      phone: "20200028",
      role: Role.USER,
    },
    {
      firstName: "Asma",
      lastName: "EL AYEB",
      email: "asma.elayeb@ooredoo.tn",
      phone: "20200029",
      role: Role.USER,
    },
    {
      firstName: "Raja",
      lastName: "BOUZIRI",
      email: "raja.bouziri@ooredoo.tn",
      phone: "20200030",
      role: Role.USER,
    },
    {
      firstName: "Mouna",
      lastName: "SMATI",
      email: "mouna.smati@ooredoo.tn",
      phone: "20200031",
      role: Role.USER,
    },
    {
      firstName: "Abdelkader",
      lastName: "CHEBL",
      email: "abdelkader.chebl@ooredoo.tn",
      phone: "20200032",
      role: Role.USER,
    },
    {
      firstName: "Mondher",
      lastName: "SMAOUI",
      email: "mondher.smaoui@ooredoo.tn",
      phone: "20200033",
      role: Role.USER,
    },
    {
      firstName: "Riadh",
      lastName: "BETTIOUR",
      email: "riadh.bettiour@ooredoo.tn",
      phone: "20200034",
      role: Role.USER,
    },
    {
      firstName: "Narjes",
      lastName: "JEBARA",
      email: "narjes.jebara@ooredoo.tn",
      phone: "20200035",
      role: Role.USER,
    },
    {
      firstName: "Najet",
      lastName: "JERIDI",
      email: "najet.jeridi@ooredoo.tn",
      phone: "20200036",
      role: Role.USER,
    },
    {
      firstName: "Rim",
      lastName: "HAMZAOUI",
      email: "rim.hamzaoui@ooredoo.tn",
      phone: "20200037",
      role: Role.USER,
    },
    {
      firstName: "Malek",
      lastName: "AISSA",
      email: "malek.aissa@ooredoo.tn",
      phone: "20200038",
      role: Role.USER,
    },
    {
      firstName: "Jamel",
      lastName: "BEN SAIDANE",
      email: "jamel.bensaidane@ooredoo.tn",
      phone: "20200039",
      role: Role.USER,
    },
    {
      firstName: "Lina",
      lastName: "DAKHLI",
      email: "lina.dakhli@ooredoo.tn",
      phone: "20200040",
      role: Role.USER,
    },
    {
      firstName: "Emna",
      lastName: "JAIDANE",
      email: "emna.jaidane@ooredoo.tn",
      phone: "20200041",
      role: Role.USER,
    },
    {
      firstName: "Badereddine",
      lastName: "KHEMIRI",
      email: "badereddine.khmiri@ooredoo.tn",
      phone: "20200042",
      role: Role.USER,
    },
    {
      firstName: "Sarra",
      lastName: "MOUSSA",
      email: "sarra.moussa@ooredoo.tn",
      phone: "20200043",
      role: Role.USER,
    },
    {
      firstName: "Ramzi",
      lastName: "OMRI",
      email: "ramzi.omri@ooredoo.tn",
      phone: "20200044",
      role: Role.USER,
    },
    {
      firstName: "Rim",
      lastName: "FERTANI",
      email: "rim.fertani@ooredoo.tn",
      phone: "20200045",
      role: Role.USER,
    },
    {
      firstName: "Mourad",
      lastName: "NEMRI",
      email: "mourad.nemri@ooredoo.tn",
      phone: "20200046",
      role: Role.USER,
    },
    {
      firstName: "Najla",
      lastName: "GHOUAIBI",
      email: "najla.ghouaibi@ooredoo.tn",
      phone: "20200047",
      role: Role.USER,
    },
    {
      firstName: "Hamdi",
      lastName: "HAMMOUDA",
      email: "hamdi.hammouda@ooredoo.tn",
      phone: "20200048",
      role: Role.USER,
    },
    {
      firstName: "Anis",
      lastName: "LAAMOURI",
      email: "anis.laamouri@ooredoo.tn",
      phone: "20200049",
      role: Role.USER,
    },
    {
      firstName: "Achref",
      lastName: "SALAH",
      email: "achref.salah@ooredoo.tn",
      phone: "20200050",
      role: Role.USER,
    },
    {
      firstName: "Amine",
      lastName: "JIED",
      email: "amine.jied@ooredoo.tn",
      phone: "20200051",
      role: Role.USER,
    },
    {
      firstName: "Houcine",
      lastName: "SEBTAOUI",
      email: "houcine.sebtaoui4@huawei.com",
      phone: "20200052",
      role: Role.USER,
    },
    {
      firstName: "Helmi",
      lastName: "TLICH",
      email: "helmi.tlich@ooredoo.tn",
      phone: "20200053",
      role: Role.USER,
    },
    {
      firstName: "Sami",
      lastName: "SELMANE",
      email: "sami.selmane@ooredoo.tn",
      phone: "20200054",
      role: Role.USER,
    },
  ];

  let successCount = 0;
  let errorCount = 0;
  let existingCount = 0;

  for (const person of users) {
    const result = await createUser({
      email: person.email,
      password: "ooredoo",
      firstName: person.firstName,
      lastName: person.lastName,
      phone: person.phone,
      role: person.role,
    });

    if (result) {
      if (result.createdAt.getTime() < Date.now() - 1000) {
        existingCount++;
      } else {
        successCount++;
      }
    } else {
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ ${successCount} nouveaux utilisateurs créés`);
  console.log(`⚠️  ${existingCount} utilisateurs existants ignorés`);
  console.log(`❌ ${errorCount} erreurs rencontrées`);
  console.log("=".repeat(60));
  console.log("\n📋 Récapitulatif :");
  console.log(`   • Total d'utilisateurs traités : ${users.length}`);
  console.log(`   • CMT (Crisis Management Team) : 14 membres`);
  console.log(`   • OPT (Operational Team) : 40 membres`);
  console.log(`   • Mot de passe par défaut : ooredoo`);
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error("Erreur inattendue :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
