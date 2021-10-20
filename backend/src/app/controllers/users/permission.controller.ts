import { Controller, Get, Path, Delete, Post, Put } from 'tsoa'
import { Body, Query, Route, SuccessResponse, Security, Tags } from 'tsoa'
import { permissionService } from '../../services'
import { CreatePermissionDto, UpdatePermissionDto } from '../../dtos'

@Route('api/v1/users/permissions')
@Tags('Users')
export class PermissionController extends Controller {
  @Get('{id}')
  @Security('jwt', ['permissions:read'])
  public async getPermissionDetail(@Path() id: number) {
    return await permissionService.getPermissionDetail(id)
  }

  @Put('{id}')
  @Security('jwt', ['permissions:update'])
  public async updatePermission(@Path() id: number, @Body() item: UpdatePermissionDto) {
    return await permissionService.updatePermission(id, item)
  }

  @Get('')
  @Security('jwt', ['permissions:read'])
  public async getPermissionList(
    @Query() page = 1,
    @Query() perPage = 100,
    @Query() username?: string,
    @Query() isActive?: boolean
  ) {
    return await permissionService.getPermissionList(page, perPage, username, isActive)
  }

  @SuccessResponse('201', 'Created')
  @Post()
  @Security('jwt', ['permissions:create'])
  public async createPermission(@Body() item: CreatePermissionDto) {
    this.setStatus(201)
    return await permissionService.createPermission(item)
  }

  @Delete('{id}')
  @Security('jwt', ['permissions:delete'])
  public async deletePermission(@Path() id: number) {
    return await permissionService.deletePermission(id)
  }
}
