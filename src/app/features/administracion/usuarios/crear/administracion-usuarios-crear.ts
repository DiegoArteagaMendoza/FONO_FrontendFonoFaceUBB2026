import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AdministracionService } from "../../../../core/services/administracion/administracion";
import { TextosService } from "../../../../core/services/textos/textos";

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './administracion-usuarios-crear.html'
})
export class AdministracionUsuarioCrearComponente implements OnInit {
  // Inyectamos el servicio de textos y exponemos el Signal
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  formulario!: FormGroup;
  isSubmitting = false;
  errorMensaje: string | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdministracionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      rut: ['', [Validators.required, Validators.maxLength(12)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipo: [false],
      estado: [true],
      is_staff: [false]
    });
  }

  onSubmit(): void {
    this.errorMensaje = null;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.errorMensaje = 'Por favor, completa correctamente todos los campos obligatorios.';
      return;
    }

    this.isSubmitting = true;
    const datosUsuario = this.formulario.value;

    this.adminService.crearUsuario(datosUsuario).subscribe({
      next: (respuesta) => {
        console.log('Usuario creado exitosamente:', respuesta);
        this.router.navigate(['/administracion/usuario']); 
      },
      error: (err) => {
        console.error('Error al guardar el usuario', err);
        if (err.error && typeof err.error === 'object') {
          const errores = Object.values(err.error).flat().join(' ');
          this.errorMensaje = errores || 'Ocurrió un error al intentar crear el usuario en el servidor.';
        } else {
          this.errorMensaje = 'No se pudo conectar con el servidor. Inténtalo más tarde.';
        }
        this.isSubmitting = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/administracion/usuario']);
  }
}