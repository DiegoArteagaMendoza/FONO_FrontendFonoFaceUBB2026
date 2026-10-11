import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth/auth';
import { PortalMedicoService } from '../services/portal-medico/portal-medico';
import { PmClienteService } from '../services/portal-medico/pm-cliente';
import { IdentidadPortal } from './interface/solo-visitantes.interface';

/**
 * Exige que la identidad indicada tenga la sesión iniciada para entrar a la
 * ruta; si no, redirige a su login.
 *
 * Es el reverso de soloVisitantes (mismo archivo de identidades). Sin esto,
 * escribir a mano la URL de una pantalla del panel la renderizaba igual: las
 * peticiones fallaban con 401 y el interceptor terminaba echando a la persona,
 * pero por el camino se veía la interfaz vacía y mensajes de error sueltos, que
 * parecen un fallo de la aplicación en vez de una sesión ausente.
 *
 * Esto NO sustituye a los permisos del backend, que son la autoridad real: es
 * una guarda de interfaz para no mostrar pantallas que no se pueden usar.
 *
 * Se guarda la URL pedida en 'volverA' para regresar allí tras iniciar sesión,
 * en vez de dejar a la persona siempre en el inicio del panel.
 */
export function requiereSesion(identidad: IdentidadPortal): CanActivateFn {
  return (_ruta, estado: RouterStateSnapshot) => {
    const router = inject(Router);

    const alLogin = (destino: string) =>
      router.createUrlTree([destino], { queryParams: { volverA: estado.url } });

    switch (identidad) {
      case 'admin': {
        const authService = inject(AuthService);
        return authService.estaAutenticado() ? true : alLogin('/login');
      }

      case 'profesional': {
        const portalMedicoService = inject(PortalMedicoService);
        return portalMedicoService.estaAutenticadoComoProfesional()
          ? true
          : alLogin('/portalmedico/login');
      }

      case 'paciente': {
        const pmClienteService = inject(PmClienteService);
        return pmClienteService.estaAutenticadoComoCliente()
          ? true
          : alLogin('/portalmedico/login');
      }

      case 'portalMedico': {
        // Basta cualquiera de las dos sesiones del portal médico.
        const portalMedicoService = inject(PortalMedicoService);
        const pmClienteService = inject(PmClienteService);

        return portalMedicoService.estaAutenticadoComoProfesional()
          || pmClienteService.estaAutenticadoComoCliente()
          ? true
          : alLogin('/portalmedico/login');
      }
    }
  };
}
