import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { TextosService } from '@core/services/textos/textos';

/** Los dos tipos de cuenta que pueden entrar al Portal Médico */
export type TipoCuenta = 'paciente' | 'profesional';

/**
 * Inicio de sesión único del Portal Médico.
 *
 * Antes había dos pantallas separadas y el botón "Iniciar Sesión" del navbar
 * llevaba siempre a la del profesional, así que un paciente terminaba en el
 * formulario equivocado. Ahora ambas conviven en una sola vista con pestañas:
 * se cambia de tipo de cuenta sin recargar y cada una llama a su propio
 * endpoint (PmCliente o PmMedico), que son identidades distintas.
 */
@Component({
  selector: 'app-pm-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})
export class PortalMedicoLoginComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private portalMedicoService = inject(PortalMedicoService);
  private pmClienteService = inject(PmClienteService);
  // La app es zoneless: hay que refrescar la vista a mano tras cada respuesta.
  private cdr = inject(ChangeDetectorRef);

  /** Pestaña activa. El paciente va primero por ser el caso más frecuente. */
  tipoCuenta: TipoCuenta = 'paciente';

  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  avisoSesionExpirada = false;

  constructor() {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // ?tipo=profesional|paciente permite enlazar directo a una pestaña
    const tipo = this.route.snapshot.queryParamMap.get('tipo');
    if (tipo === 'profesional' || tipo === 'paciente') {
      this.tipoCuenta = tipo;
    }

    // El interceptor redirige aquí con ?expirada=1 cuando el token dejó de valer
    if (this.route.snapshot.queryParamMap.get('expirada')) {
      this.avisoSesionExpirada = true;
    }
  }

  get identificador() { return this.loginForm.get('identificador'); }
  get password() { return this.loginForm.get('password'); }

  get esPaciente(): boolean {
    return this.tipoCuenta === 'paciente';
  }

  /** Textos de la pestaña activa, para no repetir condicionales en la plantilla */
  get textos() {
    return this.esPaciente ? this.t().pmc_login : this.t().pm_login;
  }

  get rutaRegistro(): string {
    return this.esPaciente ? '/portalmedico/paciente/registro' : '/portalmedico/registro';
  }

  cambiarTipo(tipo: TipoCuenta): void {
    if (this.tipoCuenta === tipo) return;

    this.tipoCuenta = tipo;
    // Limpiamos para no arrastrar credenciales ni errores de la otra cuenta
    this.loginForm.reset();
    this.errorMessage = '';
    this.avisoSesionExpirada = false;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    return this.esPaciente ? this.entrarComoPaciente() : this.entrarComoProfesional();
  }

  private entrarComoPaciente(): void {
    this.pmClienteService.login(this.loginForm.value).subscribe({
      next: (respuesta) => {
        this.pmClienteService.setSesionCliente(respuesta);
        this.isSubmitting = false;
        this.router.navigate(['/portalmedico/paciente/video']);
      },
      error: (err) => this.manejarError(err, this.t().pmc_login.error_credenciales, this.t().pmc_login.error_servidor)
    });
  }

  private entrarComoProfesional(): void {
    this.portalMedicoService.login(this.loginForm.value).subscribe({
      next: (respuesta) => {
        this.portalMedicoService.setSesionProfesional(respuesta);
        this.isSubmitting = false;
        this.router.navigate(['/portalmedico/perfil']);
      },
      error: (err) => this.manejarError(err, this.t().pm_login.error_credenciales, this.t().pm_login.error_servidor)
    });
  }

  private manejarError(err: any, mensajeCredenciales: string, mensajeServidor: string): void {
    this.isSubmitting = false;
    this.errorMessage = err.status === 401 ? mensajeCredenciales : mensajeServidor;
    this.cdr.detectChanges();
  }
}
