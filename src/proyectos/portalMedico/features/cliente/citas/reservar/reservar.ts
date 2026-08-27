import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import {
  PortalMedicoService,
  ProfesionalDirectorio,
  Especialidad
} from '@core/services/portal-medico/portal-medico';
import {
  PmCitaService,
  Cita,
  DisponibilidadPublica,
  CITA_HORAS_MINIMAS_ANTICIPACION,
  CITA_REPROGRAMACIONES_MAXIMAS
} from '@core/services/portal-medico/pm-cita';
import { TextosService } from '@core/services/textos/textos';

/** Horas disponibles agrupadas por día, que es como las lee una persona. */
interface DiaConHoras {
  fecha: string;               // ISO del primer bloque, para el pipe date
  horas: DisponibilidadPublica[];
}

/**
 * Reserva de una hora de atención.
 *
 * El paciente ya no propone un horario: elige un fonoaudiólogo (pudiendo
 * filtrar por especialidad) y toma una de las horas que ese profesional
 * publicó. Del bloque salen la fecha, la duración y el profesional, así que al
 * backend solo viaja el id de la hora.
 *
 * No exige sesión. Quien no la tenga completa sus datos personales y el backend
 * le crea la ficha; quien sí la tenga los omite, porque ya están en su cuenta.
 */
@Component({
  selector: 'app-pmc-reservar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reservar.html'
})
export class PmClienteReservarCitaComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmClienteService = inject(PmClienteService);
  public pmCitaService = inject(PmCitaService);

  private portalMedicoService = inject(PortalMedicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  // La app corre sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  formulario: FormGroup;
  formularioDatos: FormGroup;

  profesionales: ProfesionalDirectorio[] = [];
  cargandoProfesionales = true;
  errorProfesionales: string | null = null;

  especialidades: Especialidad[] = [];
  especialidadFiltro = '';

  // Horas publicadas por el profesional elegido
  horasPorDia: DiaConHoras[] = [];
  cargandoHoras = false;
  errorHoras: string | null = null;
  horaElegida: DisponibilidadPublica | null = null;

  reservando = false;
  errorMensaje: string | null = null;
  citaCreada: Cita | null = null;

  readonly horasAnticipacion = CITA_HORAS_MINIMAS_ANTICIPACION;
  readonly reprogramacionesMaximas = CITA_REPROGRAMACIONES_MAXIMAS;

  /** Tope del selector de fecha de nacimiento: nadie nació mañana. */
  hoy = new Date().toISOString().split('T')[0];

  constructor() {
    this.formulario = this.fb.group({
      id_profesional: ['', [Validators.required]],
      motivo_consulta: ['']
    });

    // Solo se valida cuando la persona no tiene sesión iniciada.
    this.formularioDatos = this.fb.group({
      nombres_cliente: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos_clientes: ['', [Validators.required, Validators.maxLength(100)]],
      rut_cliente: ['', [Validators.required, Validators.pattern(/^[0-9]{7,8}-?[0-9kK]$/)]],
      fecha_nacimiento_cliente: ['', [Validators.required]],
      email_cliente: ['', [Validators.required, Validators.email]],
      telefono_cliente: ['', [Validators.required, Validators.pattern(/^(\+?56)?[2-9][0-9]{7,8}$/)]]
    });
  }

  ngOnInit(): void {
    // A diferencia de antes, aquí NO se redirige al login: reservar sin cuenta
    // es parte del flujo.
    this.cargarProfesionales();
    this.cargarEspecialidades();
  }

  // ---------------------------------------------------------------------
  // Sesión
  // ---------------------------------------------------------------------

  get tieneSesion(): boolean {
    return this.pmClienteService.estaAutenticadoComoCliente();
  }

  get nombreCliente(): string {
    const cliente = this.pmClienteService.clienteActual();
    return cliente ? `${cliente.nombres_cliente} ${cliente.apellidos_clientes}` : '';
  }

  irALogin(): void {
    this.router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } });
  }

  irARegistro(): void {
    this.router.navigate(['/portalmedico/paciente/registro']);
  }

  // ---------------------------------------------------------------------
  // Profesionales y filtro por especialidad
  // ---------------------------------------------------------------------

  get profesionalesFiltrados(): ProfesionalDirectorio[] {
    if (!this.especialidadFiltro) return this.profesionales;

    const idEspecialidad = Number(this.especialidadFiltro);
    return this.profesionales.filter(profesional =>
      profesional.especialidades?.some(e => e.id_especialidad === idEspecialidad)
    );
  }

  get textoContadorProfesionales(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.contador_profesionales, {
      cantidad: this.profesionalesFiltrados.length + '',
      total: this.profesionales.length + ''
    });
  }

  get profesionalElegido(): ProfesionalDirectorio | null {
    const id = Number(this.formulario.get('id_profesional')?.value);
    if (!id) return null;
    return this.profesionales.find(p => p.id_profesional === id) ?? null;
  }

  onCambioEspecialidad(evento: Event): void {
    this.especialidadFiltro = (evento.target as HTMLSelectElement).value;

    const elegido = this.formulario.get('id_profesional')?.value;
    if (!elegido) return;

    const sigueVisible = this.profesionalesFiltrados
      .some(profesional => profesional.id_profesional === Number(elegido));

    if (!sigueVisible) {
      this.formulario.patchValue({ id_profesional: '' });
      this.limpiarHoras();
    }
  }

  /** Al cambiar de profesional, las horas del anterior dejan de servir. */
  onCambioProfesional(): void {
    this.limpiarHoras();

    const id = Number(this.formulario.get('id_profesional')?.value);
    if (id) this.cargarHoras(id);
  }

  private cargarProfesionales(): void {
    this.cargandoProfesionales = true;
    this.errorProfesionales = null;

    this.portalMedicoService.getDirectorio().subscribe({
      next: (profesionales) => {
        this.profesionales = profesionales;
        this.cargandoProfesionales = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoProfesionales = false;
        this.errorProfesionales = this.t().pmc_reservar.error_profesionales;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarEspecialidades(): void {
    this.portalMedicoService.getEspecialidades().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  // ---------------------------------------------------------------------
  // Horas disponibles
  // ---------------------------------------------------------------------

  private limpiarHoras(): void {
    this.horasPorDia = [];
    this.horaElegida = null;
    this.errorHoras = null;
  }

  private cargarHoras(idProfesional: number): void {
    this.cargandoHoras = true;

    this.pmCitaService.getDisponibilidadDeProfesional(idProfesional).subscribe({
      next: (horas) => {
        this.horasPorDia = this.agruparPorDia(horas);
        this.cargandoHoras = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoHoras = false;
        this.errorHoras = this.t().pmc_reservar.error_horas;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Agrupa las horas por día. Una lista plana de veinte horarios seguidos es
   * ilegible; separadas por día se escanean de un vistazo.
   */
  private agruparPorDia(horas: DisponibilidadPublica[]): DiaConHoras[] {
    const porDia = new Map<string, DisponibilidadPublica[]>();

    for (const hora of horas) {
      // Clave por fecha local, no por la del ISO en UTC: si no, una hora de las
      // 21:00 en Chile caería en el día siguiente.
      const fecha = new Date(hora.fecha_hora);
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;

      if (!porDia.has(clave)) porDia.set(clave, []);
      porDia.get(clave)!.push(hora);
    }

    return [...porDia.values()].map(horasDelDia => ({
      fecha: horasDelDia[0].fecha_hora,
      horas: horasDelDia
    }));
  }

  elegirHora(hora: DisponibilidadPublica): void {
    this.horaElegida = hora;
    this.errorMensaje = null;
  }

  cambiarHora(): void {
    this.horaElegida = null;
  }

  esHoraElegida(hora: DisponibilidadPublica): boolean {
    return this.horaElegida?.id_disponibilidad === hora.id_disponibilidad;
  }

  textoHorasDelDia(dia: DiaConHoras): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.horas_de_dia, {
      cantidad: dia.horas.length + ''
    });
  }

  textoDuracionHora(hora: DisponibilidadPublica): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.duracion_de_la_hora, {
      minutos: hora.duracion_minutos + ''
    });
  }

  // ---------------------------------------------------------------------
  // Textos con variables
  // ---------------------------------------------------------------------

  get textoReglaAnticipacion(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.regla_anticipacion, {
      horas: this.horasAnticipacion + ''
    });
  }

  get textoReglaReprogramaciones(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.regla_reprogramaciones, {
      maximas: this.reprogramacionesMaximas + ''
    });
  }

  get fechaEsFutura(): boolean {
    const valor = this.formularioDatos.get('fecha_nacimiento_cliente')?.value;
    return !!valor && valor > this.hoy;
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  campoDatosInvalido(campo: string): boolean {
    const control = this.formularioDatos.get(campo);
    return !!control && control.invalid && control.touched;
  }

  nombreProfesional(profesional: ProfesionalDirectorio): string {
    return `${profesional.nombres_profesional} ${profesional.apellidos_profesional}`;
  }

  especialidadesDe(profesional: ProfesionalDirectorio): string {
    if (!profesional.especialidades?.length) {
      return this.t().pmc_reservar.sin_especialidades;
    }
    return profesional.especialidades
      .map(especialidad => especialidad.nombre_especialidad_profesional)
      .join(' · ');
  }

  // ---------------------------------------------------------------------
  // Envío
  // ---------------------------------------------------------------------

  get puedeEnviar(): boolean {
    if (this.reservando || !this.horaElegida) return false;
    if (this.formulario.invalid) return false;
    // Sin sesión, los datos personales son obligatorios.
    if (!this.tieneSesion && (this.formularioDatos.invalid || this.fechaEsFutura)) return false;
    return true;
  }

  onSubmit(): void {
    this.errorMensaje = null;

    if (this.formulario.invalid || !this.horaElegida) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (!this.tieneSesion && (this.formularioDatos.invalid || this.fechaEsFutura)) {
      this.formularioDatos.markAllAsTouched();
      return;
    }

    this.reservando = true;

    this.pmCitaService.reservar({
      id_disponibilidad: this.horaElegida.id_disponibilidad,
      motivo_consulta: this.formulario.value.motivo_consulta || '',
      // Con sesión no se mandan: el backend toma al dueño del token.
      ...(this.tieneSesion ? {} : { paciente: this.formularioDatos.value })
    }).subscribe({
      next: (cita) => {
        this.reservando = false;
        this.citaCreada = cita;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.reservando = false;
        this.errorMensaje = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pmc_reservar.error_servidor
        );
        // Si la hora se ocupó mientras la persona llenaba el formulario, hay que
        // recargar el listado: la que eligió ya no existe.
        const idProfesional = Number(this.formulario.get('id_profesional')?.value);
        if (idProfesional) {
          this.horaElegida = null;
          this.cargarHoras(idProfesional);
        }
        this.cdr.detectChanges();
      }
    });
  }

  get reservoSinSesion(): boolean {
    return !!this.citaCreada?.reservada_sin_sesion;
  }

  reservarOtra(): void {
    this.citaCreada = null;
    this.errorMensaje = null;
    this.horaElegida = null;
    this.formulario.reset({ id_profesional: '', motivo_consulta: '' });
    this.horasPorDia = [];
  }

  irAMisCitas(): void {
    this.router.navigate(['/portalmedico/paciente/citas']);
  }

  /** Al seguimiento con el código ya puesto, para no tener que teclearlo. */
  irAlSeguimiento(): void {
    this.router.navigate(['/portalmedico/cita/seguimiento'], {
      queryParams: { codigo: this.citaCreada?.codigo_seguimiento }
    });
  }

  irAlVideo(): void {
    const id = this.citaCreada?.id_cita;
    this.router.navigate(['/portalmedico/paciente/video'], {
      queryParams: id ? { cita: id } : {}
    });
  }
}
