import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdministracionService } from '@core/services/administracion/administracion';
// Inject the service
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-crear-inicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './administracion-inicio-crear.html',
  // styleUrls: ['./administracion-inicio-crear.scss'] // Assuming global styles are used
})
export class AdministracionInicioCrearComponent implements OnInit {
  // Expose the signal
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  formulario!: FormGroup;
  archivoSeleccionado: File | null = null;
  imagenPreview: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdministracionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      
      const reader = new FileReader();
      reader.onload = e => {
        this.imagenPreview = reader.result as string;
        this.cdr.detectChanges(); 
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagen(): void {
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
  }

  onSubmit(): void {
    if (this.formulario.invalid || !this.archivoSeleccionado) {
      this.formulario.markAllAsTouched();
      alert('Por favor, completa todos los campos y selecciona una imagen.');
      return;
    }

    this.isSubmitting = true;
    
    const formData = new FormData();
    formData.append('titulo', this.formulario.get('titulo')?.value);
    formData.append('descripcion', this.formulario.get('descripcion')?.value);
    formData.append('imagenes_subidas', this.archivoSeleccionado);

    this.adminService.crearInicio(formData).subscribe({
      next: (respuesta) => {
        console.log('Elemento creado:', respuesta);
        this.router.navigate(['/administracion/inicio']); 
      },
      error: (err) => {
        console.error('Error al guardar', err);
        alert('Ocurrió un error al intentar guardar el elemento.');
        this.isSubmitting = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/administracion']);
  }
}