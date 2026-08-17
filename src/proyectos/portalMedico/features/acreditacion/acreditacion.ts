import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortalMedicoService, Acreditacion, ProfesionalPerfil } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';
import { PasosAcreditacionComponent } from '../../components/pasos-acreditacion/pasos-acreditacion';

@Component({
  selector: 'app-pm-acreditacion',
  standalone: true,
  imports: [CommonModule, PasosAcreditacionComponent],
  templateUrl: './acreditacion.html'
})
export class PortalMedicoAcreditacionComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  acreditacion: Acreditacion | null = null;
  /** Perfil completo: lo necesita la guía de pasos para saber qué falta */
  perfil: ProfesionalPerfil | null = null;
  cargando = true;
  sinSolicitud = false;

  constructor(
    private portalMedicoService: PortalMedicoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idProfesional = this.portalMedicoService.profesionalActual()?.id_profesional;

    if (!this.portalMedicoService.estaAutenticadoComoProfesional() || !idProfesional) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }

    this.portalMedicoService.getEstadoAcreditacion(idProfesional).subscribe({
      next: (datos) => {
        this.acreditacion = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.sinSolicitud = true;
        }
        console.error('Error al consultar la acreditación', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    // El perfil alimenta la guía de pasos (documentos y especialidades cargados).
    // Va aparte para que un fallo aquí no impida ver el estado de la acreditación.
    this.portalMedicoService.getPerfil().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar el perfil para la guía de pasos', err)
    });
  }

  get descripcionEstado(): string {
    switch (this.acreditacion?.estado_verificacion_profesional) {
      case 'PENDIENTE': return this.t().pm_acreditacion.desc_pendiente;
      case 'EN_REVISION': return this.t().pm_acreditacion.desc_en_revision;
      case 'APROBADO': return this.t().pm_acreditacion.desc_aprobado;
      case 'RECHAZADO': return this.t().pm_acreditacion.desc_rechazado;
      default: return '';
    }
  }
}
