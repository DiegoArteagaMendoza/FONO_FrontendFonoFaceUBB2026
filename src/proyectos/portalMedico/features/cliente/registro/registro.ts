import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pmc-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.html'
})
export class PmClienteRegistroComponent {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmClienteService = inject(PmClienteService);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  formulario: FormGroup;
  isSubmitting = false;
  errorMensaje: string | null = null;
  exito = false;
  nombreRegistrado = '';

  /** Tope del selector de fecha: nadie puede haber nacido mañana */
  hoy = new Date().toISOString().split('T')[0];

  constructor() {
    this.formulario = this.fb.group({
      nombres_cliente: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos_clientes: ['', [Validators.required, Validators.maxLength(100)]],
      rut_cliente: ['', [Validators.required, Validators.pattern(/^[0-9]{7,8}-?[0-9kK]$/)]],
      fecha_nacimiento_cliente: ['', [Validators.required]],
      email_cliente: ['', [Validators.required, Validators.email]],
      telefono_cliente: ['', [Validators.required, Validators.pattern(/^(\+?56)?[2-9][0-9]{7,8}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /** Nombre del paciente con sesión iniciada (si la hay) */
  get nombreClienteAutenticado(): string {
    const cliente = this.pmClienteService.clienteActual();
    return cliente ? `${cliente.nombres_cliente} ${cliente.apellidos_clientes}` : '';
  }

  get yaAutenticado(): boolean {
    return this.pmClienteService.estaAutenticadoComoCliente();
  }

  /** La fecha de nacimiento no puede ser futura */
  get fechaEsFutura(): boolean {
    const valor = this.formulario.get('fecha_nacimiento_cliente')?.value;
    return !!valor && valor > this.hoy;
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  irALogin(): void {
    this.router.navigate(['/portalmedico/paciente/login']);
  }

  irAlVideo(): void {
    this.router.navigate(['/portalmedico/paciente/video']);
  }

  onSubmit(): void {
    this.errorMensaje = null;

    if (this.formulario.invalid || this.fechaEsFutura) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.pmClienteService.registrar(this.formulario.value).subscribe({
      next: (cliente) => {
        this.isSubmitting = false;
        this.exito = true;
        this.nombreRegistrado = cliente.nombres_cliente;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMensaje = this.pmClienteService.extraerMensajeError(
          err,
          this.t().pmc_registro.error_servidor
        );
        this.cdr.detectChanges();
      }
    });
  }
}
