export type CreatePermissionDto = {
  code: string
  description: string
}

export type UpdatePermissionDto = {
  description?: string
  isActive?: boolean
}
