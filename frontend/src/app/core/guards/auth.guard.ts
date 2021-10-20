import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const scopes: string[] = route.data.scopes;

    if (!this.authService.isLogged) {
      this.router.navigate(['/login'], { queryParams: { redirect: state.url } });
      return false;
    }

    if (!this.authService.validatePermissions(scopes)) {
      const urlTitle = route.data.title || 'la url solicitada';
      console.log({
        severity: 'warn',
        summary: `No tiene permisos para ingresar a ${urlTitle}`
      });

      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
