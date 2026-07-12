import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InformacionService, Informacion } from '../../../core/services/informacion/informacion';

@Component({
  selector: 'app-informacion-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informacion.html',
  styleUrls: ['./informacion.scss']
})
export class InformacionClienteComponent implements OnInit {
  articulosFiltrados: Informacion[] = []; // Solo necesitamos esta lista
  cargando = true;
  
  public backendUrl = 'http://127.0.0.1:8000';

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
    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  verDetalle(idArticulo: number): void {
    this.router.navigate(['/portal/prevencion', idArticulo]);
  }
}