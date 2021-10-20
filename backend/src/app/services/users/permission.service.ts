import { CreatePermissionDto, UpdatePermissionDto } from '../../dtos'
import { prisma } from '../../models'
import { NotFoundError } from '../../errors/message.error'

class PermissionService {
  async getPermissionDetail(id: number) {
    const permission = await prisma.permission.findFirst({
      where: {
        permissionId: id
      }
    })

    if (!permission) {
      throw new NotFoundError('Permission not found!')
    }

    return permission
  }

  async updatePermission(id: number, data: UpdatePermissionDto) {
    const permission = await prisma.permission.update({
      where: { permissionId: id },
      data
    })

    if (!permission) {
      throw new NotFoundError('Permission not found!')
    }

    return permission
  }

  async getPermissionList(page = 1, perPage = 100, username?: string, isActive?: boolean) {
    const skip = perPage * (page - 1)

    const where = {
      isActive: isActive || undefined,
      roles: {
        some: {
          users: {
            some: {
              username: username || undefined
            }
          }
        }
      }
    }

    const rowsAndCount = await prisma.$transaction([
      prisma.permission.findMany({ skip: skip, take: perPage, where }),
      prisma.permission.count({ where })
    ])

    const rows = rowsAndCount[0]
    const total = rowsAndCount[1]

    return { rows, page, perPage, total }
  }

  async createPermission(data: CreatePermissionDto) {
    return await prisma.permission.create({ data })
  }

  async deletePermission(permissionId: number) {
    return await prisma.permission.delete({ where: { permissionId } })
  }
}

export const permissionService = new PermissionService()
