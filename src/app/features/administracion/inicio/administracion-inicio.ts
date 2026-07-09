import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdministracionService, CarruselItem } from '../../../core/services/administracion/administracion';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administracion-inicio.html',
  styleUrls: ['./administracion-inicio.scss']
})
export class AdministracionInicioComponent implements OnInit {
  listaItems: CarruselItem[] = [];
  cargando = true;
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
    this.router.navigate(['/administracion/inicio/crear']);
  }

  editarItem(id: number): void {
    this.router.navigate(['/administracion/inicio/editar', id]);
  }

  eliminarItem(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este elemento del carrusel? Esta acción se reflejará inmediatamente en el portal público.')) {
      this.adminService.eliminarInicio(id).subscribe({
        next: () => {
          this.listaItems = this.listaItems.filter(item => item.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert('Hubo un error al intentar eliminar el elemento.');
        }
      });
    }
  }
}