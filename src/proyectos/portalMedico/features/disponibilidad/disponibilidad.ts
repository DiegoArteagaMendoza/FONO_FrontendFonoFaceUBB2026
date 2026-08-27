import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import {
  PmCitaService,
  Disponibilidad,
  CITA_DURACIONES_SUGERIDAS,
  CITA_DURACION_MINUTOS_DEFECTO
} from '@core/services/portal-medico/pm-cita';
import { TextosService } from '@core/services/textos/textos';

/**
 * Horas que el fonoaudiólogo publica para que los pacientes reserven.
 *
 * En vez de crear los bloques uno por uno, se declara un día, un rango horario
 * y la duración: el componente calcula las horas que caben y las publica de una
 * sola vez. Es la forma en que realmente se piensa una jornada ("atiendo el
 * martes de 9 a 13"), y evita repetir el formulario ocho veces.
 */
@Component({
  selector: 'app-pm-disponibilidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './disponibilidad.html'
})
export class PmDisponibilidadComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public portalMedicoService = inject(PortalMedicoService);
  public pmCitaService = inject(PmCitaService);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  // App sin zone.js: hay que refrescar a mano tras cada respuesta HTTP.
  private cdr = inject(ChangeDetectorRef);

  formulario: FormGroup;

  bloques: Disponibilidad[] = [];
  cargando = true;
  incluirPasadas = false;

  publicando = false;
  errorMensaje: string | null = null;
  mensajeExito: string | null = null;
  rechazados: { fecha_hora: string; motivo: string }[] = [];

  acreditacionPendiente = false;

  readonly duraciones = CITA_DURACIONES_SUGERIDAS;

  /** No tiene sentido publicar horas de ayer. */
  hoy = new Date().toISOString().split('T')[0];

  constructor() {
    this.formulario = this.fb.group({
      fecha: ['', [Validators.required]],
      desde: ['09:00', [Validators.required]],
      hasta: ['13:00', [Validators.required]],
      duracion_minutos: [CITA_DURACION_MINUTOS_DEFECTO, [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }
    this.revisarAcreditacion();
    this.cargarBloques();
  }

  private revisarAcreditacion(): void {
    const profesional = this.portalMedicoService.profesionalActual();
    if (!profesional) return;

    this.portalMedicoService.getEstadoAcreditacion(profesional.id_profesional).subscribe({
      next: (acreditacion) => {
        this.acreditacionPendiente = acreditacion.estado_verificacion_profesional !== 'APROBADO';
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  // ---------------------------------------------------------------------
  // Cálculo de las horas a publicar
  // ---------------------------------------------------------------------

  /**
   * Horas que caben en el rango indicado, en formato local AAAA-MM-DDTHH:mm.
   * Solo se cuentan las que caben COMPLETAS: si el rango es 09:00–10:00 y cada
   * atención dura 45 minutos, se publica una sola, no una y tres cuartos.
   */
  get horasCalculadas(): Date[] {
    const { fecha, desde, hasta, duracion_minutos } = this.formulario.value;
    if (!fecha || !desde || !hasta || !duracion_minutos) return [];

    const inicio = new Date(`${fecha}T${desde}`);
    const fin = new Date(`${fecha}T${hasta}`);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) return [];

    const duracion = Number(duracion_minutos);
    const horas: Date[] = [];
    let cursor = new Date(inicio);

    while (new Date(cursor.getTime() + duracion * 60000) <= fin) {
      horas.push(new Date(cursor));
      cursor = new Date(cursor.getTime() + duracion * 60000);
    }

    return horas;
  }

  get rangoInvalido(): boolean {
    const { fecha, desde, hasta } = this.formulario.value;
    if (!fecha || !desde || !hasta) return false;
    return new Date(`${fecha}T${hasta}`) <= new Date(`${fecha}T${desde}`);
  }

  get textoVistaPrevia(): string {
    return this.textosService.reemplazarVariables(this.t().pm_disponibilidad.vista_previa, {
      cantidad: this.horasCalculadas.length + ''
    });
  }

  get puedePublicar(): boolean {
    return this.formulario.valid && !this.rangoInvalido
      && this.horasCalculadas.length > 0 && !this.publicando;
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  // ---------------------------------------------------------------------
  // Publicación
  // ---------------------------------------------------------------------

  publicar(): void {
    this.errorMensaje = null;
    this.mensajeExito = null;
    this.rechazados = [];

    if (!this.puedePublicar) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.publicando = true;

    // El backend espera ISO 8601 con zona; toISOString() convierte el horario
    // local del navegador al instante correcto.
    const fechas = this.horasCalculadas.map(fecha => fecha.toISOString());

    this.pmCitaService.publicarDisponibilidad(
      fechas,
      Number(this.formulario.value.duracion_minutos)
    ).subscribe({
      next: (resultado) => {
        this.publicando = false;
        this.rechazados = resultado.rechazados;

        this.mensajeExito = resultado.rechazados.length === 0
          ? this.textosService.reemplazarVariables(this.t().pm_disponibilidad.exito_publicar, {
              cantidad: resultado.creados.length + ''
            })
          : this.textosService.reemplazarVariables(this.t().pm_disponibilidad.parcial_publicar, {
              creadas: resultado.creados.length + '',
              rechazadas: resultado.rechazados.length + ''
            });

        this.cargarBloques();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.publicando = false;

        // Cuando el backend rechaza TODAS las horas responde 400, pero con el
        // motivo de cada una. En ese caso el detalle es la explicación: repetir
        // encima un "no pudimos publicar, inténtalo de nuevo" solo confunde,
        // porque reintentar sin cambiar nada daría exactamente lo mismo.
        this.rechazados = err?.error?.rechazados ?? [];

        this.errorMensaje = this.rechazados.length > 0
          ? this.t().pm_disponibilidad.ninguna_publicada
          : this.pmCitaService.extraerMensajeError(err, this.t().pm_disponibilidad.error_publicar);

        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Listado
  // ---------------------------------------------------------------------

  cargarBloques(): void {
    this.cargando = true;

    this.pmCitaService.getMisDisponibilidades(this.incluirPasadas).subscribe({
      next: (bloques) => {
        this.bloques = bloques;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pm_disponibilidad.error_servidor
        );
        this.cdr.detectChanges();
      }
    });
  }

  cambiarFiltro(incluirPasadas: boolean): void {
    if (this.incluirPasadas === incluirPasadas) return;

    this.incluirPasadas = incluirPasadas;
    this.mensajeExito = null;
    this.cargarBloques();
  }

  etiquetaEstado(bloque: Disponibilidad): string {
    const textos = this.t().pm_disponibilidad;
    if (!bloque.estado) return textos.estado_retirada;
    if (bloque.esta_reservado) return textos.estado_reservada;
    if (bloque.ya_paso) return textos.estado_pasada;
    return textos.estado_libre;
  }

  claseEstado(bloque: Disponibilidad): string {
    if (!bloque.estado) return 'badge-cita-cancelada';
    if (bloque.esta_reservado) return 'badge-cita-realizada';
    if (bloque.ya_paso) return 'badge-pendiente';
    return 'badge-cita-reservada';
  }

  textoTermina(bloque: Disponibilidad): string {
    const fin = new Date(bloque.fecha_hora_fin);
    const dos = (n: number) => `${n}`.padStart(2, '0');
    return this.textosService.reemplazarVariables(this.t().pm_disponibilidad.termina_a_las, {
      hora: `${dos(fin.getHours())}:${dos(fin.getMinutes())}`
    });
  }

  /** Solo se puede retirar lo que sigue vigente, libre y no ha ocurrido. */
  puedeRetirar(bloque: Disponibilidad): boolean {
    return bloque.estado && !bloque.esta_reservado && !bloque.ya_paso;
  }

  retirar(bloque: Disponibilidad): void {
    if (!confirm(this.t().pm_disponibilidad.confirmar_retirar)) return;

    this.errorMensaje = null;
    this.mensajeExito = null;

    this.pmCitaService.retirarDisponibilidad(bloque.id_disponibilidad).subscribe({
      next: () => {
        this.mensajeExito = this.t().pm_disponibilidad.exito_retirar;
        this.cargarBloques();
      },
      error: (err) => {
        this.errorMensaje = this.pmCitaService.extraerMensajeError(
          err,
          this.t().pm_disponibilidad.error_retirar
        );
        this.cdr.detectChanges();
      }
    });
  }

  irALaAgenda(): void {
    this.router.navigate(['/portalmedico/agenda']);
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
