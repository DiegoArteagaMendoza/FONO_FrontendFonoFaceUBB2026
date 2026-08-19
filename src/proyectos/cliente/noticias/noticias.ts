import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoticiasService, Noticia } from '@core/services/noticias/noticias';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-noticias-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './noticias.html',
  styleUrls: ['./noticias.scss']
})
export class NoticiasClienteComponent implements OnInit, OnDestroy {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  public backendUrl = 'http://127.0.0.1:8000';

  noticias: Noticia[] = [];
  destacadas: Noticia[] = [];   // Las que van en el carrusel (máx. 5)
  cargando = true;

  // --- Estado del carrusel ---
  currentIndex = 0;
  intervalId: any;

  // --- Newsletter ---
  newsletterForm: FormGroup;
  newsletterEnviado = false;
  newsletterEnviando = false;
  newsletterError = '';
  newsletterMensajeExito = '';

  constructor(
    private noticiasService: NoticiasService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.newsletterForm.get('email'); }

  ngOnInit(): void {
    this.cargarNoticias();
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
  }

  cargarNoticias(): void {
    this.cargando = true;
    this.noticiasService.getNoticias().subscribe({
      next: (datos) => {
        // El backend ya filtra por activas y ordena de la más nueva a la más vieja
        this.noticias = datos;
        this.destacadas = datos.slice(0, 5);
        this.cargando = false;
        if (this.destacadas.length > 1) {
          this.iniciarAutoplay();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las noticias', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(noticia: Noticia): string {
    if (!noticia.imagenes || noticia.imagenes.length === 0) return '';
    const rutaImagen = noticia.imagenes[0].imagen;

    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;

    // Parche de seguridad para asegurar la ruta de medios de Django
    if (!rutaImagen.includes('/media/')) {
      const limpia = rutaImagen.startsWith('/') ? rutaImagen.slice(1) : rutaImagen;
      return `${this.backendUrl}/media/${limpia}`;
    }
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  verDetalle(idNoticia: number): void {
    this.router.navigate(['/portal/noticias', idNoticia]);
  }

  // ================== CARRUSEL ==================
  siguiente(): void {
    this.currentIndex = (this.currentIndex === this.destacadas.length - 1) ? 0 : this.currentIndex + 1;
    this.reiniciarAutoplay();
  }

  anterior(): void {
    this.currentIndex = (this.currentIndex === 0) ? this.destacadas.length - 1 : this.currentIndex - 1;
    this.reiniciarAutoplay();
  }

  irA(index: number): void {
    this.currentIndex = index;
    this.reiniciarAutoplay();
  }

  iniciarAutoplay(): void {
    this.intervalId = setInterval(() => this.siguiente(), 5000);
  }

  detenerAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  reiniciarAutoplay(): void {
    this.detenerAutoplay();
    this.iniciarAutoplay();
  }

  // ================== NEWSLETTER ==================
  suscribirse(): void {
    if (this.newsletterForm.invalid) {
      this.newsletterForm.markAllAsTouched();
      return;
    }

    this.newsletterEnviando = true;
    this.newsletterError = '';

    this.noticiasService.suscribirNewsletter(this.newsletterForm.value.email).subscribe({
      next: (respuesta) => {
        this.newsletterEnviando = false;
        this.newsletterEnviado = true;
        // Mostramos el mensaje que entrega el backend (nuevo, duplicado o reactivado)
        this.newsletterMensajeExito = respuesta.mensaje || this.t().portal_noticias.newsletter_exito;
        this.newsletterForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al suscribir al newsletter', err);
        this.newsletterEnviando = false;
        this.newsletterError = this.t().portal_noticias.newsletter_error_servidor;
        this.cdr.detectChanges();
      }
    });
  }
}
