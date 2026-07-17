import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth';

/**
 * Interceptor de autenticación:
 * Si el backend responde 401 o 403 a una petición que llevaba token (Authorization),
 * significa que la sesión expiró o dejó de ser válida. En ese caso limpiamos la
 * sesión y redirigimos al login con un aviso.
 *
 * Nota: solo actúa sobre peticiones que llevaban el header Authorization, para no
 * interferir con el login (un 401 ahí es "credenciales incorrectas") ni con los
 * endpoints públicos del portal.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const esPeticionAutenticada = req.headers.has('Authorization');
      const sesionInvalida = err.status === 401 || err.status === 403;

      if (esPeticionAutenticada && sesionInvalida) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { expirada: '1' } });
      }

      return throwError(() => err);
    })
  );
};
