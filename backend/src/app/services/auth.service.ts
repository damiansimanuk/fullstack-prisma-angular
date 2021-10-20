import { prisma } from '../models'
import { NotFoundError, UnauthorizedError } from '../errors/message.error'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../../config'

export interface IAuthData {
  id: number
  username: string
  fullName: string
  permissions: string[]
  roles: string[]
}

class AuthService {
  private _refreshTokens: string[] = []

  getPasswordHash(pass: string) {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(pass, salt)
  }

  veryfyPassword(passwordHash: string | null, password: string) {
    return !passwordHash || passwordHash == '' || bcrypt.compareSync(password, passwordHash)
  }

  async getUser(username: string, password: string): Promise<IAuthData> {
    const user = await prisma.user.findFirst({
      where: { username: username },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    })

    if (!user || !this.veryfyPassword(user.passwordHash, password)) {
      throw new UnauthorizedError('Username or password are Invalid!')
    }

    const permissions = user.roles.flatMap((g) => g.permissions).filter((p) => !!p)

    return {
      id: user.userId,
      username: user.username,
      fullName: user.fullName,
      permissions: permissions?.map((p) => p.code),
      roles: user.roles?.map((g) => g.code)
    }
  }

  async getUserById(id: number): Promise<IAuthData> {
    const user = await prisma.user.findUnique({
      where: { userId: id },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundError('User not found!')
    }

    const permissions = user.roles.flatMap((g) => g.permissions).filter((p) => !!p)

    return {
      id: user.userId,
      username: user.username,
      fullName: user.fullName,
      permissions: permissions?.map((p) => p.code),
      roles: user.roles?.map((g) => g.code)
    }
  }

  validatePermissions(user: IAuthData, scopes?: string[], username: string | null = null): boolean {
    if (user.roles?.includes('admin')) {
      return true
    }
    if (username && user.username == username) {
      return true
    }
    if (scopes && scopes.length > 0) {
      const hasScope = scopes.find((s) => user.permissions?.includes(s) || user.roles?.includes(s))
      return !!hasScope
    }
    return !!user
  }

  public async login(
    username: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.getUser(username, password)

    // generate an access token
    const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
      expiresIn: '20m'
    })

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET)

    this._refreshTokens.push(refreshToken)

    return {
      accessToken,
      refreshToken
    }
  }

  public async changePassword(
    userId: number,
    oldpassword: string,
    newpassword: string
  ): Promise<number> {
    const user = await prisma.user.findFirst({ where: { userId: userId } })

    if (!user || !this.veryfyPassword(user.passwordHash, oldpassword)) {
      throw new UnauthorizedError('Old password are invalid!')
    }

    const updatedUser = await prisma.user.update({
      where: { userId: userId },
      data: { passwordHash: this.getPasswordHash(newpassword) }
    })

    return updatedUser.userId
  }

  public async getAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (!this._refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedError('Invalid Token!')
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, {
      complete: true
    }) as unknown as { payload: IAuthData }
    const userId = decoded.payload?.id

    const user = await this.getUserById(userId)

    // generate an access token
    const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
      expiresIn: '20m'
    })

    return { accessToken }
  }

  public logout(refreshToken): void {
    this._refreshTokens = this._refreshTokens.filter((t) => t !== refreshToken)
  }
}

export const authService = new AuthService()
