import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

/**
 * Landing del Portal Médico: lo que ve quien llega SIN sesión. Con sesión
 * iniciada, el despachador de /portalmedico/inicio muestra en su lugar el panel
 * del profesional o la próxima hora del paciente, porque a quien ya entró esta
 * pantalla de captación no le sirve de nada.
 *
 * Explica en un solo lugar qué puede hacer cada uno de los dos públicos:
 *  - El fonoaudiólogo, a quien se invita a registrarse/loguearse.
 *  - Quien busca atención, a quien solo se le informa (sin cuenta ni modelo de
 *    "cliente": es una vista de solo lectura sobre el directorio público que
 *    ya existe).
 * Los conteos de profesionales/especialidades se leen de los mismos endpoints
 * públicos que ya consume el directorio (no se agregó backend nuevo).
 */
@Component({
  selector: 'app-pm-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html'
})
export class PortalMedicoLandingComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  totalProfesionales: number | null = null;
  totalEspecialidades: number | null = null;

  constructor(
    private portalMedicoService: PortalMedicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.portalMedicoService.getDirectorio().subscribe({
      next: (datos) => {
        this.totalProfesionales = datos.length;
        this.cdr.detectChanges();
      },
      error: () => {} // Las estadísticas son un plus: si fallan, simplemente no se muestran.
    });

    this.portalMedicoService.getEspecialidades().subscribe({
      next: (datos) => {
        this.totalEspecialidades = datos.length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
