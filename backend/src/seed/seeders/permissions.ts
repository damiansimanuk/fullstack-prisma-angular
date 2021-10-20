import { PrismaClient } from '@prisma/client'

export const permissions = [
  { code: 'users:create', description: 'Create Users' },
  { code: 'users:update', description: 'Update Users' },
  { code: 'users:read', description: 'Read Users' },
  { code: 'users:delete', description: 'Delete Users' },

  { code: 'roles:create', description: 'Create Roles' },
  { code: 'roles:update', description: 'Update Roles' },
  { code: 'roles:read', description: 'Read Roles' },
  { code: 'roles:delete', description: 'Delete Roles' },

  { code: 'permissions:create', description: 'Create Permissions' },
  { code: 'permissions:update', description: 'Update Permissions' },
  { code: 'permissions:read', description: 'Read Permissions' },
  { code: 'permissions:delete', description: 'Delete Permissions' }
]

export async function insertPermissions(prisma: PrismaClient) {
  const perm = await prisma.permission.findFirst({ where: { code: permissions[0].code } })

  if (!perm) {
    console.log('Insert Permission')
    await prisma.$transaction(permissions.map((p) => prisma.permission.create({ data: p })))
  }
}
