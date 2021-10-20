import { Component, OnInit } from '@angular/core';
import { RoleListDto } from 'src/app/shared/shared.dto';
import { ColumnDefinition } from '../../generic-table/models';
import { UserService } from '../service/user.service';

type RowModel = RoleListDto['rows'][0];

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  columns: ColumnDefinition<RowModel>[] = [
    {
      header: 'Code',
      field: 'code'
    },
    {
      header: 'Description',
      field: 'description'
    }
  ];

  data: RowModel[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.userService.getRoleList().subscribe((res) => (this.data = res.rows));
  }
}
