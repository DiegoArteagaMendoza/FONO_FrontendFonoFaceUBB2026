import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortalMedicoService, ProfesionalPerfil, EstadoVerificacion } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-admin-profesionales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-profesionales.html'
})
export class PmAdminProfesionalesComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  profesionales: ProfesionalPerfil[] = [];
  cargando = true;
  errorMensaje: string | null = null;
  filtroEstado: 'todos' | EstadoVerificacion = 'todos';

  constructor(
    private portalMedicoService: PortalMedicoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.errorMensaje = null;
    const estado = this.filtroEstado === 'todos' ? undefined : this.filtroEstado;

    this.portalMedicoService.getProfesionales(estado).subscribe({
      next: (datos) => {
        this.profesionales = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al listar profesionales', err);
        this.cargando = false;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(
          err,
          err.status === 403 ? this.t().pm_profesional_detalle.error_permisos : this.t().erorres.error_cargando_datos
        );
        this.cdr.detectChanges();
      }
    });
  }

  alCambiarFiltro(event: any): void {
    this.filtroEstado = event.target.value;
    this.cargarDatos();
  }

  estadoVigente(profesional: ProfesionalPerfil): EstadoVerificacion {
    return profesional.acreditaciones?.[0]?.estado_verificacion_profesional ?? 'PENDIENTE';
  }

  verDetalle(idProfesional: number): void {
    this.router.navigate(['/administracion/portal-medico/profesionales', idProfesional]);
  }
}
