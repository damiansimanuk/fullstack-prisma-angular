import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './user/user-list/user-list.component';
import { GenericTableComponent } from './generic-table/generic-table.component';
import { RoleListComponent } from './user/role-list/role-list.component';

@NgModule({
  declarations: [UserListComponent, GenericTableComponent, RoleListComponent],
  imports: [CommonModule]
})
export class DemoCrudModule {}
