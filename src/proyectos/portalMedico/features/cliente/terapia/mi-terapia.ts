import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { PmTerapiaService } from '@core/services/portal-medico/pm-terapia';
import {
  PlanTerapia,
  PlanEjercicio,
  VideoProgreso
} from '@core/services/portal-medico/interface/pm-terapia.interface';
import { ResultadoValidacionVideo } from '@core/services/portal-medico/interface/pm-cliente.interface';
import {
  PROGRESO_DURACION_MAXIMA_SEGUNDOS,
  PROGRESO_TAMANO_MAXIMO_MB,
  PROGRESO_DIAS_VIGENCIA
} from '@core/services/portal-medico/constants/pm-terapia.const';
import { VIDEO_EXTENSIONES_PERMITIDAS } from '@core/services/portal-medico/constants/pm-cliente.const';
import { TextosService } from '@core/services/textos/textos';

import { SubidaEnCurso, HistorialPlan } from './interface/mi-terapia.interface';

/**
 * Mi terapia: el plan del paciente y sus videos de progreso.
 *
 * Por cada plan activo (normalmente uno): el fonoaudiólogo, la periodicidad,
 * el periodo en curso, las indicaciones, y una tarjeta por ejercicio con el
 * video de ejemplo, el estado del periodo (enviado / falta) y el botón para
 * subir. Debajo, el historial de videos con la retroalimentación.
 *
 * La subida se abre sobre un ejercicio a la vez: el formulario aparece en su
 * propia tarjeta, con el nombre del ejercicio, para que no haya duda de a cuál
 * responde el video.
 */
@Component({
  selector: 'app-pmc-mi-terapia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  mensajeExito: string | null = null;

  /** Historial por plan, indexado por id_plan. */
  historiales = new Map<number, HistorialPlan>();

  /** Solo un formulario de subida abierto a la vez. */
  subida: SubidaEnCurso | null = null;

  readonly duracionMaxima = PROGRESO_DURACION_MAXIMA_SEGUNDOS;
  readonly pesoMaximo = PROGRESO_TAMANO_MAXIMO_MB;
  readonly diasVigencia = PROGRESO_DIAS_VIGENCIA;
  readonly formatos = VIDEO_EXTENSIONES_PERMITIDAS;

  ngOnInit(): void {
    if (!this.pmClienteService.estaAutenticadoComoCliente()) {
      this.router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } });
      return;
    }
    this.cargarPlanes();
  }

  // ---------------------------------------------------------------------
  // Carga
  // ---------------------------------------------------------------------

  private cargarPlanes(): void {
    this.pmTerapiaService.getMisPlanesComoPaciente().subscribe({
      next: (planes) => {
        this.planes = planes;
        this.cargando = false;
        planes.forEach(plan => this.cargarHistorial(plan.id_plan));
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

  private cargarHistorial(idPlan: number): void {
    this.historiales.set(idPlan, { videos: [], cargando: true, error: null });

    this.pmTerapiaService.getVideosDeMiPlan(idPlan).subscribe({
      next: (videos) => {
        this.historiales.set(idPlan, { videos, cargando: false, error: null });
        this.cdr.detectChanges();
      },
      error: () => {
        this.historiales.set(idPlan, { videos: [], cargando: false, error: this.t().pmc_terapia.error_historial });
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Tras subir o quitar, el estado "enviado / falta" de cada ejercicio puede
   * cambiar, y eso lo calcula el backend: se vuelve a pedir el plan.
   */
  private refrescarPlan(idPlan: number): void {
    this.pmTerapiaService.getMisPlanesComoPaciente().subscribe({
      next: (planes) => {
        this.planes = planes;
        this.cargarHistorial(idPlan);
        this.cdr.detectChanges();
      },
      error: () => this.cargarHistorial(idPlan)
    });
  }

  historialDe(plan: PlanTerapia): HistorialPlan {
    return this.historiales.get(plan.id_plan) ?? { videos: [], cargando: true, error: null };
  }

  // ---------------------------------------------------------------------
  // Presentación del plan
  // ---------------------------------------------------------------------

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

  // ---------------------------------------------------------------------
  // Subida
  // ---------------------------------------------------------------------

  abrirSubida(plan: PlanTerapia, pe: PlanEjercicio): void {
    this.mensajeExito = null;
    this.subida = {
      idPlan: plan.id_plan,
      idPlanEjercicio: pe.id_plan_ejercicio,
      nombreEjercicio: pe.ejercicio.nombre,
      archivo: null,
      duracionSegundos: null,
      tamanoMb: null,
      comentario: '',
      enviando: false,
      error: null
    };
  }

  cerrarSubida(): void {
    this.subida = null;
  }

  subidaAbiertaPara(pe: PlanEjercicio): boolean {
    return this.subida?.idPlanEjercicio === pe.id_plan_ejercicio;
  }

  get tituloSubida(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_terapia.subir_titulo, {
      ejercicio: this.subida?.nombreEjercicio ?? ''
    });
  }

  get textoAyudaVideo(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_terapia.ayuda_video, {
      segundos: this.duracionMaxima + '',
      peso: this.pesoMaximo + '',
      formatos: this.formatos.join(', '),
      dias: this.diasVigencia + ''
    });
  }

  /** Mismas reglas que el resto de los videos, con los topes del progreso. */
  async alElegirVideo(evento: Event): Promise<void> {
    if (!this.subida) return;
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.subida.error = null;
    this.subida.archivo = null;
    this.subida.duracionSegundos = null;
    this.subida.tamanoMb = null;

    if (!archivo) {
      this.cdr.detectChanges();
      return;
    }

    const revision = await this.pmClienteService.validarArchivoDeVideo(archivo, {
      duracionMaximaSegundos: this.duracionMaxima,
      tamanoMaximoMb: this.pesoMaximo
    });

    if (!revision.valido) {
      this.subida.error = this.mensajeDeMotivo(revision);
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.subida.archivo = archivo;
    this.subida.duracionSegundos = revision.duracionSegundos ?? null;
    this.subida.tamanoMb = revision.tamanoMb ?? null;
    this.cdr.detectChanges();
  }

  private mensajeDeMotivo(revision: ResultadoValidacionVideo): string {
    const textos = this.t().pmc_terapia;

    switch (revision.motivo) {
      case 'formato':
        return this.textosService.reemplazarVariables(textos.alerta_video_formato, {
          formatos: this.formatos.join(', ')
        });
      case 'peso':
        return this.textosService.reemplazarVariables(textos.alerta_video_peso, {
          peso: (revision.tamanoMb ?? 0) + '', maximo: this.pesoMaximo + ''
        });
      case 'duracion':
        return this.textosService.reemplazarVariables(textos.alerta_video_duracion, {
          duracion: (revision.duracionSegundos ?? 0) + '', maximo: this.duracionMaxima + ''
        });
      default:
        return textos.alerta_video_ilegible;
    }
  }

  enviarVideo(): void {
    const subida = this.subida;
    if (!subida) return;

    if (!subida.archivo || subida.duracionSegundos === null) {
      subida.error = this.t().pmc_terapia.alerta_video_req;
      return;
    }

    subida.enviando = true;
    subida.error = null;

    const datos = new FormData();
    datos.append('id_plan_ejercicio', subida.idPlanEjercicio + '');
    datos.append('video', subida.archivo);
    datos.append('duracion_segundos', subida.duracionSegundos + '');
    if (subida.comentario.trim()) {
      datos.append('comentario', subida.comentario.trim());
    }

    this.pmTerapiaService.subirVideoProgreso(subida.idPlan, datos).subscribe({
      next: () => {
        this.subida = null;
        this.mensajeExito = this.t().pmc_terapia.exito_subir;
        this.refrescarPlan(subida.idPlan);
        this.cdr.detectChanges();
      },
      error: (err) => {
        subida.enviando = false;
        subida.error = this.pmTerapiaService.extraerMensajeError(err, this.t().pmc_terapia.error_subir);
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Historial
  // ---------------------------------------------------------------------

  textoPeriodo(video: VideoProgreso): string {
    return this.textosService.reemplazarVariables(this.t().pmc_terapia.historial_periodo, {
      numero: (video.numero_periodo + 1) + ''
    });
  }

  textoVence(video: VideoProgreso): string {
    return this.textosService.reemplazarVariables(this.t().pmc_terapia.historial_vence, {
      dias: video.dias_restantes + ''
    });
  }

  quitarVideo(plan: PlanTerapia, video: VideoProgreso): void {
    if (!confirm(this.t().pmc_terapia.confirmar_quitar)) return;

    this.mensajeExito = null;
    this.errorMensaje = null;

    this.pmTerapiaService.eliminarMiVideoProgreso(video.id_video).subscribe({
      next: () => {
        this.mensajeExito = this.t().pmc_terapia.exito_quitar;
        this.refrescarPlan(plan.id_plan);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMensaje = this.pmTerapiaService.extraerMensajeError(err, this.t().pmc_terapia.error_quitar);
        this.cdr.detectChanges();
      }
    });
  }

  irAReservar(): void {
    this.router.navigate(['/portalmedico/paciente/citas/reservar']);
  }
}
