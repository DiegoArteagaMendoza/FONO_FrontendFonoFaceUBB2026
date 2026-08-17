import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth';
import { PortalMedicoService } from '../services/portal-medico/portal-medico';
import { PmClienteService } from '../services/portal-medico/pm-cliente';

/** Las tres identidades que conviven en la aplicación */
export type IdentidadPortal = 'admin' | 'profesional' | 'paciente';

/**
 * Impide entrar a las pantallas de acceso (login / registro) cuando esa misma
 * identidad ya tiene la sesión iniciada, y redirige a su página principal.
 *
 * Sin esto, alguien con sesión activa podía volver al formulario escribiendo la
 * URL y "volver a entrar", lo que además dejaba el botón en estado de carga si
 * las credenciales no coincidían con la sesión vigente.
 *
 * Cada identidad se evalúa por separado a propósito: un paciente autenticado sí
 * puede llegar al login de profesional (son cuentas distintas) y viceversa.
 */
export function soloVisitantes(identidad: IdentidadPortal): CanActivateFn {
  return () => {
    const router = inject(Router);

    switch (identidad) {
      case 'admin': {
        const authService = inject(AuthService);
        return authService.estaAutenticado()
          ? router.createUrlTree(['/administracion/inicio'])
          : true;
      }

      case 'profesional': {
        const portalMedicoService = inject(PortalMedicoService);
        return portalMedicoService.estaAutenticadoComoProfesional()
          ? router.createUrlTree(['/portalmedico/perfil'])
          : true;
      }

      case 'paciente': {
        const pmClienteService = inject(PmClienteService);
        return pmClienteService.estaAutenticadoComoCliente()
          ? router.createUrlTree(['/portalmedico/paciente/video'])
          : true;
      }
    }
  };
}
