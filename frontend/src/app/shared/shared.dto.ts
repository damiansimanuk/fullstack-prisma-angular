import { paths } from '../../../../backend/src/generated/schema';

export type UserListDto =
  paths['/api/v1/users']['get']['responses']['200']['content']['application/json'];

export type UserListQueryDto = paths['/api/v1/users']['get']['parameters']['query'];

export type UserCreateDto =
  paths['/api/v1/users']['post']['requestBody']['content']['application/json'];

export type UserUpdateDto =
  paths['/api/v1/users/{id}']['put']['requestBody']['content']['application/json'];

export type UserDetailDto =
  paths['/api/v1/users/{id}']['get']['responses']['200']['content']['application/json'];

export type RoleListDto =
  paths['/api/v1/users/roles']['get']['responses']['200']['content']['application/json'];

export type RoleListQueryDto = paths['/api/v1/users/roles']['get']['parameters']['query'];
