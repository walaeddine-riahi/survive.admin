
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const process = await prisma.process.findUnique({
    where: { id: '69ce773da48b9b0f6335c78f' }
  })
  console.log('PROCESS_DB_VALUE:', JSON.stringify(process, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
