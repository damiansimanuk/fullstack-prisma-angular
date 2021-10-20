import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req;
    const url = request.url;
    const isAuthService = url.startsWith('/auth/');

    // replace base url
    if (!url.startsWith('http') && url.startsWith('/')) {
      const newUrl = `${baseUrl}${url}`;
      request = request.clone({ url: newUrl });
    }

    // add accessToken on request header
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      request = request.clone({
        setHeaders: {
          authorization: `Bearer ${accessToken}`
        }
      });
    }

    // handle error
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (isAuthService) {
          return throwError(error);
        }
        return this.handleError(error);
      })
    );
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    const detail = error?.error?.message
      ? error?.error?.message
      : 'Error al procesar la solicitud. Ver consola de desarrolladores para más información.';

    let summary = `Error al procesar la solicitud status:${error.status} ${error.statusText}`;

    switch (error.status) {
      case 401:
        summary = 'Usuario no Autenticado';
        break;
      case 403:
        summary = 'No tiene premisos para realizar esta solicitud';
        break;
      case 404:
        summary = 'La solicitud es inválida';
        break;
      case 500:
        summary = 'El servidor no pudo procesar dicha solicitud';
        break;
      case 422:
        summary = 'Los datos enviados en la solicitud son inválidos';
        break;
    }

    console.log({ severity: 'error', summary, detail });
    // this.messageService?.add({ severity: 'error', summary, detail, life: 10000 });

    return throwError(error);
  }
}
