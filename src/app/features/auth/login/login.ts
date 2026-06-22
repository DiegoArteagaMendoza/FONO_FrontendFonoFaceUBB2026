import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';

// reCAPTCHA
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
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

  // MÉTODO QUE SE EJECUTA CUANDO EL USUARIO RESUELVE EL CAPTCHA
  // onCaptchaResolved(captchaResponse: string | null): void {
  //   this.captchaToken = captchaResponse;
  //   if (this.captchaToken) {
  //     this.errorMessage = ''; // Limpiamos el error si ya lo resolvió
  //   }
  // }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // // 1. Verificamos que el captcha esté resuelto
    // if (!this.captchaToken) {
    //   this.errorMessage = 'Por favor, verifica que no eres un robot.';
    //   return;
    // }

    this.isSubmitting = true;
    this.errorMessage = '';

    // 2.captcha_token a los datos que van al backend
    const credentials = {
      correo: this.loginForm.value.email,
      password: this.loginForm.value.password,
      // captcha_token: this.captchaToken 
    };

    // Llamamos a tu backend
    this.authService.login(credentials).subscribe({
      next: (response) => {
        // Guardamos los tokens y el usuario en LocalStorage
        this.authService.setSession(response);
        
        // Quitamos el estado de carga
        this.isSubmitting = false;
        
        // Redirigimos al sistema
        this.router.navigate(['/inicio']); 
      },
      error: (err) => {
        this.isSubmitting = false;
        // Manejo de errores (ej. credenciales incorrectas)
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Correo o contraseña incorrectos.';
        } else {
          this.errorMessage = 'Error al conectar con el servidor.';
        }
        console.error('Error de autenticación:', err);
      }
    });
  }
}