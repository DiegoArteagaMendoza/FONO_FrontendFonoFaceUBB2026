import { Component } from '@angular/core';
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
    private router: Router
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
        this.router.navigate(['/informacion']); // Volvemos a la tabla
      },
      error: (err) => {
        console.error('Error al crear', err);
        this.isSubmitting = false;
        this.errorMensaje = 'Ocurrió un error al guardar la información. Verifica tus datos o tu sesión.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/informacion']);
  }
}