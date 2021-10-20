import { Controller, Get, Path, Delete, Post, Put } from 'tsoa'
import { Body, Query, Route, SuccessResponse, Security, Tags } from 'tsoa'
import { CreateRoleDto, UpdateRoleDto } from '../../dtos'
import { roleService } from '../../services'

@Route('api/v1/users/roles')
@Tags('Users')
export class RoleController extends Controller {
  @Get('{id}')
  @Security('jwt', ['userAdmin', 'roles:read'])
  public async getRoleDetail(@Path() id: number) {
    return await roleService.getRoleDetail(id)
  }

  @Put('{id}')
  @Security('jwt', ['userAdmin', 'roles:update'])
  public async updateRole(@Path() id: number, @Body() item: UpdateRoleDto) {
    return await roleService.updateRole(id, item)
  }

  @Get()
  @Security('jwt', ['userAdmin', 'roles:read'])
  public async getRoleList(@Query() page = 1, @Query() perPage = 100, @Query() isActive?: boolean) {
    return await roleService.getRoleList(page, perPage, isActive)
  }

  @Post()
  @SuccessResponse('201', 'Created')
  @Security('jwt', ['userAdmin', 'roles:create'])
  public async createRole(@Body() item: CreateRoleDto) {
    this.setStatus(201)
    return await roleService.createRole(item)
  }

  @Delete('{id}')
  @Security('jwt', ['userAdmin', 'roles:delete'])
  public async deleteRole(@Path() id: number) {
    return await roleService.deleteRole(id)
  }
}
