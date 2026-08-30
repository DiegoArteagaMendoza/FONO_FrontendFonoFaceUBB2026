import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { PortalMedicoService, ProfesionalDirectorio } from '@core/services/portal-medico/portal-medico';
import { PmCitaService } from '@core/services/portal-medico/pm-cita';
import { Cita } from '@core/services/portal-medico/interface/pm-cita.interface';
import {
  CITA_HORAS_MINIMAS_ANTICIPACION,
  CITA_REPROGRAMACIONES_MAXIMAS
} from '@core/services/portal-medico/constants/pm-cita.const';
import { TextosService } from '@core/services/textos/textos';

import { AccionCita } from './interface/mis-citas.interface';

/**
 * Citas del paciente: próximas e historial, con cancelación y cambio de fecha.
 *
 * Las reglas que decide el backend (anticipación mínima de 2 horas, tope de 3
 * reprogramaciones, solo se toca lo que sigue reservado) se replican aquí solo
 * para deshabilitar botones y explicar por qué: si el margen se agota mientras
 * la pestaña está abierta, el backend rechaza igual y el mensaje se muestra.
 */
@Component({
  selector: 'app-pmc-mis-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mis-citas.html'
})
export class PmClienteMisCitasComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmClienteService = inject(PmClienteService);
  public pmCitaService = inject(PmCitaService);

  private portalMedicoService = inject(PortalMedicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  cargando = true;
  soloProximas = true;

  errorMensaje: string | null = null;
  mensajeExito: string | null = null;

  // Acción abierta y sobre qué cita
  citaEnAccion: Cita | null = null;
  accion: AccionCita = null;
  procesando = false;
  errorAccion: string | null = null;

  formPosponer: FormGroup;
  formCancelar: FormGroup;

  /**
   * Nombre del profesional por id. El serializer de la cita entrega el id, no
   * el nombre, así que se cruza con el directorio público (mismo conjunto con
   * el que se puede reservar). Si un profesional deja de estar acreditado y sale
   * del directorio, la cita cae en "Profesional n.º <id>" y no se rompe.
   */
  private nombresProfesional = new Map<number, string>();

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
    if (!this.pmClienteService.estaAutenticadoComoCliente()) {
      this.router.navigate(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } });
      return;
    }
    this.cargarProfesionales();
    this.cargarCitas();
  }

  private get idCliente(): number | null {
    return this.pmClienteService.clienteActual()?.id_cliente ?? null;
  }

  // ---------------------------------------------------------------------
  // Carga
  // ---------------------------------------------------------------------

  private cargarProfesionales(): void {
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
      // Sin el directorio las citas se siguen mostrando, solo sin el nombre.
      error: () => this.cdr.detectChanges()
    });
  }

  cargarCitas(): void {
    const idCliente = this.idCliente;
    if (idCliente === null) return;

    this.cargando = true;
    this.errorMensaje = null;

    this.pmCitaService.getMisCitas(idCliente, this.soloProximas).subscribe({
      next: (citas) => {
        this.citas = citas;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pmc_mis_citas.error_servidor
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
    this.cargarCitas();
  }

  // ---------------------------------------------------------------------
  // Presentación
  // ---------------------------------------------------------------------

  nombreProfesionalDe(cita: Cita): string {
    return this.nombresProfesional.get(cita.profesional)
      ?? this.textosService.reemplazarVariables(this.t().pmc_mis_citas.profesional_numero, {
        id: cita.profesional + ''
      });
  }

  etiquetaEstado(cita: Cita): string {
    const textos = this.t().pmc_mis_citas;
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
    return this.textosService.reemplazarVariables(this.t().pmc_mis_citas.termina_a_las, {
      hora: `${dos(fin.getHours())}:${dos(fin.getMinutes())}`
    });
  }

  textoReprogramada(cita: Cita): string {
    return this.textosService.reemplazarVariables(this.t().pmc_mis_citas.reprogramada_veces, {
      veces: cita.veces_reprogramada + '',
      maximas: this.reprogramacionesMaximas + ''
    });
  }

  get textoCambiosCerrados(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_mis_citas.cambios_cerrados, {
      horas: this.horasAnticipacion + ''
    });
  }

  get textoSinReprogramaciones(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_mis_citas.sin_reprogramaciones, {
      maximas: this.reprogramacionesMaximas + ''
    });
  }

  textoRestantes(cita: Cita): string {
    return this.textosService.reemplazarVariables(this.t().pmc_mis_citas.posponer_restantes, {
      restantes: this.pmCitaService.reprogramacionesRestantes(cita) + ''
    });
  }

  /**
   * True si la cita sigue activa pero ya no admite cambios por el margen de dos
   * horas. Se usa para explicar por qué los botones están deshabilitados; una
   * cita cancelada o realizada no necesita esa explicación.
   */
  cambiosCerrados(cita: Cita): boolean {
    return cita.esta_activa && !this.pmCitaService.permiteCambios(cita);
  }

  /** True si le quedan cambios de fecha agotados pero aún se puede cancelar. */
  sinReprogramaciones(cita: Cita): boolean {
    return this.pmCitaService.permiteCambios(cita)
      && cita.veces_reprogramada >= this.reprogramacionesMaximas;
  }

  // ---------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------

  abrirPosponer(cita: Cita): void {
    this.citaEnAccion = cita;
    this.accion = 'posponer';
    this.errorAccion = null;
    this.mensajeExito = null;
    // Se recalcula al abrir: el margen de dos horas se corre con el reloj.
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

    this.pmCitaService.posponerComoCliente(cita.id_cita, {
      fecha_hora: this.pmCitaService.aIsoDesdeInputLocal(valores.fecha_hora),
      motivo: valores.motivo || ''
    }).subscribe({
      next: (actualizada) => {
        this.procesando = false;
        this.reemplazarCita(actualizada);
        this.mensajeExito = this.textosService.reemplazarVariables(
          this.t().pmc_mis_citas.exito_posponer,
          { fecha: this.fechaLegible(actualizada.fecha_hora) }
        );
        this.cerrarAccion();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.procesando = false;
        this.errorAccion = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pmc_mis_citas.error_posponer
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

    this.pmCitaService.cancelarComoCliente(cita.id_cita, {
      motivo: this.formCancelar.value.motivo || ''
    }).subscribe({
      next: (actualizada) => {
        this.procesando = false;
        this.mensajeExito = this.t().pmc_mis_citas.exito_cancelar;
        this.cerrarAccion();
        // Con el filtro de próximas, una cita cancelada deja de pertenecer al
        // listado: se recarga para que desaparezca en vez de quedar mostrando
        // un estado que ya no corresponde a ese filtro.
        if (this.soloProximas) {
          this.cargarCitas();
        } else {
          this.reemplazarCita(actualizada);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.procesando = false;
        this.errorAccion = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pmc_mis_citas.error_cancelar
        );
        this.cdr.detectChanges();
      }
    });
  }

  private reemplazarCita(actualizada: Cita): void {
    this.citas = this.citas.map(cita =>
      cita.id_cita === actualizada.id_cita ? actualizada : cita
    );
  }

  /**
   * Fecha en texto para los mensajes de confirmación. En 24 horas, igual que el
   * resto de la vista: en es-CL el formato de 12 horas termina en "p. m.", y al
   * ir seguido del punto de la frase quedaba un doble punto.
   */
  private fechaLegible(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  // ---------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------

  irAReservar(): void {
    this.router.navigate(['/portalmedico/paciente/citas/reservar']);
  }

  adjuntarVideo(cita: Cita): void {
    // El id llega como parámetro para que el formulario de video preseleccione
    // esta cita en su selector.
    this.router.navigate(['/portalmedico/paciente/video'], {
      queryParams: { cita: cita.id_cita }
    });
  }
}
