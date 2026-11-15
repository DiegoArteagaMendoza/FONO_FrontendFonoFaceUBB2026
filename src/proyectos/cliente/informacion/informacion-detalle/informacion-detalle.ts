import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InformacionService, Informacion } from '@core/services/informacion/informacion';
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';
import { CATEGORIAS_INFORMACION, RUTA_INICIO_PORTAL } from './constants/informacion-detalle.const';

@Component({
  selector: 'app-informacion-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informacion-detalle.html',
  styleUrls: ['./informacion-detalle.scss']
})
export class InformacionDetalleComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  articulo: Informacion | null = null;
  cargando = true;
  errorMensaje = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private informacionService: InformacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarArticulo(id);
    } else {
      this.volver();
    }
  }

  cargarArticulo(id: number): void {
    this.cargando = true;
    this.informacionService.getInformacion().subscribe({
      next: (datos) => {
        const encontrado = datos.find(item => item.id_informacion === id && item.estado);
        if (encontrado) {
          this.articulo = encontrado;
        } else {
          this.errorMensaje = 'El artículo no existe o ya no está disponible.';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar', err);
        this.errorMensaje = 'Error de conexión. Inténtalo más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(ruta: string): string {
    return resolverUrlImagen(ruta);
  }

  // Nombre visible de la categoría del artículo (FA, PE o PO), desde textos.ts
  obtenerNombreCategoria(id: string): string {
    const textos = this.t().portal_informacion_detalle;
    const categoria = this.categoriaDe(id);
    return categoria ? textos[categoria.clave] : textos.categoria_general;
  }

  // Vuelve al listado del apartado del artículo; sin artículo o con una
  // categoría desconocida, al inicio del portal
  volver(): void {
    const categoria = this.articulo ? this.categoriaDe(this.articulo.categoria) : undefined;
    this.router.navigate([categoria ? categoria.ruta : RUTA_INICIO_PORTAL]);
  }

  private categoriaDe(id: string) {
    return CATEGORIAS_INFORMACION[id as keyof typeof CATEGORIAS_INFORMACION];
  }
}