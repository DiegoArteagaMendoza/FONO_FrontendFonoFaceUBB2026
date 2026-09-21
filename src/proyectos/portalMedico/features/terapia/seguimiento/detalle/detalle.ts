import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmTerapiaService } from '@core/services/portal-medico/pm-terapia';
import {
  PlanSeguimiento,
  PeriodoCerrado,
  VideoProgreso
} from '@core/services/portal-medico/interface/pm-terapia.interface';
import { TextosService } from '@core/services/textos/textos';

import { EdicionRetro } from './interface/detalle.interface';

/**
 * Detalle del seguimiento de un paciente: el plan, los periodos cerrados con
 * lo que faltó en cada uno, y los videos por fecha con la caja de
 * retroalimentación bajo cada uno.
 *
 * La retroalimentación se edita en el sitio, video por video: es el gesto
 * central de esta pantalla y no merece un formulario aparte.
 */
@Component({
  selector: 'app-pm-seguimiento-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalle.html'
})
export class PmSeguimientoDetalleComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  private portalMedicoService = inject(PortalMedicoService);
  private pmTerapiaService = inject(PmTerapiaService);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  plan: PlanSeguimiento | null = null;
  videos: VideoProgreso[] = [];
  cargando = true;
  errorMensaje: string | null = null;

  /** Edición por video, indexada por id_video. */
  ediciones = new Map<number, EdicionRetro>();

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }

    const idPlan = Number(this.ruta.snapshot.paramMap.get('id'));
    if (!idPlan) {
      this.volver();
      return;
    }

    forkJoin({
      plan: this.pmTerapiaService.getSeguimiento(idPlan),
      videos: this.pmTerapiaService.getVideosDelPlan(idPlan)
    }).subscribe({
      next: ({ plan, videos }) => {
        this.plan = plan;
        this.videos = videos;
        videos.forEach(v => this.ediciones.set(v.id_video, {
          texto: v.retroalimentacion ?? '', guardando: false, error: null, guardado: false
        }));
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

  // ---------------------------------------------------------------------
  // Presentación
  // ---------------------------------------------------------------------

  get titulo(): string {
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.detalle_titulo, {
      paciente: this.plan?.paciente_nombre ?? ''
    });
  }

  get textoPlanDesde(): string {
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.plan_desde, {
      inicio: this.fechaLegible(this.plan?.fecha_inicio ?? '')
    });
  }

  get textoPeriodoActual(): string {
    if (!this.plan) return '';
    const textos = this.t().pm_seguimiento;
    const { desde, hasta } = this.plan.periodo_actual;
    if (desde === hasta) {
      return this.textosService.reemplazarVariables(textos.periodo_actual_dia, { desde: this.fechaLegible(desde) });
    }
    return this.textosService.reemplazarVariables(textos.periodo_actual, {
      desde: this.fechaLegible(desde), hasta: this.fechaLegible(hasta)
    });
  }

  textoPeriodicidad(): string {
    if (!this.plan) return '';
    return this.t().pm_seguimiento[`periodicidad_${this.plan.periodicidad}` as 'periodicidad_DIARIA'];
  }

  /** "Periodo 3", contando desde 1 como lo leería una persona. */
  nombrePeriodo(numero: number): string {
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.periodo_nombre, {
      numero: (numero + 1) + ''
    });
  }

  rangoPeriodo(periodo: PeriodoCerrado): string {
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.periodo_rango, {
      desde: this.fechaLegible(periodo.desde), hasta: this.fechaLegible(periodo.hasta)
    });
  }

  textoFaltan(periodo: PeriodoCerrado): string {
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.periodo_faltan, {
      ejercicios: periodo.faltan.join(', ')
    });
  }

  textoVence(video: VideoProgreso): string {
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.video_vence, {
      dias: video.dias_restantes + ''
    });
  }

  textoRetroGuardada(video: VideoProgreso): string {
    if (!video.fecha_retroalimentacion) return '';
    return this.textosService.reemplazarVariables(this.t().pm_seguimiento.retro_guardada, {
      fecha: new Date(video.fecha_retroalimentacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })
    });
  }

  /** La fecha viene como AAAA-MM-DD (día en Chile); se lee como día local, sin zona. */
  private fechaLegible(iso: string): string {
    if (!iso) return '';
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
  }

  // ---------------------------------------------------------------------
  // Retroalimentación
  // ---------------------------------------------------------------------

  edicionDe(video: VideoProgreso): EdicionRetro {
    let edicion = this.ediciones.get(video.id_video);
    if (!edicion) {
      edicion = { texto: video.retroalimentacion ?? '', guardando: false, error: null, guardado: false };
      this.ediciones.set(video.id_video, edicion);
    }
    return edicion;
  }

  /** Solo se ofrece guardar cuando el texto cambió respecto de lo guardado. */
  hayCambios(video: VideoProgreso): boolean {
    return this.edicionDe(video).texto.trim() !== (video.retroalimentacion ?? '').trim();
  }

  alEscribir(video: VideoProgreso): void {
    const edicion = this.edicionDe(video);
    edicion.guardado = false;
    edicion.error = null;
  }

  guardarRetro(video: VideoProgreso): void {
    const edicion = this.edicionDe(video);
    edicion.guardando = true;
    edicion.error = null;
    edicion.guardado = false;

    this.pmTerapiaService.retroalimentar(video.id_video, edicion.texto.trim()).subscribe({
      next: (actualizado) => {
        this.videos = this.videos.map(v => v.id_video === actualizado.id_video ? actualizado : v);
        edicion.texto = actualizado.retroalimentacion ?? '';
        edicion.guardando = false;
        edicion.guardado = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        edicion.guardando = false;
        edicion.error = this.pmTerapiaService.extraerMensajeError(err, this.t().pm_seguimiento.retro_error);
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------

  volver(): void {
    this.router.navigate(['/portalmedico/seguimiento']);
  }

  /** Al formulario del plan, que lo carga por la cita de origen. */
  ajustarPlan(): void {
    if (!this.plan?.cita_origen) return;
    this.router.navigate(['/portalmedico/terapia/plan'], { queryParams: { cita: this.plan.cita_origen } });
  }
}
