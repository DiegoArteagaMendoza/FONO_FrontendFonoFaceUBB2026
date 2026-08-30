import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

    this.pmCitaService.getPorCodigo(this.codigoActual).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.buscando = false;
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
