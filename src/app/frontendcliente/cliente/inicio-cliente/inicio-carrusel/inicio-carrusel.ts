import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { HttpClient } from "@angular/common/http";

// 1. Añadimos la interfaz de la imagen tal como la devuelve Django
export interface ImagenBanner {
  id: number;
  imagen: string;
}

// 2. Actualizamos la interfaz principal
export interface CarruselItem {
  id_banner?: number;
  titulo: string;
  descripcion: string;
  imagenes?: ImagenBanner[]; // La API envía un arreglo de imágenes
  imagen?: string;           // Lo mantenemos para los datos por defecto (fallback)
}

@Component({
  selector: 'app-inicio-carrusel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio-carrusel.html',
  styleUrls: ['./inicio-carrusel.scss']
})
export class InicioCarruselComponent implements OnInit, OnDestroy {
  public backendUrl = 'http://127.0.0.1:8000';
  
  // Mantenemos tus datos actuales como Fallback
  caracteristicas: CarruselItem[] = [
    {
      titulo: '¿Qué es la voz?',
      descripcion: 'Explora nuestra biblioteca de información sobre niños, profesores, cantantes y actores, locutores y público general.',
      imagen: 'https://images.unsplash.com/photo-1516280440502-8698145244be?q=80&w=1200&auto=format&fit=crop'
    },
    {
      titulo: 'Últimas Noticias',
      descripcion: 'Mantente al día con las novedades, eventos y actualizaciones de nuestra plataforma.',
      imagen: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop'
    },
    {
      titulo: '¿Cómo está mi voz?',
      descripcion: 'Recomendaciones y ejercicios específicos para cuidar tu salud vocal día a día.',
      imagen: 'https://images.unsplash.com/photo-1520626338029-4d6425c27f91?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  currentIndex = 0;
  intervalId: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarContenidoCarrusel();
  }

  ngOnDestroy() {
    this.detenerAutoplay();
  }

  cargarContenidoCarrusel(): void {
    const url = `${this.backendUrl}/api/usuarios/banners/listar/`; // ¡Asegúrate de incluir /api/ si tu backend lo requiere!

    this.http.get<CarruselItem[]>(url).subscribe({
      next: (datos) => {
        if (datos && datos.length > 0) {
          this.caracteristicas = datos;
        }
        
        this.currentIndex = 0; 
        this.iniciarAutoplay();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Backend desconectado o vacío. Inicializando carrusel con datos por defecto.', err);
        this.iniciarAutoplay();
        this.cdr.detectChanges();
      }
    });
  }

  // 3. Modificamos este método para que acepte un objeto CarruselItem completo
  obtenerUrlImagen(item: CarruselItem): string {
    let rutaImagen = '';

    // Si viene de la API, leemos del arreglo de imágenes
    if (item.imagenes && item.imagenes.length > 0) {
      rutaImagen = item.imagenes[0].imagen;
    } 
    // Si viene del fallback local, usamos el string directo
    else if (item.imagen) {
      rutaImagen = item.imagen;
    }

    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;
    
    if (!rutaImagen.includes('/media/')) {
      const limpia = rutaImagen.startsWith('/') ? rutaImagen.slice(1) : rutaImagen;
      return `${this.backendUrl}/media/${limpia}`;
    }
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  siguiente() {
    this.currentIndex = (this.currentIndex === this.caracteristicas.length - 1) ? 0 : this.currentIndex + 1;
    this.reiniciarAutoplay();
  }

  anterior() {
    this.currentIndex = (this.currentIndex === 0) ? this.caracteristicas.length - 1 : this.currentIndex - 1;
    this.reiniciarAutoplay();
  }

  irA(index: number) {
    this.currentIndex = index;
    this.reiniciarAutoplay();
  }

  iniciarAutoplay() {
    this.intervalId = setInterval(() => {
      this.siguiente();
    }, 5000);
  }

  detenerAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  reiniciarAutoplay() {
    this.detenerAutoplay();
    this.iniciarAutoplay();
  }
}