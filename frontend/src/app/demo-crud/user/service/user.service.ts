import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  RoleListDto,
  UserListDto,
  UserListQueryDto,
  RoleListQueryDto
} from 'src/app/shared/shared.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  public getUserList(params: UserListQueryDto = {}) {
    return this.http.get<UserListDto>('/users', { params });
  }

  public getRoleList(params: RoleListQueryDto = {}) {
    return this.http.get<RoleListDto>('/users/roles', { params });
  }
}
