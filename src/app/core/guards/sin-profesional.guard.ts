import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PortalMedicoService } from '../services/portal-medico/portal-medico';

/**
 * Cierra al fonoaudiólogo autenticado las pantallas que están dirigidas a los
 * pacientes, y lo devuelve a su inicio.
 *
 * El caso que la motiva es el directorio: es la vitrina donde un paciente busca
 * con quién atenderse, no una herramienta del profesional, así que no tiene
 * nada que hacer ahí mirando la lista de sus colegas. Ocultar el enlace de la
 * barra no basta, porque la URL se puede escribir a mano.
 *
 * A cualquier otro —visitante o paciente— lo deja pasar: son justamente el
 * público de estas pantallas.
 */
export const sinProfesional: CanActivateFn = () => {
  const router = inject(Router);
  const portalMedicoService = inject(PortalMedicoService);

  return portalMedicoService.estaAutenticadoComoProfesional()
    ? router.createUrlTree(['/portalmedico/inicio'])
    : true;
};
