import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { PmTerapiaService } from '@core/services/portal-medico/pm-terapia';
import { PlanTerapia, PlanEjercicio } from '@core/services/portal-medico/interface/pm-terapia.interface';
import { TextosService } from '@core/services/textos/textos';

/**
 * Mi terapia: lo que el paciente con sesión ve de su plan.
 *
 * Por cada plan activo (normalmente uno): el fonoaudiólogo, cada cuánto debe
 * reportar, en qué periodo está, sus indicaciones generales, y una tarjeta por
 * ejercicio con el video de ejemplo y las instrucciones. En esta entrega es
 * solo lectura; la subida del video de progreso llega en la siguiente.
 */
@Component({
  selector: 'app-pmc-mi-terapia',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mi-terapia.html'
})
export class PmClienteMiTerapiaComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  private pmClienteService = inject(PmClienteService);
  private pmTerapiaService = inject(PmTerapiaService);
  private router = inject(Router);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  planes: PlanTerapia[] = [];
  cargando = true;
  errorMensaje: string | null = null;

  ngOnInit(): void {
    if (!this.pmClienteService.estaAutenticadoComoCliente()) {
      this.router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } });
      return;
    }

    this.pmTerapiaService.getMisPlanesComoPaciente().subscribe({
      next: (planes) => {
        this.planes = planes;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = this.pmTerapiaService.extraerMensajeError(
          err, this.t().pmc_terapia.error_servidor
        );
        this.cdr.detectChanges();
      }
    });
  }

  textoConProfesional(plan: PlanTerapia): string {
    return this.textosService.reemplazarVariables(this.t().pmc_terapia.con_profesional, {
      profesional: plan.profesional_nombre
    });
  }

  textoPeriodicidad(plan: PlanTerapia): string {
    const textos = this.t().pmc_terapia;
    const etiqueta = textos[`periodicidad_${plan.periodicidad}` as 'periodicidad_DIARIA'];
    return this.textosService.reemplazarVariables(textos.periodicidad, { periodicidad: etiqueta });
  }

  /**
   * "Del 1 al 7 de septiembre", o solo "hoy" cuando el plan es diario: un
   * rango de un día leído como rango confunde.
   */
  textoPeriodoActual(plan: PlanTerapia): string {
    const textos = this.t().pmc_terapia;
    const { desde, hasta } = plan.periodo_actual;

    if (desde === hasta) {
      return this.textosService.reemplazarVariables(textos.periodo_actual_dia, {
        desde: this.fechaLegible(desde)
      });
    }
    return this.textosService.reemplazarVariables(textos.periodo_actual, {
      desde: this.fechaLegible(desde),
      hasta: this.fechaLegible(hasta)
    });
  }

  /** La fecha viene como AAAA-MM-DD (día en Chile); se lee como día local, sin zona. */
  private fechaLegible(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
  }

  tieneIndicacion(pe: PlanEjercicio): boolean {
    return !!pe.indicaciones && pe.indicaciones.trim().length > 0;
  }

  irAReservar(): void {
    this.router.navigate(['/portalmedico/paciente/citas/reservar']);
  }
}
