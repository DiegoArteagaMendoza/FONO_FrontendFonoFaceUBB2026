import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NoticiasService, Noticia } from '@core/services/noticias/noticias';

// IMPORT DE TEXTOS
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';

@Component({
  selector: 'app-noticias-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias.html',
  styleUrls: ['./noticias.scss']
})
export class NoticiasAdminComponent implements OnInit {
  listaNoticias: Noticia[] = [];
  cargando = true;
  itemSeleccionado: Noticia | null = null;

  public textosService = inject(TextosService);
  public t = this.textosService.t;

  constructor(
    private noticiasService: NoticiasService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    this.noticiasService.getNoticias().subscribe({
      next: (datos) => {
        // El backend ya devuelve solo las noticias activas
        this.listaNoticias = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las noticias', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(rutaImagen: string): string {
    return resolverUrlImagen(rutaImagen);
  }

  // Métodos de navegación
  irACrear(): void {
    this.router.navigate(['/administracion/noticias/crear']);
  }

  editarNoticia(id: number): void {
    this.router.navigate(['/administracion/noticias/editar', id]);
  }

  eliminarNoticia(id: number): void {
    // 1. Solicitamos una confirmación nativa antes de proceder
    const confirmar = confirm(this.textosService.t().globales.confirmacion_eliminar);

    if (!confirmar) {
      return; // Si el usuario cancela, no hacemos nada
    }

    // 2. Llamamos al servicio de eliminación (borrado lógico en el backend)
    this.noticiasService.eliminarNoticia(id).subscribe({
      next: (respuesta) => {
        console.log('Respuesta del servidor:', respuesta); // { mensaje: "Noticia eliminada correctamente" }

        // 3. Filtramos el arreglo local para remover el ítem eliminado de la tabla de forma inmediata
        this.listaNoticias = this.listaNoticias.filter(item => item.id_noticia !== id);

        // 4. Forzamos la detección de cambios para actualizar el HTML al instante
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al intentar eliminar el registro:', err);
        alert(this.textosService.t().erorres.error_eliminacion);
      }
    });
  }

  verDetalle(item: Noticia): void {
    this.itemSeleccionado = item;
    this.cdr.detectChanges();
  }

  cerrarDetalle(): void {
    this.itemSeleccionado = null;
    this.cdr.detectChanges();
  }
}
