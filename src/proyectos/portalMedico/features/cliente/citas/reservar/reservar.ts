import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { PortalMedicoService, ProfesionalDirectorio } from '@core/services/portal-medico/portal-medico';
import {
  PmCitaService,
  Cita,
  CITA_DURACIONES_SUGERIDAS,
  CITA_DURACION_MINUTOS_DEFECTO,
  CITA_DURACION_MINUTOS_MINIMA,
  CITA_DURACION_MINUTOS_MAXIMA,
  CITA_HORAS_MINIMAS_ANTICIPACION,
  CITA_REPROGRAMACIONES_MAXIMAS
} from '@core/services/portal-medico/pm-cita';
import { TextosService } from '@core/services/textos/textos';

/**
 * Reserva de una hora de atención por parte del paciente.
 *
 * Solo ofrece profesionales del directorio público, que son los que tienen la
 * acreditación aprobada: es el mismo conjunto que acepta el backend al reservar
 * (PmCita_Queryset.reservar exige PM_Profesional.objects.verificados()), así que
 * la lista nunca muestra a alguien con quien no se podría agendar.
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
  // La app corre sin zone.js, así que ningún callback asíncrono refresca la
  // vista por su cuenta: hay que pedirlo a mano tras cada respuesta HTTP.
  private cdr = inject(ChangeDetectorRef);

  formulario: FormGroup;

  profesionales: ProfesionalDirectorio[] = [];
  cargandoProfesionales = true;
  errorProfesionales: string | null = null;

  reservando = false;
  errorMensaje: string | null = null;
  citaCreada: Cita | null = null;

  // Reglas de negocio expuestas a la plantilla
  readonly duraciones = CITA_DURACIONES_SUGERIDAS;
  readonly duracionDefecto = CITA_DURACION_MINUTOS_DEFECTO;
  readonly duracionMinima = CITA_DURACION_MINUTOS_MINIMA;
  readonly duracionMaxima = CITA_DURACION_MINUTOS_MAXIMA;
  readonly horasAnticipacion = CITA_HORAS_MINIMAS_ANTICIPACION;
  readonly reprogramacionesMaximas = CITA_REPROGRAMACIONES_MAXIMAS;

  /** Mínimo del selector de fecha: ahora más la anticipación mínima. */
  minimoFechaHora = this.pmCitaService.minimoParaAgendar();

  constructor() {
    this.formulario = this.fb.group({
      id_profesional: ['', [Validators.required]],
      fecha_hora: ['', [Validators.required]],
      duracion_minutos: [CITA_DURACION_MINUTOS_DEFECTO, [Validators.required]],
      motivo_consulta: ['']
    });
  }

  ngOnInit(): void {
    if (!this.pmClienteService.estaAutenticadoComoCliente()) {
      this.router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } });
      return;
    }
    this.cargarProfesionales();
  }

  get nombreCliente(): string {
    const cliente = this.pmClienteService.clienteActual();
    return cliente ? `${cliente.nombres_cliente} ${cliente.apellidos_clientes}` : '';
  }

  /** Profesional elegido, para mostrar sus especialidades bajo el selector. */
  get profesionalElegido(): ProfesionalDirectorio | null {
    const id = Number(this.formulario.get('id_profesional')?.value);
    if (!id) return null;
    return this.profesionales.find(p => p.id_profesional === id) ?? null;
  }

  /**
   * True si la fecha escrita a mano no alcanza la anticipación mínima. El
   * atributo [min] del input ya lo evita al usar el calendario, pero el campo
   * se puede teclear.
   */
  get faltaAnticipacion(): boolean {
    return this.pmCitaService.faltaAnticipacion(this.formulario.get('fecha_hora')?.value);
  }

  get puedeEnviar(): boolean {
    return this.formulario.valid && !this.faltaAnticipacion && !this.reservando;
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
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

  get textoAyudaFechaHora(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.ayuda_fecha_hora, {
      horas: this.horasAnticipacion + ''
    });
  }

  get textoAlertaAnticipacion(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.alerta_anticipacion, {
      horas: this.horasAnticipacion + ''
    });
  }

  get textoAyudaDuracion(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_reservar.ayuda_duracion, {
      minima: this.duracionMinima + '',
      maxima: this.duracionMaxima + '',
      defecto: this.duracionDefecto + ''
    });
  }

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

  cargarProfesionales(): void {
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

  onSubmit(): void {
    this.errorMensaje = null;

    if (this.formulario.invalid || this.faltaAnticipacion) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.reservando = true;

    const valores = this.formulario.value;

    this.pmCitaService.reservar({
      id_profesional: Number(valores.id_profesional),
      // El input entrega horario local; el backend espera ISO 8601 con zona.
      fecha_hora: this.pmCitaService.aIsoDesdeInputLocal(valores.fecha_hora),
      duracion_minutos: Number(valores.duracion_minutos),
      motivo_consulta: valores.motivo_consulta || ''
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
        this.cdr.detectChanges();
      }
    });
  }

  reservarOtra(): void {
    this.citaCreada = null;
    this.errorMensaje = null;
    this.formulario.reset({
      id_profesional: '',
      fecha_hora: '',
      duracion_minutos: this.duracionDefecto,
      motivo_consulta: ''
    });
    // El mínimo se recalcula: si la persona dejó la pestaña abierta un rato,
    // el margen de dos horas ya se corrió.
    this.minimoFechaHora = this.pmCitaService.minimoParaAgendar();
  }

  irAMisCitas(): void {
    this.router.navigate(['/portalmedico/paciente/citas']);
  }

  irAlVideo(): void {
    this.router.navigate(['/portalmedico/paciente/video']);
  }
}
