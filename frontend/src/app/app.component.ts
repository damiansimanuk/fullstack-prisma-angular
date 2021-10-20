import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FSPA';

  constructor(private authService: AuthService) {}

  get isLogged() {
    return this.authService.isLogged;
  }

  get fullName() {
    return this.authService.user?.fullName;
  }

  onLogout() {
    this.authService.logout();
  }
}
