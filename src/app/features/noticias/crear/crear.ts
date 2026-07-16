import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoticiasService } from '../../../core/services/noticias/noticias';

// IMPORT DE TEXTOS
import { TextosService } from '../../../core/services/textos/textos';

@Component({
  selector: 'app-crear-noticia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear.html',
  styleUrls: ['./crear.scss']
})
export class CrearNoticia {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  crearForm: FormGroup;
  imagenesSeleccionadas: File[] = [];
  isSubmitting = false;
  errorMensaje = '';

  constructor(
    private fb: FormBuilder,
    private noticiasService: NoticiasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.crearForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      contenido: ['', Validators.required]
    });
  }

  // Manejador cuando el usuario selecciona imágenes
  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.errorMensaje = '';

    if (files.length > 4) {
      this.errorMensaje = this.t().creacion_noticias.max_imagenes;
      this.cdr.detectChanges();
      return;
    }

    this.imagenesSeleccionadas = [];
    for (let i = 0; i < files.length; i++) {
      this.imagenesSeleccionadas.push(files[i]);
    }
  }

  onSubmit(): void {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    // 1. Preparamos el FormData (el backend espera multipart/form-data)
    const formData = new FormData();
    formData.append('titulo', this.crearForm.get('titulo')?.value);
    formData.append('contenido', this.crearForm.get('contenido')?.value);

    // 2. Adjuntamos las imágenes seleccionadas
    this.imagenesSeleccionadas.forEach((archivo) => {
      formData.append('imagenes_subidas', archivo);
    });

    // 3. Enviamos al backend
    this.noticiasService.crearNoticia(formData).subscribe({
      next: (respuesta) => {
        console.log('Noticia creada con éxito', respuesta);
        this.isSubmitting = false;
        this.router.navigate(['/administracion/noticias']);
      },
      error: (err) => {
        console.error('Error devuelto por el servidor:', err);
        this.isSubmitting = false;

        // MANEJO DE ERRORES HTTP DETALLADO
        if (err.status === 400) {
          let mensajes = [];
          for (const campo in err.error) {
            if (err.error.hasOwnProperty(campo)) {
              const errorDelCampo = Array.isArray(err.error[campo]) ? err.error[campo].join(' ') : err.error[campo];
              mensajes.push(`• ${campo.toUpperCase()}: ${errorDelCampo}`);
            }
          }
          this.errorMensaje = 'Revisa los siguientes datos:\n' + mensajes.join('\n');

        } else if (err.status === 401 || err.status === 403) {
          this.errorMensaje = 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.';

        } else if (err.status >= 500) {
          this.errorMensaje = 'Ocurrió un problema en el servidor. Por favor, intenta de nuevo más tarde.';

        } else {
          this.errorMensaje = `Ocurrió un error inesperado (Código ${err.status}). Verifica tu conexión a internet.`;
        }

        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/administracion/noticias']);
  }
}
