export type CreateRoleDto = {
  code: string
  description: string
  permissions?: { code: string }[]
}

export type UpdateRoleDto = {
  description?: string
  isActive?: boolean
  permissions?: { code: string }[]
}
