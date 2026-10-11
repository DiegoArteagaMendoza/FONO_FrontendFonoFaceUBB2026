import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmTerapiaService } from '@core/services/portal-medico/pm-terapia';
import {
  PlanTerapia,
  Periodicidad,
  PlanTerapiaPayload
} from '@core/services/portal-medico/interface/pm-terapia.interface';
import {
  EJERCICIOS_MAXIMOS_POR_PLAN,
  PERIODICIDADES
} from '@core/services/portal-medico/constants/pm-terapia.const';
import { TextosService } from '@core/services/textos/textos';

import { EjercicioElegible } from './interface/plan.interface';

/**
 * Asignar o ajustar el plan de terapia de un paciente.
 *
 * Se llega desde la agenda con ?cita=<id>, sobre una cita realizada. La misma
 * pantalla sirve para crear y para ajustar: consulta si ese paciente ya tiene
 * un plan activo con este fonoaudiólogo y, si lo hay, lo carga. Así el fono no
 * tiene que saber de antemano cuál de las dos cosas le toca.
 *
 * El formulario es corto a propósito: periodicidad, hasta 3 ejercicios del
 * catálogo con una indicación opcional cada uno, e indicaciones generales.
 */
@Component({
  selector: 'app-pm-plan-terapia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './plan.html'
})
export class PmPlanTerapiaComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmTerapiaService = inject(PmTerapiaService);

  private portalMedicoService = inject(PortalMedicoService);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  readonly maximo = EJERCICIOS_MAXIMOS_POR_PLAN;
  readonly periodicidades = PERIODICIDADES;

  idCita: number | null = null;
  /** El plan activo del paciente, si existe: entonces se ajusta en vez de crear. */
  plan: PlanTerapia | null = null;
  pacienteNombre = '';
  /** Sin cuenta, el backend rechaza el plan: se explica antes de llenar nada. */
  pacienteSinCuenta = false;
  citaNoRealizada = false;

  cargando = true;
  errorCarga: string | null = null;

  ejercicios: EjercicioElegible[] = [];
  periodicidad: Periodicidad = 'SEMANAL';
  indicaciones = '';

  guardando = false;
  errorGuardar: string | null = null;
  mensajeExito: string | null = null;

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }

    this.idCita = Number(this.ruta.snapshot.queryParamMap.get('cita')) || null;
    if (!this.idCita) {
      this.cargando = false;
      this.errorCarga = this.t().pm_plan.error_cita;
      return;
    }

    this.cargar();
  }

  // ---------------------------------------------------------------------
  // Carga
  // ---------------------------------------------------------------------

  /**
   * El catálogo y el plan existente se piden juntos: el formulario necesita
   * los dos para pintarse, y pedirlos en serie solo alarga la espera.
   */
  private cargar(): void {
    forkJoin({
      catalogo: this.pmTerapiaService.getMisEjercicios(),
      contexto: this.pmTerapiaService.getPlanDeCita(this.idCita!)
    }).subscribe({
      next: ({ catalogo, contexto }) => {
        const plan = contexto.plan;
        this.plan = plan;
        this.pacienteNombre = contexto.paciente_nombre;
        this.pacienteSinCuenta = !contexto.paciente_tiene_cuenta;
        this.citaNoRealizada = !contexto.cita_realizada;

        if (plan) {
          this.periodicidad = plan.periodicidad;
          this.indicaciones = plan.indicaciones;
        }

        // El catálogo cruzado con lo que el plan ya tiene asignado.
        const asignados = new Map(
          (plan?.ejercicios ?? []).map(pe => [pe.ejercicio.id_ejercicio, pe.indicaciones])
        );
        this.ejercicios = catalogo.map(e => ({
          id_ejercicio: e.id_ejercicio,
          nombre: e.nombre,
          instrucciones: e.instrucciones,
          video_ejemplo: e.video_ejemplo,
          elegido: asignados.has(e.id_ejercicio),
          indicaciones: asignados.get(e.id_ejercicio) ?? ''
        }));

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.errorCarga = err.status === 404
          ? this.t().pm_plan.error_cita
          : this.pmTerapiaService.extraerMensajeError(err, this.t().pm_plan.error_servidor);
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Presentación
  // ---------------------------------------------------------------------

  get esAjuste(): boolean {
    return !!this.plan;
  }

  /** Crear no va a funcionar: se dice de entrada, sin dejar llenar el formulario. */
  get bloqueado(): boolean {
    return !this.plan && (this.pacienteSinCuenta || this.citaNoRealizada);
  }

  get textoBloqueo(): string {
    const textos = this.t().pm_plan;
    if (this.citaNoRealizada) return textos.bloqueo_cita_no_realizada;
    return this.textosService.reemplazarVariables(textos.bloqueo_sin_cuenta, {
      paciente: this.pacienteNombre
    });
  }

  get titulo(): string {
    return this.esAjuste ? this.t().pm_plan.titulo_ajustar : this.t().pm_plan.titulo_crear;
  }

  get subtitulo(): string {
    const textos = this.t().pm_plan;
    if (this.plan) {
      return this.textosService.reemplazarVariables(textos.subtitulo_ajustar, {
        paciente: this.plan.paciente_nombre,
        inicio: new Date(this.plan.fecha_inicio + 'T00:00:00').toLocaleDateString('es-CL', {
          day: 'numeric', month: 'long'
        })
      });
    }
    return this.textosService.reemplazarVariables(textos.subtitulo_crear, {
      maximo: this.maximo + '',
      paciente: this.pacienteNombre
    });
  }

  get elegidos(): EjercicioElegible[] {
    return this.ejercicios.filter(e => e.elegido);
  }

  get textoLabelEjercicios(): string {
    return this.textosService.reemplazarVariables(this.t().pm_plan.label_ejercicios, {
      elegidos: this.elegidos.length + '',
      maximo: this.maximo + ''
    });
  }

  get textoAlertaMaximo(): string {
    return this.textosService.reemplazarVariables(this.t().pm_plan.alerta_maximo, {
      maximo: this.maximo + ''
    });
  }

  /** Solo se avisa si el plan ya existe y se está cambiando la periodicidad. */
  get cambiaPeriodicidad(): boolean {
    return !!this.plan && this.plan.periodicidad !== this.periodicidad;
  }

  etiquetaPeriodicidad(p: Periodicidad): string {
    return this.t().pm_plan[`periodicidad_${p}` as 'periodicidad_DIARIA'];
  }

  /** Con el tope alcanzado, los no elegidos se bloquean en vez de fallar al enviar. */
  alcanzoElMaximo(): boolean {
    return this.elegidos.length >= this.maximo;
  }

  alternar(ejercicio: EjercicioElegible): void {
    if (!ejercicio.elegido && this.alcanzoElMaximo()) return;
    ejercicio.elegido = !ejercicio.elegido;
    this.errorGuardar = null;
  }

  // ---------------------------------------------------------------------
  // Guardar y cerrar
  // ---------------------------------------------------------------------

  guardar(): void {
    this.errorGuardar = null;
    this.mensajeExito = null;

    if (this.elegidos.length === 0) {
      this.errorGuardar = this.t().pm_plan.alerta_ejercicios;
      return;
    }

    const datos: PlanTerapiaPayload = {
      periodicidad: this.periodicidad,
      indicaciones: this.indicaciones.trim(),
      ejercicios: this.elegidos.map(e => ({
        id_ejercicio: e.id_ejercicio,
        indicaciones: e.indicaciones.trim()
      }))
    };

    this.guardando = true;

    const peticion = this.plan
      ? this.pmTerapiaService.ajustarPlan(this.plan.id_plan, datos)
      : this.pmTerapiaService.crearPlan({ ...datos, id_cita: this.idCita! });

    peticion.subscribe({
      next: (plan) => {
        this.guardando = false;
        const eraNuevo = !this.plan;
        this.plan = plan;
        this.mensajeExito = eraNuevo ? this.t().pm_plan.exito_crear : this.t().pm_plan.exito_ajustar;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.errorGuardar = this.pmTerapiaService.extraerMensajeError(
          err, this.t().pm_plan.error_guardar
        );
        this.cdr.detectChanges();
      }
    });
  }

  cerrarPlan(): void {
    if (!this.plan || !confirm(this.t().pm_plan.confirmar_cerrar)) return;

    this.errorGuardar = null;
    this.mensajeExito = null;

    this.pmTerapiaService.cerrarPlan(this.plan.id_plan).subscribe({
      next: () => {
        this.mensajeExito = this.t().pm_plan.exito_cerrar;
        this.cdr.detectChanges();
        this.volverALaAgenda();
      },
      error: (err) => {
        this.errorGuardar = this.pmTerapiaService.extraerMensajeError(
          err, this.t().pm_plan.error_cerrar
        );
        this.cdr.detectChanges();
      }
    });
  }

  volverALaAgenda(): void {
    this.router.navigate(['/portalmedico/agenda']);
  }

  irAlCatalogo(): void {
    this.router.navigate(['/portalmedico/ejercicios']);
  }
}
