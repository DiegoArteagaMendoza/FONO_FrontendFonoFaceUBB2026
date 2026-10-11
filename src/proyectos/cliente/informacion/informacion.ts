import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InformacionService, Informacion } from '@core/services/informacion/informacion';
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';

@Component({
  selector: 'app-informacion-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informacion.html',
  styleUrls: ['./informacion.scss']
})
export class InformacionClienteComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  articulosFiltrados: Informacion[] = []; // Solo necesitamos esta lista
  cargando = true;

  constructor(
    private informacionService: InformacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarArticulosPrevencion();
  }

  cargarArticulosPrevencion(): void {
    this.cargando = true;
    this.informacionService.getInformacion().subscribe({
      next: (datos) => {
        // Filtramos directamente por estado y categoría 'PE'
        this.articulosFiltrados = datos.filter(item => 
          item.estado && item.categoria === 'PE'
        );
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la información', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(rutaImagen: string): string {
    return resolverUrlImagen(rutaImagen);
  }

  verDetalle(idArticulo: number): void {
    this.router.navigate(['/portal/prevencion', idArticulo]);
  }
}