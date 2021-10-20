import { PrismaClient } from '@prisma/client'
import { insertRoles } from './seeders/roles'
import { insertPermissions } from './seeders/permissions'
import { insertUsers } from './seeders/users'

const prisma = new PrismaClient()

export async function seed() {
  await insertPermissions(prisma)
  await insertRoles(prisma)
  await insertUsers(prisma)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect()
  })
