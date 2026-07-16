import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InformacionService, Informacion } from '../../../core/services/informacion/informacion';
import { TextosService } from '../../../core/services/textos/textos';

@Component({
  selector: 'app-promocion-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promocion.html',
  styleUrls: ['./promocion.scss']
})
export class PromocionClienteComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  articulosFiltrados: Informacion[] = [];
  cargando = true;

  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private informacionService: InformacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarArticulosPromocion();
  }

  cargarArticulosPromocion(): void {
    this.cargando = true;
    this.informacionService.getInformacion().subscribe({
      next: (datos) => {
        // Filtramos directamente por estado y categoría 'PO'
        this.articulosFiltrados = datos.filter(item =>
          item.estado && item.categoria === 'PO'
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

    // Parche de seguridad para asegurar la ruta de medios de Django
    if (!rutaImagen.includes('/media/')) {
      const limpia = rutaImagen.startsWith('/') ? rutaImagen.slice(1) : rutaImagen;
      return `${this.backendUrl}/media/${limpia}`;
    }
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  verDetalle(idArticulo: number): void {
    this.router.navigate(['/portal/promocion', idArticulo]);
  }
}
