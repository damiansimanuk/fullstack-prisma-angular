import { Component, OnInit } from '@angular/core';
import { UserListDto } from 'src/app/shared/shared.dto';
import { ColumnDefinition } from '../../generic-table/models';
import { UserService } from '../service/user.service';

type RowModel = UserListDto['rows'][0];

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  columns: ColumnDefinition<RowModel>[] = [
    {
      header: 'Identificacion',
      field: 'username'
    },
    {
      header: 'Nombre',
      field: 'fullName'
    },
    {
      header: 'Email',
      field: 'email'
    }
  ];

  data: RowModel[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.userService.getUserList().subscribe((res) => (this.data = res.rows));
  }
}
