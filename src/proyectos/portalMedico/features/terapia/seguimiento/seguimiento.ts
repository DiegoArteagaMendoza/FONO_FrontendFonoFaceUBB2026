import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmTerapiaService } from '@core/services/portal-medico/pm-terapia';
import { PlanTerapia } from '@core/services/portal-medico/interface/pm-terapia.interface';
import { TextosService } from '@core/services/textos/textos';

import { FiltroSeguimiento } from './interface/seguimiento.interface';

/**
 * Seguimiento: los pacientes con plan de terapia y si van al día.
 *
 * Es la pantalla que el fonoaudiólogo revisa "en sus tiempos muertos": un
 * semáforo por paciente, con la fecha del último video, y un filtro para ver
 * solo a quienes van atrasados. El detalle con los videos y la
 * retroalimentación está a un clic.
 */
@Component({
  selector: 'app-pm-seguimiento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seguimiento.html'
})
export class PmSeguimientoComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  private portalMedicoService = inject(PortalMedicoService);
  private pmTerapiaService = inject(PmTerapiaService);
  private router = inject(Router);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  planes: PlanTerapia[] = [];
  cargando = true;
  errorMensaje: string | null = null;
  filtro: FiltroSeguimiento = 'todos';

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }

    this.pmTerapiaService.getMisPlanes().subscribe({
      next: (planes) => {
        // Los atrasados primero: son los que piden atención.
        this.planes = [...planes].sort((a, b) => Number(a.al_dia) - Number(b.al_dia));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = this.pmTerapiaService.extraerMensajeError(
          err, this.t().pm_seguimiento.error_servidor
        );
        this.cdr.detectChanges();
      }
    });
  }

  get visibles(): PlanTerapia[] {
    return this.filtro === 'atrasados' ? this.planes.filter(p => !p.al_dia) : this.planes;
  }

  get totalAtrasados(): number {
    return this.planes.filter(p => !p.al_dia).length;
  }

  cambiarFiltro(filtro: FiltroSeguimiento): void {
    this.filtro = filtro;
  }

  textoPeriodicidad(plan: PlanTerapia): string {
    return this.t().pm_seguimiento[`periodicidad_${plan.periodicidad}` as 'periodicidad_DIARIA'];
  }

  textoUltimoVideo(plan: PlanTerapia): string {
    if (!plan.ultimo_video) return this.t().pm_seguimiento.sin_videos;
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.ultimo_video, {
      fecha: new Date(plan.ultimo_video).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })
    });
  }

  verDetalle(plan: PlanTerapia): void {
    this.router.navigate(['/portalmedico/seguimiento', plan.id_plan]);
  }

  irALaAgenda(): void {
    this.router.navigate(['/portalmedico/agenda']);
  }
}
