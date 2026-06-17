import { Component, ChangeDetectorRef } from '@angular/core'; // 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InformacionService } from '../../../core/services/informacion/informacion';

@Component({
  selector: 'app-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear.html',
  styleUrls: ['./crear.scss']
})
export class Crear {
  crearForm: FormGroup;
  imagenesSeleccionadas: File[] = [];
  isSubmitting = false;
  errorMensaje = '';

  constructor(
    private fb: FormBuilder,
    private informacionService: InformacionService,
    private router: Router,
    private cdr: ChangeDetectorRef // 2. Lo inyectamos en el constructor
  ) {
    this.crearForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      categoria: ['', Validators.required],
      contenido: ['', Validators.required]
    });
  }

  // Manejador cuando el usuario selecciona imágenes
  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.errorMensaje = '';

    if (files.length > 4) {
      this.errorMensaje = 'Solo puedes subir un máximo de 4 imágenes.';
      this.cdr.detectChanges(); // Forzamos actualización visual aquí también por si acaso
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

    // 1. Preparamos el FormData
    const formData = new FormData();
    formData.append('titulo', this.crearForm.get('titulo')?.value);
    formData.append('categoria', this.crearForm.get('categoria')?.value);
    formData.append('contenido', this.crearForm.get('contenido')?.value);

    // 2. Adjuntamos las imágenes seleccionadas
    this.imagenesSeleccionadas.forEach((archivo) => {
      formData.append('imagenes_subidas', archivo);
    });

    // 3. Enviamos al backend
    this.informacionService.crearInformacion(formData).subscribe({
      next: (respuesta) => {
        console.log('Información creada con éxito', respuesta);
        this.isSubmitting = false;
        this.router.navigate(['/informacion']); 
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

        // 3. ¡LA MAGIA! Obligamos a Angular a mostrar el error inmediatamente
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/informacion']);
  }
}