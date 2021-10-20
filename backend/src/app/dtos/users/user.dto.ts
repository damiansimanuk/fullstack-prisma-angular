export type CreateUserDto = {
  username: string
  fullName: string
  email?: string
  address?: string
  phone?: string
  roles?: { code: string }[]
}

export type UpdateUserDto = {
  fullName?: string
  email?: string
  address?: string
  phone?: string
  isActive?: boolean
  roles?: { code: string }[]
}
