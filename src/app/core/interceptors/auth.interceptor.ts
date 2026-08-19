import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth';
import { PortalMedicoService } from '../services/portal-medico/portal-medico';
import { PmClienteService } from '../services/portal-medico/pm-cliente';

/**
 * Interceptor de autenticación:
 * Si el backend responde 401 a una petición que llevaba token (Authorization),
 * significa que el token es inválido, expiró o el usuario detrás de él ya no
 * existe/está activo. Ahí sí la sesión dejó de ser válida: la limpiamos y
 * redirigimos al login con un aviso.
 *
 * Un 403, en cambio, significa "token válido, pero sin permiso para ESTA acción"
 * (por ejemplo, un administrador que no es superusuario intentando aprobar una
 * acreditación en el Portal Médico: ver Security.permissions.EsAdministradorMaximo
 * en el backend FonoAppPortalMedico). Ese caso NO debe cerrar la sesión: el usuario
 * sigue autenticado y puede seguir usando el resto del panel con normalidad. Por
 * eso un 403 se deja pasar tal cual para que el propio componente que hizo la
 * petición muestre el mensaje de "no tienes permisos" (ver PortalMedicoService.
 * extraerMensajeError, que ya sabe leer el 'detail' que devuelve DRF en estos casos).
 *
 * Nota: solo actúa sobre peticiones que llevaban el header Authorization, para no
 * interferir con el login (un 401 ahí es "credenciales incorrectas") ni con los
 * endpoints públicos del portal.
 *
 * Distingue de qué sesión era el token que falló comparándolo con lo guardado en
 * localStorage: el admin de FonoApp ('access_token'), el profesional del Portal
 * Médico ('pm_access_token') y el paciente ('pmc_access_token') son tres
 * identidades distintas que pueden convivir en el mismo navegador, así que cada
 * una se cierra y redirige a su propio login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const portalMedicoService = inject(PortalMedicoService);
  const pmClienteService = inject(PmClienteService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const authHeader = req.headers.get('Authorization');
      const sesionInvalida = err.status === 401;

      if (authHeader && sesionInvalida) {
        const token = authHeader.replace('Bearer ', '');
        const esSesionProfesional = token === localStorage.getItem('pm_access_token');
        const esSesionPaciente = token === localStorage.getItem('pmc_access_token');

        if (esSesionProfesional) {
          portalMedicoService.logoutProfesional();
          router.navigate(['/portalmedico/login'], { queryParams: { expirada: '1' } });
        } else if (esSesionPaciente) {
          pmClienteService.logoutCliente();
          router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente', expirada: '1' } });
        } else {
          authService.logout();
          router.navigate(['/login'], { queryParams: { expirada: '1' } });
        }
      }

      return throwError(() => err);
    })
  );
};
