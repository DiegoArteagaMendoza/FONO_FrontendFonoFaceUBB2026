import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';
import { RecaptchaModule } from 'ng-recaptcha';
import { TextosService } from '../../../core/services/textos/textos';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecaptchaModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] // O vacío si pasaste todo al global
})
export class Login {
  // 1. Inyectamos el servicio de textos
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  captchaToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials = {
      correo: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.authService.setSession(response);
        this.isSubmitting = false;
        this.router.navigate(['/inicio']); 
      },
      error: (err) => {
        this.isSubmitting = false;
        
        // 2. Usamos los textos dinámicos para los errores
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = this.t().login.error_credenciales;
        } else {
          this.errorMessage = this.t().login.error_servidor;
        }
        console.error('Error de autenticación:', err);
      }
    });
  }
}