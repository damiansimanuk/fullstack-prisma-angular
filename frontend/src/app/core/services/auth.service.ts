import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserDetailDto } from 'src/app/shared/shared.dto';

export interface IToken {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private storageKeyToken = 'token';
  private storageAaccessToken = 'accessToken';
  private storageUser = 'userDetail';
  private intervalTimeout: any = null;
  private userDetail: UserDetailDto | null;
  private token: IToken | null;

  constructor(private router: Router, private http: HttpClient) {
    const tokenStr = localStorage.getItem(this.storageKeyToken);
    this.token = tokenStr ? <IToken>JSON.parse(tokenStr) : null;
    const userDetailStr = localStorage.getItem(this.storageUser);
    this.userDetail = userDetailStr ? <UserDetailDto>JSON.parse(userDetailStr) : null;
    this.refeshToken();
    this.intervalTimeout = setInterval(this.refeshToken.bind(this), 60000);
  }

  ngOnDestroy(): void {
    if (this.intervalTimeout) {
      clearInterval(this.intervalTimeout);
    }
  }

  public isLoading = false;

  get isLogged() {
    return !!this.userDetail;
  }

  private async refeshToken() {
    if (!this.token) {
      return;
    }

    try {
      const newAccessToken = await this.http
        .post<IToken>(`/auth/refresh_token`, { refreshToken: this.token.refreshToken })
        .toPromise();

      this.token = {
        refreshToken: this.token.refreshToken,
        accessToken: newAccessToken.accessToken
      };

      localStorage.setItem(this.storageKeyToken, JSON.stringify(this.token));
      localStorage.setItem(this.storageAaccessToken, this.token.accessToken);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status == 401) {
        console.log(
          'El RefeshTocken es invalido. Se requiere login. Http Status:',
          e.status,
          e.statusText
        );
        this.logout();
        return;
      } else {
        console.log('refeshTocken Error:', e);
        throw e;
      }
    }

    // Update user if need
    if (!this.isLogged) {
      await this.getUserDetail();
    }
  }

  async logIn(credentials: { username: string; password: string }) {
    try {
      this.isLoading = true;
      const token = await this.http.post<IToken>(`/auth/login`, credentials).toPromise();

      console.log('Successful login, token:', token);
      this.token = token;
      localStorage.setItem(this.storageKeyToken, JSON.stringify(this.token));
      localStorage.setItem(this.storageAaccessToken, this.token.accessToken);
      await this.getUserDetail();
    } finally {
      this.isLoading = false;
    }
  }

  get user() {
    return this.userDetail;
  }

  get roles(): string[] {
    return this.isLogged ? this.userDetail?.roles.map((r) => r.code) ?? [] : [];
  }

  get permissions() {
    return this.isLogged ? this.userDetail?.permissions.map((p) => p.code) ?? [] : [];
  }

  private async getUserDetail() {
    try {
      this.isLoading = true;
      this.userDetail = await this.http.get<UserDetailDto>(`/auth/me`).toPromise();
      localStorage.setItem(this.storageUser, JSON.stringify(this.userDetail));
    } finally {
      this.isLoading = false;
    }
  }

  logout(): void {
    if (this.isLogged) {
      this.http.get(`/auth/logout?refreshToken=${this.token?.refreshToken}`);
    }

    localStorage.removeItem(this.storageUser);
    localStorage.removeItem(this.storageKeyToken);
    localStorage.removeItem(this.storageAaccessToken);
    this.userDetail = null;
    this.token = null;
    this.router.navigate(['/login']);
  }

  validatePermissions(scopes: string[]): boolean {
    if (!this.isLogged) {
      return false;
    }

    // El admin puede ver todos los items del menu
    if (this.roles?.includes('admin')) {
      return true;
    }

    if (scopes && scopes.length > 0) {
      const hasScope = scopes.find((s) => this.permissions?.includes(s) || this.roles?.includes(s));
      return !!hasScope;
    }
    return true;
  }
}
