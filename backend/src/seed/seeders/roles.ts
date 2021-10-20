import { PrismaClient } from '@prisma/client'
import { permissions } from './permissions'

const roles = [
  {
    code: 'admin',
    description: 'Administrator',
    // The admin role not need find permission
    permissions: []
  },
  {
    code: 'viewer',
    description: 'Visualizacion',
    permissions: permissions
      .filter((p) => p.code.endsWith(':read'))
      .map((p) => {
        return { code: p.code }
      })
  },
  {
    code: 'userAdmin',
    description: 'Administrador de Usuario y grupos',
    permissions: permissions
      .filter((p) => p.code.startsWith('users:') || p.code.startsWith('roles:'))
      .map((p) => {
        return { code: p.code }
      })
  }
]

export async function insertRoles(prisma: PrismaClient) {
  const role = await prisma.role.findFirst({ where: { code: roles[0].code } })

  if (!role) {
    console.log('Insert Roles')
    const rolesPerms = roles.flatMap((r) =>
      r.permissions.map((p) => {
        return {
          code: r.code,
          permName: p.code
        }
      })
    )

    await prisma.$transaction(
      roles.map((r) => prisma.role.create({ data: { code: r.code, description: r.description } }))
    )

    await prisma.$transaction(
      rolesPerms.map((r) =>
        prisma.role.update({
          where: {
            code: r.code
          },
          data: {
            permissions: {
              connect: {
                code: r.permName
              }
            }
          }
        })
      )
    )
  }
}
