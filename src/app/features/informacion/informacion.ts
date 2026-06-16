import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InformacionService, Informacion } from '../../core/services/informacion/informacion';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informacion.html',
  styleUrls: ['./informacion.scss']
})
export class InformacionComponent implements OnInit {
  listaInformacion: Informacion[] = [];
  cargando = true;
  itemSeleccionado: Informacion | null = null;
  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private informacionService: InformacionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.informacionService.getInformacion().subscribe({
      next: (datos) => {
        // Filtramos solo los que tienen estado true (borrado lógico)
        this.listaInformacion = datos.filter(item => item.estado);
        this.cargando = false;
        
        // Forzamos la detección de cambios cuando la respuesta es exitosa
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la información', err);
        this.cargando = false;

        // Forzamos la detección de cambios también en caso de error
        this.cdr.detectChanges();
      }
    });
  }

  // MÉTODO NUEVO: Formatea la URL de la imagen de forma segura
  obtenerUrlImagen(rutaImagen: string): string {
    if (!rutaImagen) return '';
    
    // Si la API ya devuelve la URL con http/https, la retornamos tal cual
    if (rutaImagen.startsWith('http')) {
      return rutaImagen;
    }
    
    // Si no, concatenamos evitando dobles slashes
    return rutaImagen.startsWith('/') 
      ? this.backendUrl + rutaImagen 
      : `${this.backendUrl}/${rutaImagen}`;
  }

  // Métodos de navegación
  irACrear(): void {
    this.router.navigate(['/informacion/crear']);
  }

  editarInformacion(id: number): void {
    this.router.navigate(['/informacion/editar', id]);
  }

  eliminarInformacion(id: number): void {
    console.log('Llamar a endpoint de eliminación lógica con ID:', id);
  }
  
  verDetalle(item: Informacion): void {
    this.itemSeleccionado = item;
    this.cdr.detectChanges(); 
  }

  cerrarDetalle(): void {
    this.itemSeleccionado = null;
    this.cdr.detectChanges();
  }
}