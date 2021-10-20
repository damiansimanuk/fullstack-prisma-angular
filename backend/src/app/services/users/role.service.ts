import { CreateRoleDto, UpdateRoleDto } from '../../dtos'
import { prisma } from '../../models'
import { NotFoundError } from '../../errors/message.error'

class RoleService {
  async getRoleDetail(id: number) {
    const role = await prisma.role.findFirst({
      where: {
        roleId: id
      },
      include: {
        permissions: { select: { code: true, description: true } }
      }
    })

    if (!role) {
      throw new NotFoundError('Role not found!')
    }

    return role
  }

  async updateRole(id: number, item: UpdateRoleDto) {
    const role = await prisma.role.update({
      where: { roleId: id },
      data: {
        description: item.description || undefined,
        isActive: item.isActive || undefined
      },
      include: {
        permissions: { select: { code: true } }
      }
    })

    if (item.permissions) {
      const permissions = item.permissions.map((p) => p.code)
      const permissionsCurrent = role.permissions.map((p) => p.code)
      const toDelete = permissionsCurrent.filter((p) => !permissions.includes(p))
      const toInsert = permissions.filter((p) => !permissionsCurrent.includes(p))

      const prismaToDisconnect = toDelete.map((p) =>
        prisma.role.update({
          where: { roleId: id },
          data: { permissions: { disconnect: { code: p } } }
        })
      )

      const prismaToConnect = toInsert.map((p) =>
        prisma.role.update({
          where: { roleId: id },
          data: { permissions: { connect: { code: p } } }
        })
      )

      await prisma.$transaction([...prismaToDisconnect, ...prismaToConnect])
    }

    return await this.getRoleDetail(id)
  }

  async getRoleList(page = 1, perPage = 100, isActive = true) {
    const skip = perPage * (page - 1)

    const rowsAndCount = await prisma.$transaction([
      prisma.role.findMany({
        skip: skip,
        take: perPage,
        where: { isActive: isActive },
        include: {
          permissions: { select: { code: true } }
        }
      }),
      prisma.role.count({ where: { isActive: isActive } })
    ])

    const rows = rowsAndCount[0]
    const total = rowsAndCount[1]
    return { rows, page, perPage, total }
  }

  async createRole(data: CreateRoleDto) {
    const connectPermissions = data.permissions?.map((p) => {
      return { code: p.code }
    })

    const role = await prisma.role.create({
      data: {
        code: data.code,
        description: data.description,
        permissions: {
          connect: connectPermissions
        }
      },
      include: {
        permissions: { select: { code: true } }
      }
    })

    return role
  }

  async deleteRole(id: number) {
    return await prisma.role.delete({ where: { roleId: id } })
  }
}

export const roleService = new RoleService()
