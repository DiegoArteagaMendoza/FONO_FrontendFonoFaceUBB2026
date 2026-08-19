import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  PmClienteService,
  VideoSintomas,
  VIDEO_DURACION_MAXIMA_SEGUNDOS,
  VIDEO_TAMANO_MAXIMO_MB,
  VIDEO_EXTENSIONES_PERMITIDAS,
  VIDEO_DIAS_VIGENCIA
} from '@core/services/portal-medico/pm-cliente';
import { PmCitaService, Cita } from '@core/services/portal-medico/pm-cita';
import { PortalMedicoService, ProfesionalDirectorio } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pmc-video',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './video.html'
})
export class PmClienteVideoComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmClienteService = inject(PmClienteService);
  public pmCitaService = inject(PmCitaService);

  private portalMedicoService = inject(PortalMedicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  // La lectura de metadatos del video ocurre fuera de la zona de Angular (el
  // <video> nunca se adjunta al DOM), así que hay que refrescar a mano.
  // Es el mismo criterio que siguen el resto de las vistas del portal.
  private cdr = inject(ChangeDetectorRef);

  formulario: FormGroup;
  archivo: File | null = null;
  duracionSegundos: number | null = null;
  tamanoMb: number | null = null;

  subiendo = false;
  errorMensaje: string | null = null;
  exito = false;

  // Videos ya subidos por el paciente
  misVideos: VideoSintomas[] = [];
  cargandoVideos = true;
  mensajeVideos: string | null = null;

  // Citas a las que se puede adjuntar el video: solo las que el backend acepta
  // (activas y con permite_carga_video). Ver PmVideo/serializer.validate.
  citasDisponibles: Cita[] = [];
  private nombresProfesional = new Map<number, string>();

  // Reglas expuestas a la plantilla
  readonly duracionMaxima = VIDEO_DURACION_MAXIMA_SEGUNDOS;
  readonly pesoMaximo = VIDEO_TAMANO_MAXIMO_MB;
  readonly formatos = VIDEO_EXTENSIONES_PERMITIDAS;
  readonly diasVigencia = VIDEO_DIAS_VIGENCIA;

  constructor() {
    this.formulario = this.fb.group({
      descripcion: [''],
      cita: ['']
    });
  }

  ngOnInit(): void {
    if (!this.pmClienteService.estaAutenticadoComoCliente()) {
      this.router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } });
      return;
    }
    this.cargarMisVideos();
    this.cargarCitasDisponibles();
    this.cargarNombresProfesional();
  }

  /**
   * Citas próximas a las que se puede colgar un video. Se piden las activas y
   * futuras y se dejan solo las que admiten carga, que es exactamente lo que el
   * backend valida al subir: así el selector no ofrece opciones que serían
   * rechazadas.
   */
  private cargarCitasDisponibles(): void {
    const idCliente = this.pmClienteService.clienteActual()?.id_cliente;
    if (!idCliente) return;

    this.pmCitaService.getMisCitas(idCliente, true).subscribe({
      next: (citas) => {
        this.citasDisponibles = citas.filter(cita => this.pmCitaService.admiteVideo(cita));
        this.preseleccionarCitaDeLaUrl();
        this.cdr.detectChanges();
      },
      // Sin el listado el video se puede subir igual, solo sin asociar a una cita.
      error: () => this.cdr.detectChanges()
    });
  }

  private cargarNombresProfesional(): void {
    this.portalMedicoService.getDirectorio().subscribe({
      next: (profesionales: ProfesionalDirectorio[]) => {
        profesionales.forEach(profesional => {
          this.nombresProfesional.set(
            profesional.id_profesional,
            `${profesional.nombres_profesional} ${profesional.apellidos_profesional}`
          );
        });
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  /**
   * "Mis citas" enlaza aquí con ?cita=<id> para que el paciente no tenga que
   * volver a buscarla en el selector. Solo se acepta si la cita está entre las
   * que admiten video.
   */
  private preseleccionarCitaDeLaUrl(): void {
    const idCita = Number(this.ruta.snapshot.queryParamMap.get('cita'));
    if (!idCita) return;

    const disponible = this.citasDisponibles.some(cita => cita.id_cita === idCita);
    if (disponible) {
      this.formulario.patchValue({ cita: idCita });
    }
  }

  get nombreCliente(): string {
    const cliente = this.pmClienteService.clienteActual();
    return cliente ? `${cliente.nombres_cliente} ${cliente.apellidos_clientes}` : '';
  }

  get textoAyudaVideo(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_video.ayuda_video, {
      segundos: this.duracionMaxima + '',
      peso: this.pesoMaximo + '',
      formatos: this.formatos.join(', ')
    });
  }

  get puedeEnviar(): boolean {
    return !!this.archivo && !this.errorMensaje && !this.subiendo && this.duracionSegundos !== null;
  }

  cargarMisVideos(): void {
    this.cargandoVideos = true;
    this.pmClienteService.getMisVideos().subscribe({
      next: (videos) => {
        this.misVideos = videos;
        this.cargandoVideos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoVideos = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Etiqueta de una cita en el selector: fecha legible y, si se conoce, el
   * nombre del profesional que atiende.
   */
  etiquetaCita(cita: Cita): string {
    const fecha = new Date(cita.fecha_hora).toLocaleString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    const profesional = this.nombresProfesional.get(cita.profesional);

    if (!profesional) {
      return this.textosService.reemplazarVariables(this.t().pmc_video.opcion_cita_simple, { fecha });
    }
    return this.textosService.reemplazarVariables(this.t().pmc_video.opcion_cita, { fecha, profesional });
  }

  irAReservar(): void {
    this.router.navigate(['/portalmedico/paciente/citas/reservar']);
  }

  textoVenceEn(video: VideoSintomas): string {
    return this.textosService.reemplazarVariables(this.t().pmc_mis_videos.vence_en, {
      dias: video.dias_restantes + ''
    });
  }

  eliminarVideo(video: VideoSintomas): void {
    if (!confirm(this.t().pmc_mis_videos.confirmar_eliminar)) return;

    this.pmClienteService.eliminarMiVideo(video.id_video).subscribe({
      next: () => {
        this.misVideos = this.misVideos.filter(v => v.id_video !== video.id_video);
        this.mensajeVideos = this.t().pmc_mis_videos.exito_eliminar;
        // Cerramos el aviso de "video enviado" para no mostrar dos mensajes de
        // éxito a la vez, que se contradicen visualmente.
        this.exito = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeVideos = this.t().pmc_mis_videos.error_eliminar;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Valida el archivo en el navegador antes de enviarlo: formato, peso y
   * duración real. El backend vuelve a validar todo (es la fuente de verdad),
   * pero así la persona se entera al instante en vez de tras subir 40 MB.
   */
  async onFileChange(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.errorMensaje = null;
    this.archivo = null;
    this.duracionSegundos = null;
    this.tamanoMb = null;
    this.exito = false;

    if (!archivo) return;

    // 1. Formato
    const extension = archivo.name.toLowerCase().split('.').pop() ?? '';
    if (!this.formatos.includes(extension)) {
      this.errorMensaje = this.textosService.reemplazarVariables(
        this.t().pmc_video.alerta_video_formato,
        { formatos: this.formatos.join(', ') }
      );
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    // 2. Peso
    const mb = archivo.size / (1024 * 1024);
    if (mb > this.pesoMaximo) {
      this.errorMensaje = this.textosService.reemplazarVariables(
        this.t().pmc_video.alerta_video_peso,
        { peso: mb.toFixed(1), maximo: this.pesoMaximo + '' }
      );
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    // 3. Duración real del video
    try {
      const duracion = await this.pmClienteService.obtenerDuracionSegundos(archivo);

      if (duracion > this.duracionMaxima) {
        this.errorMensaje = this.textosService.reemplazarVariables(
          this.t().pmc_video.alerta_video_duracion,
          { duracion: duracion + '', maximo: this.duracionMaxima + '' }
        );
        input.value = '';
        this.cdr.detectChanges();
        return;
      }

      this.duracionSegundos = duracion;
    } catch {
      // Si el navegador no logra leer los metadatos, dejamos que el backend decida
      this.duracionSegundos = null;
      this.errorMensaje = this.t().pmc_video.alerta_video_req;
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.archivo = archivo;
    this.tamanoMb = Number(mb.toFixed(1));
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (!this.archivo || this.duracionSegundos === null) {
      this.errorMensaje = this.t().pmc_video.alerta_video_req;
      return;
    }

    this.subiendo = true;
    this.errorMensaje = null;

    // El dueño NO viaja en el FormData: el backend lo toma del token.
    const datos = new FormData();
    datos.append('video', this.archivo);
    datos.append('duracion_segundos', this.duracionSegundos + '');

    const descripcion = this.formulario.get('descripcion')?.value;
    if (descripcion) {
      datos.append('descripcion', descripcion);
    }

    // La cita es opcional: solo viaja si el paciente eligió una.
    const cita = this.formulario.get('cita')?.value;
    if (cita) {
      datos.append('cita', cita);
    }

    this.pmClienteService.subirVideo(datos).subscribe({
      next: () => {
        this.subiendo = false;
        this.exito = true;
        this.limpiarSeleccion();
        this.cargarMisVideos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.subiendo = false;
        this.errorMensaje = this.pmClienteService.extraerMensajeError(
          err,
          this.t().pmc_video.error_servidor
        );
        this.cdr.detectChanges();
      }
    });
  }

  subirOtro(): void {
    this.exito = false;
    this.limpiarSeleccion();
  }

  private limpiarSeleccion(): void {
    this.archivo = null;
    this.duracionSegundos = null;
    this.tamanoMb = null;
    this.formulario.reset();
  }
}
