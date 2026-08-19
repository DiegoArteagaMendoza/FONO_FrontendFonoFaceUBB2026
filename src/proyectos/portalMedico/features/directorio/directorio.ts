import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalMedicoService, ProfesionalDirectorio } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-directorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './directorio.html'
})
export class PortalMedicoDirectorioComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  profesionales: ProfesionalDirectorio[] = [];
  cargando = true;

  constructor(
    private portalMedicoService: PortalMedicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.portalMedicoService.getDirectorio().subscribe({
      next: (datos) => {
        this.profesionales = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el directorio de profesionales', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
