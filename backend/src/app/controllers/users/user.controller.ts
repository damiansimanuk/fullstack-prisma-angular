import { Body, Controller, Get, Path, Post, Put, Query, Delete } from 'tsoa'
import { Route, SuccessResponse, Security, Tags } from 'tsoa'
import { UpdateUserDto, CreateUserDto } from '../../dtos'
import { userService } from '../../services'

@Route('api/v1/users')
@Tags('Users')
export class UsersController extends Controller {
  @Get('{id}')
  @Security('jwt')
  public getUserDetail(@Path() id: number) {
    return userService.getUserDetail(id)
  }

  @Put('{id}')
  @Security('jwt', ['userAdmin', 'users:update'])
  public async updateUser(@Path() id: number, @Body() item: UpdateUserDto) {
    return await userService.updateUser(id, item)
  }

  @Get('')
  @Security('jwt', ['userAdmin', 'users:read'])
  public async getUserList(@Query() page = 1, @Query() perPage = 100, @Query() isActive?: boolean) {
    return userService.getUserList(page, perPage, isActive)
  }

  /**
   * Hola mundo
   */
  @SuccessResponse('201', 'Created')
  @Post()
  @Security('jwt', ['userAdmin', 'users:create'])
  public async createUser(@Body() requestBody: CreateUserDto) {
    this.setStatus(201)
    return userService.createUser(requestBody)
  }

  @Delete('{id}')
  @Security('jwt', ['userAdmin', 'users:delete'])
  public async deleteUser(@Path() id: number): Promise<void> {
    return userService.deleteUser(id)
  }
}
