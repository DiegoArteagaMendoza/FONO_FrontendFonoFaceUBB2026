import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmCitaService } from '@core/services/portal-medico/pm-cita';
import {
  Disponibilidad,
  EnlaceReunion,
  PlataformaReunion
} from '@core/services/portal-medico/interface/pm-cita.interface';
import {
  CITA_DURACIONES_SUGERIDAS,
  CITA_DURACION_MINUTOS_DEFECTO
} from '@core/services/portal-medico/constants/pm-cita.const';
import { TextosService } from '@core/services/textos/textos';
import { EnlaceReunionComponent } from '../../components/enlace-reunion/enlace-reunion';
import { CambioEnlaceReunion } from '../../components/enlace-reunion/interface/enlace-reunion.interface';

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
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EnlaceReunionComponent],
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

  // --- Link de la reunión online (Meet o Zoom) ---
  /** Link que se asignará a las horas que se publiquen (opcional). */
  enlacePublicar: CambioEnlaceReunion = {
    valor: { plataforma_reunion: null, enlace_reunion: null },
    valido: true
  };
  /** Hora cuyo link se está agregando o cambiando. */
  bloqueEditandoEnlace: number | null = null;
  guardandoEnlace = false;
  errorEnlace: string | null = null;
  /** Hora donde mostrar el aviso de "guardado": junto a ella, no arriba de la página. */
  enlaceGuardadoEn: number | null = null;
  mensajeEnlace: string | null = null;

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
      && this.horasCalculadas.length > 0 && !this.publicando
      && this.enlacePublicar.valido;
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
      Number(this.formulario.value.duracion_minutos),
      this.enlacePublicar.valor
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

  // ---------------------------------------------------------------------
  // Link de la reunión online
  // ---------------------------------------------------------------------

  /** El link solo se puede gestionar en horas vigentes que todavía no ocurren. */
  puedeEditarEnlace(bloque: Disponibilidad): boolean {
    return bloque.estado && !bloque.ya_paso;
  }

  /** Próximas horas vigentes a las que les falta el link: motivo de la alerta. */
  get bloquesSinEnlace(): Disponibilidad[] {
    return this.bloques.filter(bloque =>
      this.puedeEditarEnlace(bloque) && this.pmCitaService.faltaEnlaceReunion(bloque)
    );
  }

  get textoAlertaSinEnlace(): string {
    const sinEnlace = this.bloquesSinEnlace;
    return this.textosService.reemplazarVariables(this.t().pm_reunion.alerta_horas_desc, {
      cantidad: sinEnlace.length + '',
      reservadas: sinEnlace.filter(bloque => bloque.esta_reservado).length + ''
    });
  }

  nombrePlataforma(plataforma: PlataformaReunion | null): string {
    return plataforma === 'ZOOM' ? this.t().pm_reunion.plataforma_ZOOM : this.t().pm_reunion.plataforma_MEET;
  }

  textoConEnlace(bloque: Disponibilidad): string {
    return this.textosService.reemplazarVariables(this.t().pm_reunion.con_enlace, {
      plataforma: this.nombrePlataforma(bloque.plataforma_reunion)
    });
  }

  abrirEdicionEnlace(bloque: Disponibilidad): void {
    this.bloqueEditandoEnlace = bloque.id_disponibilidad;
    this.errorEnlace = null;
    this.enlaceGuardadoEn = null;
  }

  cerrarEdicionEnlace(): void {
    this.bloqueEditandoEnlace = null;
    this.errorEnlace = null;
  }

  guardarEnlace(bloque: Disponibilidad, valor: EnlaceReunion): void {
    this.enviarEnlace(bloque, valor, this.t().pm_reunion.exito_guardar);
  }

  quitarEnlace(bloque: Disponibilidad): void {
    if (!confirm(this.t().pm_reunion.confirmar_quitar)) return;
    this.enviarEnlace(bloque, { plataforma_reunion: null, enlace_reunion: null }, this.t().pm_reunion.exito_quitar);
  }

  private enviarEnlace(bloque: Disponibilidad, valor: EnlaceReunion, mensaje: string): void {
    this.guardandoEnlace = true;
    this.errorEnlace = null;
    this.enlaceGuardadoEn = null;

    this.pmCitaService.actualizarEnlaceDisponibilidad(bloque.id_disponibilidad, valor).subscribe({
      next: (actualizado) => {
        // Se reemplaza en el listado sin recargarlo todo.
        this.bloques = this.bloques.map(b => b.id_disponibilidad === actualizado.id_disponibilidad ? actualizado : b);
        this.guardandoEnlace = false;
        this.bloqueEditandoEnlace = null;
        this.enlaceGuardadoEn = actualizado.id_disponibilidad;
        this.mensajeEnlace = mensaje;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardandoEnlace = false;
        // Si falló al quitar (sin formulario abierto), el error se muestra en esa hora.
        this.bloqueEditandoEnlace = bloque.id_disponibilidad;
        this.errorEnlace = this.pmCitaService.extraerMensajeError(err, this.t().pm_reunion.error_guardar);
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
