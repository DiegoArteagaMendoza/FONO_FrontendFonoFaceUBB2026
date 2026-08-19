import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdministracionService, CarruselItem } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administracion-inicio.html'
})
export class AdministracionInicioComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  listaItems: CarruselItem[] = [];
  cargando = true;
  itemSeleccionado: CarruselItem | null = null; // <- Nueva variable para el modal
  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private adminService: AdministracionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.adminService.getInicio().subscribe({
      next: (datos) => {
        this.listaItems = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la configuración de inicio', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(rutaImagen: string | null): string {
    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;
    
    if (!rutaImagen.includes('/media/')) {
      const limpia = rutaImagen.startsWith('/') ? rutaImagen.slice(1) : rutaImagen;
      return `${this.backendUrl}/media/${limpia}`;
    }
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  irACrear(): void {
    this.router.navigate(['/administracion/carrusel/inicio/crear']);
  }

  editarItem(id: number): void {
    this.router.navigate(['/administracion/carrusel/inicio/editar', id]); // <- Corrección de ruta absoluta añadida aquí
  }

  eliminarItem(id: number | undefined): void {
    if (!id) return;
    if (confirm(this.t().globales.confirmacion_eliminar)) {
      this.adminService.eliminarInicio(id).subscribe({
        next: () => {
          this.listaItems = this.listaItems.filter(item => item.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert(this.t().erorres.error_eliminacion);
        }
      });
    }
  }

  // --- MÉTODOS DEL MODAL ---
  verDetalle(item: CarruselItem): void {
    this.itemSeleccionado = item;
    this.cdr.detectChanges(); 
  }

  cerrarDetalle(): void {
    this.itemSeleccionado = null;
    this.cdr.detectChanges();
  }
}