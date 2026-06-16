import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth' // <-- Importa tu servicio

//'../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = ''; // Variable para mostrar errores del backend

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // <-- Inyecta el servicio aquí
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

    // Mapeamos los datos: Transformamos 'email' del form a 'correo' para la API
    const credentials = {
      correo: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // Llamamos a tu backend
    this.authService.login(credentials).subscribe({
      next: (response) => {
        // 1. Guardamos los tokens y el usuario en LocalStorage
        this.authService.setSession(response);
        
        // 2. Quitamos el estado de carga
        this.isSubmitting = false;
        
        // 3. Redirigimos al sistema
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