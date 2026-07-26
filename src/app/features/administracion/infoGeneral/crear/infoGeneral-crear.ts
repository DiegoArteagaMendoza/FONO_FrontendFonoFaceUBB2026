import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdministracionService } from '../../../../core/services/administracion/administracion'; 
import { TextosService } from '../../../../core/services/textos/textos';

@Component({
  selector: 'app-info-general-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './infoGeneral-crear.html'
})
export class AdministracionInfoGeneralCrearComponent {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  crearForm: FormGroup;
  isSubmitting = false;
  errorMensaje = '';

  // LISTA DE SECCIONES PERMITIDAS
  seccionesDisponibles = [
    { valor: 'inicio', etiqueta: 'Página de Inicio' },
    { valor: 'farmacos', etiqueta: 'Módulo de Fármacos' },
    { valor: 'prevencion', etiqueta: 'Módulo de Prevención' },
    { valor: 'promocion', etiqueta: 'Módulo de Promoción' },
    { valor: 'noticias', etiqueta: 'Módulo de Noticias' },
    { valor: 'cuidados', etiqueta: 'Módulo de Cuidados' },
    { valor: 'footer', etiqueta: 'Pie de Página (Footer)' }
  ];

  constructor(
    private fb: FormBuilder,
    private adminService: AdministracionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.crearForm = this.fb.group({
      seccion: ['', [Validators.required, Validators.maxLength(50)]],
      clave: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9_]+$')]], 
      titulo: ['', [Validators.maxLength(150)]],
      descripcion: [''],
      enlace: ['', [Validators.maxLength(255)]]
    });
  }

  onSubmit(): void {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    const payload = this.crearForm.value;

    this.adminService.crearInfoGeneral(payload).subscribe({
      next: (respuesta) => {
        this.isSubmitting = false;
        this.volver();
      },
      error: (err) => {
        console.error('Error al crear info general:', err);
        this.isSubmitting = false;
        
        if (err.status === 400 && err.error?.clave) {
           this.errorMensaje = 'La clave ingresada ya existe. Debe ser única.';
        } else {
           this.errorMensaje = 'Ocurrió un error al intentar guardar el registro.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/administracion/informacion/inicio']);
  }
}