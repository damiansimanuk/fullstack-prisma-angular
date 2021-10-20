import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleListComponent } from './demo-crud/user/role-list/role-list.component';
import { UserListComponent } from './demo-crud/user/user-list/user-list.component';
import { LoginComponent } from './login/login/login.component';

const routes: Routes = [
  {
    path: 'user-list',
    canActivate: [AuthGuard],
    component: UserListComponent
  },
  {
    path: 'role-list',
    canActivate: [AuthGuard],
    component: RoleListComponent
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
