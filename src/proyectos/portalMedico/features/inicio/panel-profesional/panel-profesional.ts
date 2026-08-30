import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { PmCitaService } from '@core/services/portal-medico/pm-cita';
import { Cita } from '@core/services/portal-medico/interface/pm-cita.interface';
import { TextosService } from '@core/services/textos/textos';

import { ResumenHoras } from './interface/panel-profesional.interface';
import { DIAS_RESUMEN } from './constants/panel-profesional.const';

/**
 * Lo que ve el fonoaudiólogo al entrar: cómo viene su día y qué le falta.
 *
 * Antes aterrizaba en la landing de captación, que a quien ya tiene cuenta no
 * le dice nada, y tenía que ir hasta la agenda para saber si hoy atiende a
 * alguien. Aquí lo primero es su jornada, y lo segundo el aviso que de verdad
 * mueve la aguja: si no ha publicado horas, ningún paciente puede reservar con
 * él y hasta ahora nada se lo advertía.
 *
 * Los tres bloques piden sus datos por separado y se pintan a medida que
 * llegan. Si una llamada falla, ese bloque muestra su propio aviso y los demás
 * siguen sirviendo: un panel incompleto es más útil que uno caído entero.
 */
@Component({
  selector: 'app-pm-panel-profesional',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-profesional.html'
})
export class PmPanelProfesionalComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public portalMedicoService = inject(PortalMedicoService);
  public pmCitaService = inject(PmCitaService);

  private pmClienteService = inject(PmClienteService);
  private router = inject(Router);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  readonly diasResumen = DIAS_RESUMEN;

  citasDeHoy: Cita[] = [];
  totalProximas = 0;
  cargandoAgenda = true;
  errorAgenda = false;

  horas: ResumenHoras | null = null;
  cargandoHoras = true;
  errorHoras = false;

  /** Solo se avisa cuando falta algo: estar aprobado es lo normal. */
  estadoAcreditacion: string | null = null;
  acreditacionPendiente = false;

  private nombresPaciente = new Map<number, string>();
  private marcando: number | null = null;

  ngOnInit(): void {
    this.cargarAgenda();
    this.cargarHoras();
    this.cargarAcreditacion();
    this.cargarNombresPaciente();
  }

  get nombreProfesional(): string {
    return this.portalMedicoService.profesionalActual()?.nombres_profesional ?? '';
  }

  get textoSaludo(): string {
    return this.textosService.reemplazarVariables(this.t().pm_panel.saludo, {
      nombre: this.nombreProfesional
    });
  }

  // ---------------------------------------------------------------------
  // Agenda
  // ---------------------------------------------------------------------

  private cargarAgenda(): void {
    this.pmCitaService.getAgenda(true).subscribe({
      next: (citas) => {
        this.citasDeHoy = citas.filter(cita => this.esDeHoy(cita.fecha_hora));
        this.totalProximas = citas.filter(cita => this.dentroDeLaVentana(cita.fecha_hora)).length;
        this.cargandoAgenda = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoAgenda = false;
        this.errorAgenda = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Los nombres de los pacientes viven en otro endpoint, igual que en la
   * agenda. Si falla, las citas se muestran igual con "Paciente n.º x": es
   * información de apoyo, no motivo para esconder la jornada.
   */
  private cargarNombresPaciente(): void {
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

  nombrePacienteDe(cita: Cita): string {
    return this.nombresPaciente.get(cita.cliente)
      ?? this.textosService.reemplazarVariables(this.t().pm_agenda.paciente_numero, {
        id: cita.cliente + ''
      });
  }

  horaDe(cita: Cita): string {
    const fecha = new Date(cita.fecha_hora);
    const dos = (n: number) => `${n}`.padStart(2, '0');
    return `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
  }

  estaMarcando(cita: Cita): boolean {
    return this.marcando === cita.id_cita;
  }

  /**
   * La atención se cierra desde aquí mismo: obligar a ir a la agenda para
   * pulsar un botón que ya cabe en esta fila no aporta nada.
   */
  marcarRealizada(cita: Cita): void {
    if (this.marcando) return;

    this.marcando = cita.id_cita;

    this.pmCitaService.marcarRealizada(cita.id_cita).subscribe({
      next: () => {
        this.marcando = null;
        // Deja de estar activa, así que sale de "hoy" al recargar.
        this.cargarAgenda();
      },
      error: () => {
        this.marcando = null;
        this.errorAgenda = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Horas publicadas
  // ---------------------------------------------------------------------

  private cargarHoras(): void {
    this.pmCitaService.getMisDisponibilidades(false).subscribe({
      next: (bloques) => {
        this.horas = {
          libres: bloques.filter(bloque => bloque.esta_disponible).length,
          reservadas: bloques.filter(bloque => bloque.esta_reservado).length,
          libresProximos: bloques.filter(
            bloque => bloque.esta_disponible && this.dentroDeLaVentana(bloque.fecha_hora)
          ).length
        };
        this.cargandoHoras = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoHoras = false;
        this.errorHoras = true;
        this.cdr.detectChanges();
      }
    });
  }

  /** El aviso solo aparece cuando ya se sabe que no hay horas, no mientras carga. */
  get sinHorasProximas(): boolean {
    return !this.cargandoHoras && !this.errorHoras && this.horas?.libresProximos === 0;
  }

  get textoSinHoras(): string {
    return this.textosService.reemplazarVariables(this.t().pm_panel.sin_horas_desc, {
      dias: this.diasResumen + ''
    });
  }

  get textoCifraProximas(): string {
    return this.textosService.reemplazarVariables(this.t().pm_panel.cifra_proximas, {
      dias: this.diasResumen + ''
    });
  }

  // ---------------------------------------------------------------------
  // Acreditación
  // ---------------------------------------------------------------------

  private cargarAcreditacion(): void {
    const profesional = this.portalMedicoService.profesionalActual();
    if (!profesional) return;

    this.portalMedicoService.getEstadoAcreditacion(profesional.id_profesional).subscribe({
      next: (acreditacion) => {
        const estado = acreditacion.estado_verificacion_profesional;
        this.acreditacionPendiente = estado !== 'APROBADO';
        this.estadoAcreditacion = this.t().pm_estados[estado] ?? estado;
        this.cdr.detectChanges();
      },
      // Sin el estado no se inventa una alarma: se calla y se sigue.
      error: () => this.cdr.detectChanges()
    });
  }

  get textoAcreditacion(): string {
    return this.textosService.reemplazarVariables(this.t().pm_panel.acreditacion_titulo, {
      estado: (this.estadoAcreditacion ?? '').toLowerCase()
    });
  }

  // ---------------------------------------------------------------------
  // Fechas
  // ---------------------------------------------------------------------

  private esDeHoy(iso: string): boolean {
    const fecha = new Date(iso);
    const hoy = new Date();
    return fecha.getFullYear() === hoy.getFullYear()
      && fecha.getMonth() === hoy.getMonth()
      && fecha.getDate() === hoy.getDate();
  }

  /** Entre ahora y DIAS_RESUMEN días más adelante. */
  private dentroDeLaVentana(iso: string): boolean {
    const fecha = new Date(iso);
    const limite = new Date();
    limite.setDate(limite.getDate() + this.diasResumen);
    return fecha >= new Date() && fecha <= limite;
  }

  // ---------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------

  irAPublicarHoras(): void {
    this.router.navigate(['/portalmedico/disponibilidad']);
  }

  irALaAgenda(): void {
    this.router.navigate(['/portalmedico/agenda']);
  }

  /**
   * A la pantalla de acreditación, no al perfil: allí vive la guía de pasos,
   * que enlaza al que falte en vez de dejar a la persona buscando.
   */
  irALaAcreditacion(): void {
    this.router.navigate(['/portalmedico/acreditacion']);
  }
}
