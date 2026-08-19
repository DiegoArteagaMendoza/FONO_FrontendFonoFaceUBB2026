import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortalMedicoService, Especialidad, ProfesionalEspecialidad } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-especialidades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './especialidades.html'
})
export class PortalMedicoEspecialidadesComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  todasLasEspecialidades: Especialidad[] = [];
  misEspecialidades: ProfesionalEspecialidad[] = [];
  cargando = true;
  errorMensaje: string | null = null;
  mensajeExito: string | null = null;
  procesando: number | null = null;

  constructor(
    private portalMedicoService: PortalMedicoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.portalMedicoService.getPerfil().subscribe({
      next: (perfil) => {
        this.misEspecialidades = perfil.especialidades_asignadas;
        this.portalMedicoService.getEspecialidades().subscribe({
          next: (todas) => {
            this.todasLasEspecialidades = todas;
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar especialidades', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  yaAsignada(idEspecialidad: number): boolean {
    return this.misEspecialidades.some(e => e.id_especialidad === idEspecialidad);
  }

  asignar(especialidad: Especialidad): void {
    this.errorMensaje = null;
    this.mensajeExito = null;
    this.procesando = especialidad.id_especialidad;

    this.portalMedicoService.asignarEspecialidad(especialidad.id_especialidad).subscribe({
      next: (relacion) => {
        this.misEspecialidades = [...this.misEspecialidades, relacion];
        this.procesando = null;
        this.mensajeExito = this.t().pm_especialidades.exito_asignar;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al asignar la especialidad', err);
        this.procesando = null;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(err, this.t().pm_especialidades.error_asignar);
        this.cdr.detectChanges();
      }
    });
  }

  quitar(idEspecialidad: number): void {
    const confirmar = confirm(this.t().pm_especialidades.confirmar_quitar);
    if (!confirmar) return;

    this.errorMensaje = null;
    this.mensajeExito = null;
    this.procesando = idEspecialidad;

    this.portalMedicoService.quitarEspecialidad(idEspecialidad).subscribe({
      next: () => {
        this.misEspecialidades = this.misEspecialidades.filter(e => e.id_especialidad !== idEspecialidad);
        this.procesando = null;
        this.mensajeExito = this.t().pm_especialidades.exito_quitar;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al quitar la especialidad', err);
        this.procesando = null;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(err, this.t().pm_especialidades.error_quitar);
        this.cdr.detectChanges();
      }
    });
  }
}
