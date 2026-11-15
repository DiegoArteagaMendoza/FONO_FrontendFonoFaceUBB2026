import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdministracionService } from '@core/services/administracion/administracion'; 
import { TextosService } from '@core/services/textos/textos';
import { PREFIJO_CLAVE, SECCION_INICIO } from './constants/infoGeneral-crear.const';

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

  constructor(
    private fb: FormBuilder,
    private adminService: AdministracionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.crearForm = this.fb.group({
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

    const payload = {
      ...this.crearForm.value,
      seccion: SECCION_INICIO,
      clave: this.generarClave()
    };

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

  /** Clave única: prefijo + marca de tiempo + sufijo aleatorio (solo [a-z0-9_], < 50 caracteres). */
  private generarClave(): string {
    const tiempo = Date.now().toString(36);
    const aleatorio = Math.random().toString(36).slice(2, 8);
    return `${PREFIJO_CLAVE}_${tiempo}_${aleatorio}`;
  }

  volver(): void {
    this.router.navigate(['/administracion/informacion/inicio']);
  }
}