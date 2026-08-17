import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pmc-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})
export class PmClienteLoginComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmClienteService = inject(PmClienteService);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  formulario: FormGroup;
  isSubmitting = false;
  errorMensaje: string | null = null;
  avisoSesionExpirada = false;

  constructor() {
    this.formulario = this.fb.group({
      identificador: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // El interceptor redirige aquí con ?expirada=1 cuando el token dejó de valer
    if (this.route.snapshot.queryParamMap.get('expirada')) {
      this.avisoSesionExpirada = true;
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  onSubmit(): void {
    this.errorMensaje = null;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.pmClienteService.login(this.formulario.value).subscribe({
      next: (respuesta) => {
        this.pmClienteService.setSesionCliente(respuesta);
        this.isSubmitting = false;
        this.router.navigate(['/portalmedico/paciente/video']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMensaje = err.status === 401
          ? this.t().pmc_login.error_credenciales
          : this.pmClienteService.extraerMensajeError(err, this.t().pmc_login.error_servidor);
        this.cdr.detectChanges();
      }
    });
  }
}
