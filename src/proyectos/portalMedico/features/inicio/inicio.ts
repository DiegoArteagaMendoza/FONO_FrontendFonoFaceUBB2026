import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';

import { PortalMedicoLandingComponent } from './landing/landing';
import { PmPanelProfesionalComponent } from './panel-profesional/panel-profesional';
import { PmClienteProximaHoraComponent } from './proxima-hora/proxima-hora';

/**
 * /portalmedico/inicio: la misma ruta para todos, tres pantallas distintas.
 *
 * Quien llega sin sesión ve la landing que explica el portal. Quien ya entró no
 * necesita que le expliquen qué es: el fonoaudiólogo ve su panel de trabajo y
 * el paciente, cuándo es su próxima hora. Se mantiene una sola ruta a propósito,
 * porque "Inicio" y el logo de la barra son un único enlace y cada quien espera
 * que lo lleve a lo suyo.
 *
 * El orden de precedencia (profesional > paciente > visitante) es el mismo que
 * usa la navbar, para que las dos coincidan si alguien tiene las dos sesiones
 * abiertas en el mismo navegador.
 */
@Component({
  selector: 'app-pm-inicio',
  standalone: true,
  imports: [
    CommonModule,
    PortalMedicoLandingComponent,
    PmPanelProfesionalComponent,
    PmClienteProximaHoraComponent
  ],
  templateUrl: './inicio.html'
})
export class PortalMedicoInicioComponent {
  public portalMedicoService = inject(PortalMedicoService);
  public pmClienteService = inject(PmClienteService);
}
