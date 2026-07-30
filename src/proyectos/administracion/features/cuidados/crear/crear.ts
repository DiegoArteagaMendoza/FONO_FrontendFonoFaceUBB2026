import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CuidadosService } from '@core/services/cuidados/cuidados';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-crear-cuidado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear.html',
  // styleUrls: ['./crear.scss'] // O comentado si usas el global
})
export class CrearCuidado {
  // 1. Inyectamos el servicio de textos
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  crearForm: FormGroup;
  imagenSeleccionada: File | null = null;
  isSubmitting = false;
  errorMensaje = '';

  constructor(
    private fb: FormBuilder,
    private cuidadosService: CuidadosService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.crearForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      publico: ['', Validators.required],
      contenido: ['', Validators.required],
      fuente: ['', Validators.pattern('https?://.+')] 
    });
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.errorMensaje = '';

    if (files.length > 0) {
      this.imagenSeleccionada = files[0];
    } else {
      this.imagenSeleccionada = null;
    }
  }

  onSubmit(): void {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    const formData = new FormData();
    formData.append('titulo', this.crearForm.get('titulo')?.value);
    formData.append('publico', this.crearForm.get('publico')?.value);
    formData.append('contenido', this.crearForm.get('contenido')?.value);

    const fuenteValue = this.crearForm.get('fuente')?.value;
    if (fuenteValue) {
      formData.append('fuente', fuenteValue);
    }

    if (this.imagenSeleccionada) {
      formData.append('img', this.imagenSeleccionada);
    }

    this.cuidadosService.crearCuidado(formData).subscribe({
      next: (respuesta) => {
        console.log('Cuidado creado con éxito', respuesta);
        this.isSubmitting = false;
        this.router.navigate(['administracion/cuidados']); 
      },
      error: (err) => {
        console.error('Error devuelto por el servidor:', err);
        this.isSubmitting = false;

        // Formateo de errores de DRF
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
          this.errorMensaje = `Ocurrió un error inesperado (Código ${err.status}). Verifica tu conexión.`;
        }

        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/cuidados']);
  }
}