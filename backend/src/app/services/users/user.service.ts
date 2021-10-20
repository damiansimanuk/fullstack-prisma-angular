import { UpdateUserDto, CreateUserDto } from '../../dtos'
import { prisma } from '../../models'
import { NotFoundError } from '../../errors/message.error'

class UserService {
  async getUserDetail(id: number) {
    const user = await prisma.user.findFirst({
      where: {
        userId: id
      },
      include: {
        roles: {
          select: {
            code: true,
            description: true,
            permissions: { select: { code: true, description: true } }
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundError('User not found!')
    }

    const permissions = user.roles.flatMap((g) => g.permissions)

    const roles = user.roles.map((r) => {
      return {
        code: r.code,
        description: r.description
      }
    })

    return { ...user, permissions, roles }
  }

  async updateUser(id: number, item: UpdateUserDto) {
    const data = { ...item, roles: undefined }

    const existUser = await this.getUserDetail(id)

    if (!existUser) {
      throw new NotFoundError('User not found!')
    }

    if (item.roles) {
      const roles = item.roles.map((p) => p.code)
      const rolesCurrent = existUser.roles.map((p) => p.code)
      const toDelete = rolesCurrent.filter((p) => !roles.includes(p))
      const toInsert = roles.filter((p) => !rolesCurrent.includes(p))

      const prismaToDisconnect = toDelete.map((p) =>
        prisma.user.update({
          where: { userId: id },
          data: { roles: { disconnect: { code: p } } }
        })
      )

      const prismaToConnect = toInsert.map((p) =>
        prisma.user.update({
          where: { userId: id },
          data: { roles: { connect: { code: p } } }
        })
      )

      await prisma.$transaction([...prismaToDisconnect, ...prismaToConnect])
    }

    return await prisma.user.update({ where: { userId: id }, data })
  }

  async getUserList(page = 1, perPage = 10, isActive = true) {
    const skip = perPage * (page - 1)

    const rowsAndCount = await prisma.$transaction([
      prisma.user.findMany({
        skip: skip,
        take: perPage,
        where: { isActive: isActive },
        include: { roles: { select: { code: true } } }
      }),
      prisma.user.count({ where: { isActive: isActive } })
    ])

    const rows = rowsAndCount[0].map((u) => {
      return {
        ...u,
        roles: u.roles.map((r) => r.code)
      }
    })
    const total = rowsAndCount[1]
    return { rows, page, perPage, total }
  }

  async createUser(data: CreateUserDto) {
    return await prisma.user.create({ data })
  }

  async deleteUser(userId: number) {
    await prisma.user.delete({ where: { userId } })
  }
}

export const userService = new UserService()
