import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.html'
})
export class PortalMedicoRegistroComponent {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  formulario: FormGroup;
  isSubmitting = false;
  errorMensaje: string | null = null;
  exito = false;

  constructor(
    private fb: FormBuilder,
    private portalMedicoService: PortalMedicoService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      nombres_profesional: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos_profesional: ['', [Validators.required, Validators.maxLength(100)]],
      rut_profesional: ['', [Validators.required, Validators.pattern(/^[0-9]{7,8}-?[0-9kK]$/)]],
      email_profesional: ['', [Validators.required, Validators.email]],
      telefono_profesional: ['', [Validators.required, Validators.pattern(/^(\+?56)?[2-9][0-9]{7,8}$/)]],
      numero_registro_salud_profesional: [''],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    this.errorMensaje = null;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.portalMedicoService.registrar(this.formulario.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.exito = true;
        setTimeout(() => this.router.navigate(['/portalmedico/login']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(err, this.t().pm_registro.error_servidor);
      }
    });
  }
}
