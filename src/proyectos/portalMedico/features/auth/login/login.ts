import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})
export class PortalMedicoLoginComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private portalMedicoService: PortalMedicoService
  ) {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('expirada')) {
      this.errorMessage = this.t().pm_login.alerta_sesion_expirada;
    }
  }

  get identificador() { return this.loginForm.get('identificador'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.portalMedicoService.login(this.loginForm.value).subscribe({
      next: (respuesta) => {
        this.portalMedicoService.setSesionProfesional(respuesta);
        this.isSubmitting = false;
        this.router.navigate(['/portalmedico/perfil']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.status === 401
          ? this.t().pm_login.error_credenciales
          : this.t().pm_login.error_servidor;
      }
    });
  }
}
