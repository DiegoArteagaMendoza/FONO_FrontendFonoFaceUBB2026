import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortalMedicoService, ProfesionalPerfil } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html'
})
export class PortalMedicoPerfilComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  perfil: ProfesionalPerfil | null = null;
  cargando = true;

  formularioDatos: FormGroup;
  guardandoDatos = false;
  mensajeDatos: string | null = null;
  errorDatos: string | null = null;

  formularioPassword: FormGroup;
  guardandoPassword = false;
  mensajePassword: string | null = null;
  errorPassword: string | null = null;

  eliminandoCuenta = false;
  errorEliminar: string | null = null;

  constructor(
    private fb: FormBuilder,
    private portalMedicoService: PortalMedicoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.formularioDatos = this.fb.group({
      nombres_profesional: ['', Validators.required],
      apellidos_profesional: ['', Validators.required],
      email_profesional: ['', [Validators.required, Validators.email]],
      telefono_profesional: ['', Validators.required],
      numero_registro_salud_profesional: ['']
    });

    this.formularioPassword = this.fb.group({
      password_actual: ['', Validators.required],
      password_nueva: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.portalMedicoService.getPerfil().subscribe({
      next: (datos) => {
        this.perfil = datos;
        this.formularioDatos.patchValue(datos);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el perfil del profesional', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarDatos(): void {
    this.mensajeDatos = null;
    this.errorDatos = null;

    if (this.formularioDatos.invalid) {
      this.formularioDatos.markAllAsTouched();
      return;
    }

    this.guardandoDatos = true;
    this.portalMedicoService.editarPerfil(this.formularioDatos.value).subscribe({
      next: (datos) => {
        this.perfil = datos;
        this.guardandoDatos = false;
        this.mensajeDatos = this.t().pm_perfil.exito_actualizacion;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar el perfil', err);
        this.guardandoDatos = false;
        this.errorDatos = this.portalMedicoService.extraerMensajeError(err, this.t().pm_perfil.error_actualizar);
        this.cdr.detectChanges();
      }
    });
  }

  cambiarPassword(): void {
    this.mensajePassword = null;
    this.errorPassword = null;

    if (this.formularioPassword.invalid) {
      this.formularioPassword.markAllAsTouched();
      return;
    }

    this.guardandoPassword = true;
    this.portalMedicoService.cambiarPassword(this.formularioPassword.value).subscribe({
      next: () => {
        this.guardandoPassword = false;
        this.mensajePassword = this.t().pm_perfil.exito_password;
        this.formularioPassword.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar la contraseña', err);
        this.guardandoPassword = false;
        this.errorPassword = this.portalMedicoService.extraerMensajeError(err, this.t().pm_perfil.error_password);
        this.cdr.detectChanges();
      }
    });
  }

  eliminarCuenta(): void {
    const confirmar = confirm(this.t().pm_perfil.confirmar_eliminar);
    if (!confirmar) return;

    this.errorEliminar = null;
    this.eliminandoCuenta = true;
    this.portalMedicoService.eliminarCuenta().subscribe({
      next: () => {
        this.router.navigate(['/portalmedico/login']);
      },
      error: (err) => {
        console.error('Error al desactivar la cuenta', err);
        this.eliminandoCuenta = false;
        this.errorEliminar = this.portalMedicoService.extraerMensajeError(err, this.t().erorres.error_eliminacion);
        this.cdr.detectChanges();
      }
    });
  }
}
