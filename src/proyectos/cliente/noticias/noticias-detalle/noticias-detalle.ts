import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NoticiasService, Noticia } from '@core/services/noticias/noticias';

// IMPORT DE TEXTOS
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-noticias-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias-detalle.html',
  styleUrls: ['./noticias-detalle.scss']
})
export class NoticiasDetalleComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  noticia: Noticia | null = null;
  cargando = true;
  errorMensaje = '';
  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noticiasService: NoticiasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarNoticia(id);
    } else {
      this.volver();
    }
  }

  cargarNoticia(id: number): void {
    this.cargando = true;
    this.noticiasService.getNoticias().subscribe({
      next: (datos) => {
        const encontrada = datos.find(item => item.id_noticia === id && item.estado);
        if (encontrada) {
          this.noticia = encontrada;
        } else {
          this.errorMensaje = this.t().portal_noticia_detalle.no_encontrada;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la noticia', err);
        this.errorMensaje = this.t().portal_noticia_detalle.error_conexion;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(ruta: string): string {
    if (!ruta) return '';
    if (ruta.startsWith('http')) return ruta;

    // Parche de seguridad para asegurar la ruta de medios de Django
    if (!ruta.includes('/media/')) {
      const limpia = ruta.startsWith('/') ? ruta.slice(1) : ruta;
      return `${this.backendUrl}/media/${limpia}`;
    }
    return ruta.startsWith('/') ? this.backendUrl + ruta : `${this.backendUrl}/${ruta}`;
  }

  volver(): void {
    this.router.navigate(['/portal/noticias']);
  }
}
