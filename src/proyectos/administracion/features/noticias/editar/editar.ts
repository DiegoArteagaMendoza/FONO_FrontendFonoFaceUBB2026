import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NoticiasService, ImagenNoticia } from '@core/services/noticias/noticias';

// IMPORT DE TEXTOS
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-editar-noticia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class EditarNoticia implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  editarForm: FormGroup;
  idNoticia: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';

  imagenesActuales: ImagenNoticia[] = [];
  imagenesNuevas: File[] = [];
  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private fb: FormBuilder,
    private noticiasService: NoticiasService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.editarForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      contenido: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.idNoticia = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idNoticia) {
      this.cargarDatosActuales();
    } else {
      this.volver();
    }
  }

  cargarDatosActuales(): void {
    this.cargandoDatos = true;

    this.noticiasService.getNoticias().subscribe({
      next: (datos) => {
        const noticiaActual = datos.find(item => item.id_noticia === this.idNoticia);
        if (noticiaActual) {
          this.editarForm.patchValue({
            titulo: noticiaActual.titulo,
            contenido: noticiaActual.contenido
          });
          // Guardamos las imágenes para mostrarlas
          this.imagenesActuales = noticiaActual.imagenes || [];
          this.cargandoDatos = false;
        } else {
          this.errorMensaje = this.textosService.t().globales.sin_informacion_encontrada;
          this.cargandoDatos = false;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.errorMensaje = this.textosService.t().erorres.error_cargando_datos;
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(rutaImagen: string): string {
    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  eliminarImagen(idImagen: number): void {
    const confirmar = confirm(this.textosService.t().globales.eliminar_imagen);

    if (!confirmar) {
      return;
    }

    // Eliminación real: el backend borra el archivo físico y el registro
    this.noticiasService.eliminarImagenNoticia(idImagen).subscribe({
      next: () => {
        // Filtramos la imagen borrada del arreglo para que desaparezca de la vista sin recargar
        this.imagenesActuales = this.imagenesActuales.filter(img => img.id !== idImagen);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar imagen', err);
        alert(this.textosService.t().erorres.error_eliminacion);
      }
    });
  }

  // Manejador cuando el usuario selecciona imágenes nuevas
  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.errorMensaje = '';

    // El backend permite un máximo de 4 imágenes por noticia (actuales + nuevas)
    if (this.imagenesActuales.length + files.length > 4) {
      this.errorMensaje = this.t().edicion_noticias.max_imagenes_total;
      this.imagenesNuevas = [];
      event.target.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.imagenesNuevas = [];
    for (let i = 0; i < files.length; i++) {
      this.imagenesNuevas.push(files[i]);
    }
  }

  onSubmit(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    // 1. Actualizamos los textos (titulo y contenido)
    this.noticiasService.editarNoticia(this.idNoticia, this.editarForm.value).subscribe({
      next: () => {
        // 2. Si hay imágenes nuevas, las subimos después de guardar los textos
        if (this.imagenesNuevas.length > 0) {
          this.subirImagenesNuevas();
        } else {
          this.isSubmitting = false;
          this.volver();
        }
      },
      error: (err) => {
        console.error('Error al editar', err);
        this.isSubmitting = false;
        this.errorMensaje = this.textosService.t().erorres.error_actualizar;
        this.cdr.detectChanges();
      }
    });
  }

  private subirImagenesNuevas(): void {
    const formData = new FormData();
    this.imagenesNuevas.forEach((archivo) => {
      formData.append('imagenes_subidas', archivo);
    });

    this.noticiasService.agregarImagenesNoticia(this.idNoticia, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.volver();
      },
      error: (err) => {
        console.error('Error al subir las imágenes nuevas', err);
        this.isSubmitting = false;
        this.errorMensaje = this.textosService.t().erorres.error_actualizar;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/administracion/noticias']);
  }
}
