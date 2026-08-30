import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PortalMedicoService, ProfesionalDirectorio } from '@core/services/portal-medico/portal-medico';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { PmCitaService } from '@core/services/portal-medico/pm-cita';
import { Cita } from '@core/services/portal-medico/interface/pm-cita.interface';
import { TextosService } from '@core/services/textos/textos';

import { PendientePaciente } from './interface/proxima-hora.interface';

/**
 * Lo que ve el paciente al entrar con su sesión.
 *
 * Deliberadamente NO es un tablero. Un paciente entra dos o tres veces por
 * tratamiento, no a diario: no hay cifras que le importen y un panel de control
 * solo le daría ruido con aire de importancia. La pantalla responde una única
 * pregunta —cuándo es mi hora y qué me falta— y todo lo demás queda a un
 * enlace de distancia.
 */
@Component({
  selector: 'app-pmc-proxima-hora',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proxima-hora.html'
})
export class PmClienteProximaHoraComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmClienteService = inject(PmClienteService);
  public pmCitaService = inject(PmCitaService);

  private portalMedicoService = inject(PortalMedicoService);
  private router = inject(Router);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  cita: Cita | null = null;
  cargando = true;
  errorMensaje: string | null = null;

  pendiente: PendientePaciente = { video: false, videoListo: false, cambios: false };

  private nombresProfesional = new Map<number, string>();

  ngOnInit(): void {
    this.cargarProximaHora();
    this.cargarNombresProfesional();
  }

  get nombreCliente(): string {
    return this.pmClienteService.clienteActual()?.nombres_cliente ?? '';
  }

  get textoSaludo(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_proxima_hora.saludo, {
      nombre: this.nombreCliente
    });
  }

  // ---------------------------------------------------------------------
  // Carga
  // ---------------------------------------------------------------------

  /**
   * De las citas próximas se toma solo la primera. El backend ya las devuelve
   * filtradas a las activas y futuras; ordenarlas aquí evita depender de que
   * lleguen ordenadas.
   */
  private cargarProximaHora(): void {
    const idCliente = this.pmClienteService.clienteActual()?.id_cliente;
    if (!idCliente) {
      this.cargando = false;
      return;
    }

    this.pmCitaService.getMisCitas(idCliente, true).subscribe({
      next: (citas) => {
        const ordenadas = [...citas].sort(
          (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
        );
        this.cita = ordenadas[0] ?? null;
        this.cargando = false;

        if (this.cita) {
          this.calcularPendientes();
        } else {
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.cargando = false;
        this.errorMensaje = this.t().pmc_proxima_hora.error_servidor;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Si ya hay un video colgado de esta cita no se le pide otro. La lista de
   * videos es un endpoint aparte, así que el pendiente del video se resuelve
   * cuando llega; los demás no esperan por él.
   */
  private calcularPendientes(): void {
    const cita = this.cita;
    if (!cita) return;

    this.pendiente = {
      video: this.pmCitaService.admiteVideo(cita),
      videoListo: false,
      cambios: this.pmCitaService.permiteCambios(cita)
    };
    this.cdr.detectChanges();

    if (!this.pendiente.video) return;

    this.pmClienteService.getMisVideos().subscribe({
      next: (videos) => {
        const tieneVideo = videos.some(video => video.cita === cita.id_cita && video.esta_vigente);
        this.pendiente = { ...this.pendiente, video: !tieneVideo, videoListo: tieneVideo };
        this.cdr.detectChanges();
      },
      // Sin la lista se ofrece adjuntar igual: sugerirlo de más es inofensivo,
      // la pantalla de video vuelve a validar.
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

  // ---------------------------------------------------------------------
  // Presentación
  // ---------------------------------------------------------------------

  get nombreProfesional(): string {
    if (!this.cita) return '';
    return this.nombresProfesional.get(this.cita.profesional) ?? '';
  }

  get textoConProfesional(): string {
    return this.textosService.reemplazarVariables(this.t().pmc_proxima_hora.con_profesional, {
      profesional: this.nombreProfesional
    });
  }

  /**
   * Cuánto falta, en las palabras que usaría una persona. Se compara por día
   * calendario y no por horas de diferencia: una cita de mañana a las 9 está
   * "mañana" aunque falten menos de 24 horas.
   */
  get textoFalta(): string {
    if (!this.cita) return '';

    const textos = this.t().pmc_proxima_hora;
    const dias = this.diasHastaLaCita;

    if (dias <= 0) return textos.falta_hoy;
    if (dias === 1) return textos.falta_manana;

    return this.textosService.reemplazarVariables(textos.falta_dias, { dias: dias + '' });
  }

  private get diasHastaLaCita(): number {
    if (!this.cita) return 0;

    const aMedianoche = (fecha: Date) =>
      new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();

    const diferencia = aMedianoche(new Date(this.cita.fecha_hora)) - aMedianoche(new Date());
    return Math.round(diferencia / (1000 * 60 * 60 * 24));
  }

  get textoTermina(): string {
    if (!this.cita) return '';

    const fin = this.pmCitaService.fechaHoraFin(this.cita);
    const dos = (n: number) => `${n}`.padStart(2, '0');
    return this.textosService.reemplazarVariables(this.t().pmc_proxima_hora.termina_a_las, {
      hora: `${dos(fin.getHours())}:${dos(fin.getMinutes())}`
    });
  }

  get hayPendientes(): boolean {
    return this.pendiente.video || this.pendiente.videoListo || this.pendiente.cambios;
  }

  // ---------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------

  /** Con la cita ya elegida, para no hacerla buscar de nuevo en el selector. */
  irAlVideo(): void {
    this.router.navigate(['/portalmedico/paciente/video'], {
      queryParams: this.cita ? { cita: this.cita.id_cita } : {}
    });
  }

  /** "Mis citas" ya sabe reagendar y cancelar; no se duplica esa lógica aquí. */
  irAMisCitas(): void {
    this.router.navigate(['/portalmedico/paciente/citas']);
  }

  irAReservar(): void {
    this.router.navigate(['/portalmedico/paciente/citas/reservar']);
  }
}
