import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { VideoSintomas } from '@core/services/portal-medico/interface/pm-cliente.interface';
import { PmCitaService } from '@core/services/portal-medico/pm-cita';
import { Cita } from '@core/services/portal-medico/interface/pm-cita.interface';
import {
  CITA_HORAS_MINIMAS_ANTICIPACION,
  CITA_REPROGRAMACIONES_MAXIMAS
} from '@core/services/portal-medico/constants/pm-cita.const';
import { TextosService } from '@core/services/textos/textos';
import { environment } from '../../../../environments/environment';

import { AccionCita } from './interface/agenda.interface';

/**
 * Agenda del fonoaudiólogo: las citas que sus pacientes reservaron con él.
 *
 * El backend filtra por el token, así que aquí nunca se pide un id de
 * profesional: lo que llega ya es solo lo propio. Desde cada cita se puede
 * cancelar, reprogramar, marcarla como realizada y revisar los videos de
 * síntomas que el paciente le adjuntó.
 */
@Component({
  selector: 'app-pm-agenda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './agenda.html'
})
export class PmAgendaComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public portalMedicoService = inject(PortalMedicoService);
  public pmCitaService = inject(PmCitaService);

  private pmClienteService = inject(PmClienteService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  // App sin zone.js: hay que refrescar a mano tras cada respuesta HTTP.
  private cdr = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  cargando = true;
  soloProximas = true;

  errorMensaje: string | null = null;
  mensajeExito: string | null = null;

  /** True si la acreditación del profesional aún no está aprobada. */
  acreditacionPendiente = false;

  citaEnAccion: Cita | null = null;
  accion: AccionCita = null;
  procesando = false;
  errorAccion: string | null = null;

  formPosponer: FormGroup;
  formCancelar: FormGroup;

  /** Nombre del paciente por id, para no mostrar solo un número. */
  private nombresPaciente = new Map<number, string>();

  /** Videos adjuntos ya cargados, por id de cita. */
  videosPorCita = new Map<number, VideoSintomas[]>();
  citasConVideosAbiertos = new Set<number>();
  cargandoVideosDe: number | null = null;
  errorVideosDe: number | null = null;

  readonly horasAnticipacion = CITA_HORAS_MINIMAS_ANTICIPACION;
  readonly reprogramacionesMaximas = CITA_REPROGRAMACIONES_MAXIMAS;

  minimoFechaHora = this.pmCitaService.minimoParaAgendar();

  constructor() {
    this.formPosponer = this.fb.group({
      fecha_hora: ['', [Validators.required]],
      motivo: ['']
    });
    this.formCancelar = this.fb.group({
      motivo: ['']
    });
  }

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }
    this.revisarAcreditacion();
    this.cargarPacientes();
    this.cargarAgenda();
  }

  // ---------------------------------------------------------------------
  // Carga
  // ---------------------------------------------------------------------

  /**
   * Un profesional sin acreditación aprobada no aparece en el directorio, así
   * que nadie puede reservar con él y su agenda estará siempre vacía. Conviene
   * decírselo en vez de dejarlo mirando un listado en blanco.
   */
  private revisarAcreditacion(): void {
    const profesional = this.portalMedicoService.profesionalActual();
    if (!profesional) return;

    this.portalMedicoService.getEstadoAcreditacion(profesional.id_profesional).subscribe({
      next: (acreditacion) => {
        this.acreditacionPendiente = acreditacion.estado_verificacion_profesional !== 'APROBADO';
        this.cdr.detectChanges();
      },
      // Si no se puede consultar, no se muestra el aviso: la agenda es lo importante.
      error: () => this.cdr.detectChanges()
    });
  }

  private cargarPacientes(): void {
    this.pmClienteService.getClientesComoProfesional().subscribe({
      next: (clientes) => {
        clientes.forEach(cliente => {
          this.nombresPaciente.set(
            cliente.id_cliente,
            `${cliente.nombres_cliente} ${cliente.apellidos_clientes}`
          );
        });
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  cargarAgenda(): void {
    this.cargando = true;
    this.errorMensaje = null;

    this.pmCitaService.getAgenda(this.soloProximas).subscribe({
      next: (citas) => {
        this.citas = citas;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pm_agenda.error_servidor
        );
        this.cdr.detectChanges();
      }
    });
  }

  cambiarFiltro(soloProximas: boolean): void {
    if (this.soloProximas === soloProximas) return;

    this.soloProximas = soloProximas;
    this.cerrarAccion();
    this.mensajeExito = null;
    this.citasConVideosAbiertos.clear();
    this.cargarAgenda();
  }

  // ---------------------------------------------------------------------
  // Presentación
  // ---------------------------------------------------------------------

  nombrePacienteDe(cita: Cita): string {
    return this.nombresPaciente.get(cita.cliente)
      ?? this.textosService.reemplazarVariables(this.t().pm_agenda.paciente_numero, {
        id: cita.cliente + ''
      });
  }

  etiquetaEstado(cita: Cita): string {
    const textos = this.t().pm_agenda;
    switch (cita.estado) {
      case 'RE': return textos.estado_reservada;
      case 'RZ': return textos.estado_realizada;
      case 'CC': return textos.estado_cancelada_cliente;
      case 'CM': return textos.estado_cancelada_medico;
      default: return cita.estado;
    }
  }

  textoTermina(cita: Cita): string {
    const fin = this.pmCitaService.fechaHoraFin(cita);
    const dos = (n: number) => `${n}`.padStart(2, '0');
    return this.textosService.reemplazarVariables(this.t().pm_agenda.termina_a_las, {
      hora: `${dos(fin.getHours())}:${dos(fin.getMinutes())}`
    });
  }

  textoReprogramada(cita: Cita): string {
    return this.textosService.reemplazarVariables(this.t().pm_agenda.reprogramada_veces, {
      veces: cita.veces_reprogramada + '',
      maximas: this.reprogramacionesMaximas + ''
    });
  }

  get textoCambiosCerrados(): string {
    return this.textosService.reemplazarVariables(this.t().pm_agenda.cambios_cerrados, {
      horas: this.horasAnticipacion + ''
    });
  }

  get textoSinReprogramaciones(): string {
    return this.textosService.reemplazarVariables(this.t().pm_agenda.sin_reprogramaciones, {
      maximas: this.reprogramacionesMaximas + ''
    });
  }

  textoRestantes(cita: Cita): string {
    return this.textosService.reemplazarVariables(this.t().pm_agenda.posponer_restantes, {
      restantes: this.pmCitaService.reprogramacionesRestantes(cita) + ''
    });
  }

  cambiosCerrados(cita: Cita): boolean {
    return cita.esta_activa && !this.pmCitaService.permiteCambios(cita);
  }

  sinReprogramaciones(cita: Cita): boolean {
    return this.pmCitaService.permiteCambios(cita)
      && cita.veces_reprogramada >= this.reprogramacionesMaximas;
  }

  /** Cita activa cuya hora ya pasó: queda pendiente de cerrar. */
  pendienteDeCerrar(cita: Cita): boolean {
    return cita.esta_activa && cita.ya_paso;
  }

  // ---------------------------------------------------------------------
  // Videos adjuntos a la cita
  // ---------------------------------------------------------------------

  videosAbiertos(cita: Cita): boolean {
    return this.citasConVideosAbiertos.has(cita.id_cita);
  }

  videosDe(cita: Cita): VideoSintomas[] {
    return this.videosPorCita.get(cita.id_cita) ?? [];
  }

  alternarVideos(cita: Cita): void {
    if (this.citasConVideosAbiertos.has(cita.id_cita)) {
      this.citasConVideosAbiertos.delete(cita.id_cita);
      return;
    }

    this.citasConVideosAbiertos.add(cita.id_cita);

    // Solo se piden la primera vez; después se reutiliza lo ya cargado.
    if (this.videosPorCita.has(cita.id_cita)) return;

    this.cargandoVideosDe = cita.id_cita;
    this.errorVideosDe = null;

    this.pmCitaService.getVideosDeCita(cita.id_cita).subscribe({
      next: (videos) => {
        this.videosPorCita.set(cita.id_cita, videos);
        this.cargandoVideosDe = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoVideosDe = null;
        this.errorVideosDe = cita.id_cita;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * URL absoluta del archivo. El backend entrega la ruta relativa de MEDIA, que
   * cuelga del host del Portal Médico (otro puerto en desarrollo), no del host
   * que sirve el frontend.
   */
  urlVideo(video: VideoSintomas): string {
    if (/^https?:\/\//i.test(video.video)) return video.video;

    const origen = new URL(environment.apiUrlPortalMedicoVideos).origin;
    return `${origen}${video.video.startsWith('/') ? '' : '/'}${video.video}`;
  }

  textoVenceEn(video: VideoSintomas): string {
    return this.textosService.reemplazarVariables(this.t().pm_agenda.video_vence_en, {
      dias: video.dias_restantes + ''
    });
  }

  // ---------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------

  abrirPosponer(cita: Cita): void {
    this.citaEnAccion = cita;
    this.accion = 'posponer';
    this.errorAccion = null;
    this.mensajeExito = null;
    this.minimoFechaHora = this.pmCitaService.minimoParaAgendar();
    this.formPosponer.reset({ fecha_hora: '', motivo: '' });
  }

  abrirCancelar(cita: Cita): void {
    this.citaEnAccion = cita;
    this.accion = 'cancelar';
    this.errorAccion = null;
    this.mensajeExito = null;
    this.formCancelar.reset({ motivo: '' });
  }

  cerrarAccion(): void {
    this.citaEnAccion = null;
    this.accion = null;
    this.errorAccion = null;
    this.procesando = false;
  }

  esAccionAbierta(cita: Cita, accion: AccionCita): boolean {
    return this.citaEnAccion?.id_cita === cita.id_cita && this.accion === accion;
  }

  get faltaAnticipacionNueva(): boolean {
    return this.pmCitaService.faltaAnticipacion(this.formPosponer.get('fecha_hora')?.value);
  }

  confirmarPosponer(): void {
    const cita = this.citaEnAccion;
    if (!cita) return;

    if (this.formPosponer.invalid || this.faltaAnticipacionNueva) {
      this.formPosponer.markAllAsTouched();
      return;
    }

    this.procesando = true;
    this.errorAccion = null;

    const valores = this.formPosponer.value;

    this.pmCitaService.posponerComoProfesional(cita.id_cita, {
      fecha_hora: this.pmCitaService.aIsoDesdeInputLocal(valores.fecha_hora),
      motivo: valores.motivo || ''
    }).subscribe({
      next: (actualizada) => {
        this.procesando = false;
        this.reemplazarCita(actualizada);
        this.mensajeExito = this.textosService.reemplazarVariables(
          this.t().pm_agenda.exito_posponer,
          { fecha: this.fechaLegible(actualizada.fecha_hora) }
        );
        this.cerrarAccion();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.procesando = false;
        this.errorAccion = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pm_agenda.error_posponer
        );
        this.cdr.detectChanges();
      }
    });
  }

  confirmarCancelar(): void {
    const cita = this.citaEnAccion;
    if (!cita) return;

    this.procesando = true;
    this.errorAccion = null;

    this.pmCitaService.cancelarComoProfesional(cita.id_cita, {
      motivo: this.formCancelar.value.motivo || ''
    }).subscribe({
      next: (actualizada) => {
        this.procesando = false;
        this.mensajeExito = this.t().pm_agenda.exito_cancelar;
        this.cerrarAccion();
        this.recargarOReemplazar(actualizada);
      },
      error: (err) => {
        this.procesando = false;
        this.errorAccion = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pm_agenda.error_cancelar
        );
        this.cdr.detectChanges();
      }
    });
  }

  marcarRealizada(cita: Cita): void {
    if (!confirm(this.t().pm_agenda.confirmar_realizada)) return;

    this.errorMensaje = null;
    this.mensajeExito = null;

    this.pmCitaService.marcarRealizada(cita.id_cita).subscribe({
      next: (actualizada) => {
        this.mensajeExito = this.t().pm_agenda.exito_realizada;
        this.recargarOReemplazar(actualizada);
      },
      error: (err) => {
        this.errorMensaje = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pm_agenda.error_realizada
        );
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Con el filtro de próximas activo, una cita cancelada o realizada ya no
   * pertenece al listado: se recarga para que salga de la vista en vez de
   * quedar mostrando un estado que no calza con el filtro.
   */
  private recargarOReemplazar(actualizada: Cita): void {
    if (this.soloProximas) {
      this.cargarAgenda();
      return;
    }
    this.reemplazarCita(actualizada);
    this.cdr.detectChanges();
  }

  private reemplazarCita(actualizada: Cita): void {
    this.citas = this.citas.map(cita =>
      cita.id_cita === actualizada.id_cita ? actualizada : cita
    );
  }

  /** En 24 horas, para no arrastrar el "p. m." de es-CL dentro de la frase. */
  private fechaLegible(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  /**
   * A la pantalla de acreditación, no al perfil: allí vive la guía de pasos
   * (app-pm-pasos-acreditacion), que enlaza al que falte — documentos o
   * especialidades — en vez de dejar a la persona buscando por su cuenta.
   */
  irALaAcreditacion(): void {
    this.router.navigate(['/portalmedico/acreditacion']);
  }
}
