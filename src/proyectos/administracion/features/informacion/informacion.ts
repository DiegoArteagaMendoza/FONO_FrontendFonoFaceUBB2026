import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InformacionService, Informacion } from '@core/services/informacion/informacion';

// IMPORT DE TEXTOS
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';

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

  public textosService = inject(TextosService)

  public t = this.textosService.t;

  categoriaActual: string = '';

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
    
    // Si categoriaActual tiene un valor, se lo pasamos, si no, pasamos undefined
    const parametroCategoria = this.categoriaActual ? this.categoriaActual : undefined;

    this.informacionService.getInformacion(parametroCategoria).subscribe({
      next: (datos) => {
        this.listaInformacion = datos.filter(item => item.estado);
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

  filtrarPorCategoria(event: any): void {
    this.categoriaActual = event.target.value;
    this.cargarDatos(); // Volvemos a pedir los datos a la API con el nuevo filtro
  }

  obtenerUrlImagen(rutaImagen: string): string {
    return resolverUrlImagen(rutaImagen);
  }

  // Métodos de navegación
  irACrear(): void {
    this.router.navigate(['administracion/informacion/crear']);
  }

  editarInformacion(id: number): void {
    this.router.navigate(['administracion/informacion/editar', id]);
  }

  eliminarInformacion(id: number): void {
    // 1. Solicitamos una confirmación nativa antes de proceder
    const confirmar = confirm(this.textosService.t().globales.confirmacion_eliminar);
    
    if (!confirmar) {
      return; // Si el usuario cancela, no hacemos nada
    }

    // 2. Llamamos al servicio de eliminación
    this.informacionService.eliminarInformacion(id).subscribe({
      next: (respuesta) => {
        console.log('Respuesta del servidor:', respuesta); // { mensaje: "Información eliminada correctamente" }
        
        // 3. Filtramos el arreglo local para remover el ítem eliminado de la tabla de forma inmediata
        this.listaInformacion = this.listaInformacion.filter(item => item.id_informacion !== id);
        
        // 4. Forzamos la detección de cambios para actualizar el HTML al instante
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al intentar eliminar el registro:', err);
        alert(this.textosService.t().erorres.error_eliminacion);
      }
    });
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