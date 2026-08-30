import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import {
  VideoSeguimiento,
  ResultadoValidacionVideo
} from '@core/services/portal-medico/interface/pm-cliente.interface';
import {
  VIDEO_DURACION_MAXIMA_SEGUNDOS,
  VIDEO_TAMANO_MAXIMO_MB,
  VIDEO_EXTENSIONES_PERMITIDAS,
  VIDEO_DIAS_VIGENCIA
} from '@core/services/portal-medico/constants/pm-cliente.const';
import { PmCitaService } from '@core/services/portal-medico/pm-cita';
import { CitaSeguimiento } from '@core/services/portal-medico/interface/pm-cita.interface';
import {
  CITA_HORAS_MINIMAS_ANTICIPACION,
  CITA_REPROGRAMACIONES_MAXIMAS
} from '@core/services/portal-medico/constants/pm-cita.const';
import { TextosService } from '@core/services/textos/textos';

import { AccionSeguimiento } from './interface/seguimiento.interface';
import { LARGO_CODIGO } from './constants/seguimiento.const';

/**
 * Consulta y gestión de una hora con el código que llegó por correo.
 *
 * Es la vía para quien reservó sin cuenta: no tiene sesión con la que
 * identificarse, así que el código hace de credencial. El enlace del correo
 * llega con ?codigo=..., y en ese caso la búsqueda se lanza sola para que no
 * haya que copiarlo a mano; el formulario queda igualmente para escribirlo.
 */
@Component({
  selector: 'app-pmc-seguimiento-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './seguimiento.html'
})
export class PmClienteSeguimientoCitaComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmCitaService = inject(PmCitaService);
  public pmClienteService = inject(PmClienteService);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  formBuscar: FormGroup;
  formPosponer: FormGroup;
  formCancelar: FormGroup;

  cita: CitaSeguimiento | null = null;
  buscando = false;
  errorBusqueda: string | null = null;

  accion: AccionSeguimiento = null;
  procesando = false;
  errorAccion: string | null = null;
  mensajeExito: string | null = null;

  readonly largoCodigo = LARGO_CODIGO;
  readonly horasAnticipacion = CITA_HORAS_MINIMAS_ANTICIPACION;
  readonly reprogramacionesMaximas = CITA_REPROGRAMACIONES_MAXIMAS;

  minimoFechaHora = this.pmCitaService.minimoParaAgendar();

  // Video de síntomas adjunto a esta hora. Se admite uno solo, igual que en el
  // backend, así que 'videos' tiene cero o un elemento en la práctica.
  videos: VideoSeguimiento[] = [];
  archivoVideo: File | null = null;
  duracionVideo: number | null = null;
  tamanoVideoMb: number | null = null;
  descripcionVideo = '';
  subiendoVideo = false;
  errorVideo: string | null = null;
  mensajeVideo: string | null = null;

  constructor() {
    this.formBuscar = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(LARGO_CODIGO)]]
    });
    this.formPosponer = this.fb.group({
      fecha_hora: ['', [Validators.required]],
      motivo: ['']
    });
    this.formCancelar = this.fb.group({ motivo: [''] });
  }

  ngOnInit(): void {
    // El enlace del correo trae el código; si viene, se busca directo.
    const codigo = this.ruta.snapshot.queryParamMap.get('codigo');
    if (codigo) {
      this.formBuscar.patchValue({ codigo: codigo.toUpperCase() });
      this.buscar();
    }
  }

  // ---------------------------------------------------------------------
  // Búsqueda
  // ---------------------------------------------------------------------

  get codigoActual(): string {
    return (this.formBuscar.value.codigo || '').trim().toUpperCase();
  }

  get textoAyudaCodigo(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.ayuda_codigo, {
      largo: this.largoCodigo + ''
    });
  }

  /** Se escribe siempre en mayúsculas, que es como viaja el código. */
  normalizarCodigo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const enMayusculas = input.value.toUpperCase().replace(/\s/g, '');
    if (input.value !== enMayusculas) {
      input.value = enMayusculas;
      this.formBuscar.patchValue({ codigo: enMayusculas }, { emitEvent: false });
    }
  }

  buscar(): void {
    if (this.formBuscar.invalid) {
      this.formBuscar.markAllAsTouched();
      return;
    }

    this.buscando = true;
    this.errorBusqueda = null;
    this.mensajeExito = null;
    this.cita = null;

    // Lo del video pertenece a la hora que se estaba viendo, no a la nueva: sin
    // esto, el error del archivo anterior sigue en pantalla sobre otra cita.
    this.videos = [];
    this.errorVideo = null;
    this.mensajeVideo = null;
    this.limpiarSeleccionVideo();

    this.pmCitaService.getPorCodigo(this.codigoActual).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.buscando = false;
        this.cargarVideos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.buscando = false;
        this.errorBusqueda = err.status === 404
          ? this.t().pmc_seguimiento.error_no_encontrado
          : this.pmCitaService.extraerMensajeError(err, this.t().pmc_seguimiento.error_servidor);
        this.cdr.detectChanges();
      }
    });
  }

  consultarOtro(): void {
    this.cita = null;
    this.accion = null;
    this.errorBusqueda = null;
    this.mensajeExito = null;
    this.videos = [];
    this.errorVideo = null;
    this.mensajeVideo = null;
    this.limpiarSeleccionVideo();
    this.formBuscar.reset({ codigo: '' });
  }

  // ---------------------------------------------------------------------
  // Presentación
  // ---------------------------------------------------------------------

  get textoTermina(): string {
    if (!this.cita) return '';
    const fin = new Date(this.cita.fecha_hora);
    fin.setMinutes(fin.getMinutes() + this.cita.duracion_minutos);
    const dos = (n: number) => `${n}`.padStart(2, '0');
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.termina_a_las, {
      hora: `${dos(fin.getHours())}:${dos(fin.getMinutes())}`
    });
  }

  get textoReprogramada(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.reprogramada_veces, {
      veces: (this.cita?.veces_reprogramada ?? 0) + '',
      maximas: this.reprogramacionesMaximas + ''
    });
  }

  get textoCambiosCerrados(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.cambios_cerrados, {
      horas: this.horasAnticipacion + ''
    });
  }

  get textoSinReprogramaciones(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.sin_reprogramaciones, {
      maximas: this.reprogramacionesMaximas + ''
    });
  }

  get textoRestantes(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.posponer_restantes, {
      restantes: (this.cita?.reprogramaciones_restantes ?? 0) + ''
    });
  }

  get textoAyudaNuevaFecha(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.ayuda_nueva_fecha, {
      horas: this.horasAnticipacion + ''
    });
  }

  get textoAlertaAnticipacion(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.alerta_anticipacion, {
      horas: this.horasAnticipacion + ''
    });
  }

  /** Activa pero fuera del margen: explica por qué no hay botones. */
  get cambiosCerrados(): boolean {
    return !!this.cita && this.cita.esta_activa && !this.cita.permite_cambios;
  }

  get sinReprogramaciones(): boolean {
    return !!this.cita && this.cita.permite_cambios && this.cita.reprogramaciones_restantes === 0;
  }

  get puedePosponer(): boolean {
    return !!this.cita && this.cita.permite_cambios && this.cita.reprogramaciones_restantes > 0;
  }

  get puedeCancelar(): boolean {
    return !!this.cita && this.cita.permite_cambios;
  }

  claseEstado(): string {
    if (!this.cita) return 'badge-pendiente';
    switch (this.cita.estado) {
      case 'RE': return 'badge-cita-reservada';
      case 'RZ': return 'badge-cita-realizada';
      default: return 'badge-cita-cancelada';
    }
  }

  // ---------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------

  abrirPosponer(): void {
    this.accion = 'posponer';
    this.errorAccion = null;
    this.mensajeExito = null;
    this.minimoFechaHora = this.pmCitaService.minimoParaAgendar();
    this.formPosponer.reset({ fecha_hora: '', motivo: '' });
  }

  abrirCancelar(): void {
    this.accion = 'cancelar';
    this.errorAccion = null;
    this.mensajeExito = null;
    this.formCancelar.reset({ motivo: '' });
  }

  cerrarAccion(): void {
    this.accion = null;
    this.errorAccion = null;
    this.procesando = false;
  }

  get faltaAnticipacion(): boolean {
    return this.pmCitaService.faltaAnticipacion(this.formPosponer.get('fecha_hora')?.value);
  }

  confirmarPosponer(): void {
    if (!this.cita) return;
    if (this.formPosponer.invalid || this.faltaAnticipacion) {
      this.formPosponer.markAllAsTouched();
      return;
    }

    this.procesando = true;
    this.errorAccion = null;
    const valores = this.formPosponer.value;

    this.pmCitaService.posponerPorCodigo(this.cita.codigo_seguimiento, {
      fecha_hora: this.pmCitaService.aIsoDesdeInputLocal(valores.fecha_hora),
      motivo: valores.motivo || ''
    }).subscribe({
      next: (actualizada) => {
        this.procesando = false;
        this.cita = actualizada;
        this.mensajeExito = this.textosService.reemplazarVariables(
          this.t().pmc_seguimiento.exito_posponer,
          { fecha: this.fechaLegible(actualizada.fecha_hora) }
        );
        this.cerrarAccion();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.procesando = false;
        this.errorAccion = this.pmCitaService.extraerMensajeError(
          err, this.t().pmc_seguimiento.error_posponer
        );
        this.cdr.detectChanges();
      }
    });
  }

  confirmarCancelar(): void {
    if (!this.cita) return;

    this.procesando = true;
    this.errorAccion = null;

    this.pmCitaService.cancelarPorCodigo(this.cita.codigo_seguimiento, {
      motivo: this.formCancelar.value.motivo || ''
    }).subscribe({
      next: (actualizada) => {
        this.procesando = false;
        this.cita = actualizada;
        this.mensajeExito = this.t().pmc_seguimiento.exito_cancelar;
        this.cerrarAccion();
        this.cargarVideos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.procesando = false;
        this.errorAccion = this.pmCitaService.extraerMensajeError(
          err, this.t().pmc_seguimiento.error_cancelar
        );
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Video de síntomas
  // --------------------------------------------------------------------
  // Quien reservó sin cuenta no tiene sesión con la que subirlo desde la
  // pantalla de videos, así que lo hace aquí, con el mismo código que ya usó
  // para llegar. Se admite uno solo por hora, igual que en el backend.
  // ---------------------------------------------------------------------

  /** Solo tiene sentido ofrecerlo si la hora sigue en pie y admite video. */
  get admiteVideo(): boolean {
    return !!this.cita && this.cita.esta_activa && this.cita.permite_carga_video;
  }

  get tieneVideo(): boolean {
    return this.videos.length > 0;
  }

  get textoAyudaVideo(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.video_ayuda, {
      segundos: VIDEO_DURACION_MAXIMA_SEGUNDOS + '',
      peso: VIDEO_TAMANO_MAXIMO_MB + '',
      formatos: VIDEO_EXTENSIONES_PERMITIDAS.join(', ')
    });
  }

  get textoPrivacidadVideo(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.video_privacidad, {
      dias: VIDEO_DIAS_VIGENCIA + ''
    });
  }

  get textoVenceVideo(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_seguimiento.video_adjunto_vence, {
      dias: (this.videos[0]?.dias_restantes ?? 0) + ''
    });
  }

  private cargarVideos(): void {
    if (!this.cita || !this.admiteVideo) {
      this.videos = [];
      this.cdr.detectChanges();
      return;
    }

    this.pmClienteService.getVideosPorCodigo(this.codigoActual).subscribe({
      next: (videos) => {
        this.videos = videos;
        this.cdr.detectChanges();
      },
      // Sin el listado se sigue pudiendo subir: el backend rechaza el duplicado.
      error: () => this.cdr.detectChanges()
    });
  }

  async alElegirVideo(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.errorVideo = null;
    this.archivoVideo = null;
    this.duracionVideo = null;
    this.tamanoVideoMb = null;

    if (!archivo) {
      this.cdr.detectChanges();
      return;
    }

    const revision = await this.pmClienteService.validarArchivoDeVideo(archivo);

    if (!revision.valido) {
      this.errorVideo = this.mensajeDeMotivoVideo(revision);
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.archivoVideo = archivo;
    this.duracionVideo = revision.duracionSegundos ?? null;
    this.tamanoVideoMb = revision.tamanoMb ?? null;
    this.cdr.detectChanges();
  }

  private mensajeDeMotivoVideo(revision: ResultadoValidacionVideo): string {
    const textos = this.t().pmc_seguimiento;

    switch (revision.motivo) {
      case 'formato':
        return this.textosService.reemplazarVariables(textos.video_error_formato, {
          formatos: VIDEO_EXTENSIONES_PERMITIDAS.join(', ')
        });
      case 'peso':
        return this.textosService.reemplazarVariables(textos.video_error_peso, {
          peso: (revision.tamanoMb ?? 0) + '', maximo: VIDEO_TAMANO_MAXIMO_MB + ''
        });
      case 'duracion':
        return this.textosService.reemplazarVariables(textos.video_error_duracion, {
          duracion: (revision.duracionSegundos ?? 0) + '', maximo: VIDEO_DURACION_MAXIMA_SEGUNDOS + ''
        });
      default:
        return textos.video_error_ilegible;
    }
  }

  enviarVideo(): void {
    if (!this.archivoVideo || this.duracionVideo === null) {
      this.errorVideo = this.t().pmc_seguimiento.video_error_req;
      return;
    }

    this.subiendoVideo = true;
    this.errorVideo = null;
    this.mensajeVideo = null;

    const datos = new FormData();
    datos.append('video', this.archivoVideo);
    datos.append('duracion_segundos', this.duracionVideo + '');
    if (this.descripcionVideo.trim()) {
      datos.append('descripcion', this.descripcionVideo.trim());
    }

    this.pmClienteService.subirVideoPorCodigo(this.codigoActual, datos).subscribe({
      next: () => {
        this.subiendoVideo = false;
        this.mensajeVideo = this.t().pmc_seguimiento.video_exito;
        this.limpiarSeleccionVideo();
        this.cargarVideos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.subiendoVideo = false;

        // 429: el límite de subidas por hora. Merece su propio mensaje, porque
        // "inténtalo nuevamente" invitaría justo a lo que se está frenando.
        this.errorVideo = err.status === 429
          ? this.t().pmc_seguimiento.video_error_demasiados
          : this.pmCitaService.extraerMensajeError(err, this.t().pmc_seguimiento.video_error_subir);

        this.cdr.detectChanges();
      }
    });
  }

  quitarVideo(): void {
    if (!confirm(this.t().pmc_seguimiento.video_confirmar_quitar)) return;

    this.errorVideo = null;
    this.mensajeVideo = null;

    this.pmClienteService.eliminarVideoPorCodigo(this.codigoActual).subscribe({
      next: () => {
        this.videos = [];
        this.mensajeVideo = this.t().pmc_seguimiento.video_exito_quitar;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorVideo = this.pmCitaService.extraerMensajeError(
          err, this.t().pmc_seguimiento.video_error_quitar
        );
        this.cdr.detectChanges();
      }
    });
  }

  private limpiarSeleccionVideo(): void {
    this.archivoVideo = null;
    this.duracionVideo = null;
    this.tamanoVideoMb = null;
    this.descripcionVideo = '';
  }

  private fechaLegible(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  irALogin(): void {
    this.router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } });
  }
}
