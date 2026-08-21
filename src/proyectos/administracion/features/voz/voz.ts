import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VozService, Voz } from '@core/services/voz/voz';
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';

@Component({
  selector: 'app-voz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voz.html',
  // styleUrls: ['./voz.scss'] // O comentado si usas el global
})
export class VozAdminComponent implements OnInit {
  // 1. Inyectamos el servicio de textos
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  listaVoz: Voz[] = [];
  cargando = true;
  itemSeleccionado: Voz | null = null;

  categoriaActual: string = '';

  constructor(
    private vozService: VozService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    const peticion = this.categoriaActual
      ? this.vozService.getVozPorCategoria(this.categoriaActual)
      : this.vozService.getVoz();

    peticion.subscribe({
      next: (datos) => {
        this.listaVoz = datos.filter(item => item.estado);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el contenido de voz', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorCategoria(event: any): void {
    this.categoriaActual = event.target.value;
    this.cargarDatos();
  }

  obtenerUrlImagen(rutaImagen: string | null): string {
    return resolverUrlImagen(rutaImagen);
  }

  irACrear(): void {
    this.router.navigate(['administracion/voz/crear']);
  }

  editarVoz(id: number): void {
    this.router.navigate(['administracion/voz/editar', id]);
  }

  eliminarVoz(id: number): void {
    // 2. Usamos el texto de confirmación global
    const confirmar = confirm(this.t().globales.confirmacion_eliminar);
    if (!confirmar) return;

    this.vozService.eliminarVoz(id).subscribe({
      next: (respuesta) => {
        console.log('Contenido de voz eliminado', respuesta);
        this.listaVoz = this.listaVoz.filter(item => item.id_voz !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        // 3. Usamos el texto de error de eliminación
        alert(this.t().erorres.error_eliminacion);
      }
    });
  }

  verDetalle(item: Voz): void {
    this.itemSeleccionado = item;
    this.cdr.detectChanges();
  }

  cerrarDetalle(): void {
    this.itemSeleccionado = null;
    this.cdr.detectChanges();
  }

  getBadgeClass(categoria: string): string {
    const map: any = {
      'DEFINICION': 'badge-definicion',
      'ANATOMIA': 'badge-anatomia',
      'FISIOLOGIA': 'badge-fisiologia',
      'TRASTORNOS': 'badge-trastornos',
      'IMPORTANCIA': 'badge-importancia',
      'CURIOSIDADES': 'badge-curiosidades'
    };
    return map[categoria] || 'badge-default';
  }
}
