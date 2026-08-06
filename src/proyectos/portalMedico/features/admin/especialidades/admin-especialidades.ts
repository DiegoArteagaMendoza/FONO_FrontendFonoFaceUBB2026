import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PortalMedicoService, Especialidad } from '@core/services/portal-medico/portal-medico';
import { AdministracionService } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-admin-especialidades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-especialidades.html'
})
export class PmAdminEspecialidadesComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  especialidades: Especialidad[] = [];
  cargando = true;

  modalAbierto = false;
  especialidadEnEdicion: Especialidad | null = null;
  formulario: FormGroup;
  guardando = false;
  errorMensaje: string | null = null;
  mensajeExito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private portalMedicoService: PortalMedicoService,
    // Público: el HTML lo usa para ocultar "Nueva especialidad"/"Editar"/
    // "Eliminar" a los administradores sin rol máximo (evita el ciclo de
    // clic → 403).
    public adminService: AdministracionService,
    private cdr: ChangeDetectorRef
  ) {
    this.formulario = this.fb.group({
      nombre_especialidad_profesional: ['', Validators.required],
      especialidad_requiere_certificado: [false]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.portalMedicoService.getEspecialidades().subscribe({
      next: (datos) => {
        this.especialidades = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al listar especialidades', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirCrear(): void {
    this.especialidadEnEdicion = null;
    this.errorMensaje = null;
    this.formulario.reset({ nombre_especialidad_profesional: '', especialidad_requiere_certificado: false });
    this.modalAbierto = true;
  }

  abrirEditar(especialidad: Especialidad): void {
    this.especialidadEnEdicion = especialidad;
    this.errorMensaje = null;
    this.formulario.reset({
      nombre_especialidad_profesional: especialidad.nombre_especialidad_profesional,
      especialidad_requiere_certificado: especialidad.especialidad_requiere_certificado
    });
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    this.errorMensaje = null;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const datos = this.formulario.value;
    const eraEdicion = !!this.especialidadEnEdicion;

    const peticion = this.especialidadEnEdicion
      ? this.portalMedicoService.editarEspecialidad(this.especialidadEnEdicion.id_especialidad, datos)
      : this.portalMedicoService.crearEspecialidad(datos);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.mensajeExito = eraEdicion
          ? this.t().gestion_pm_especialidades.exito_editar
          : this.t().gestion_pm_especialidades.exito_crear;
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al guardar la especialidad', err);
        this.guardando = false;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(
          err,
          err.status === 403 ? this.t().pm_profesional_detalle.error_permisos : this.t().gestion_pm_especialidades.error_guardar
        );
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(especialidad: Especialidad): void {
    const confirmar = confirm(this.t().gestion_pm_especialidades.confirmar_eliminar);
    if (!confirmar) return;

    this.errorMensaje = null;
    this.mensajeExito = null;

    this.portalMedicoService.eliminarEspecialidad(especialidad.id_especialidad).subscribe({
      next: () => {
        this.especialidades = this.especialidades.filter(e => e.id_especialidad !== especialidad.id_especialidad);
        this.mensajeExito = this.t().gestion_pm_especialidades.exito_eliminar;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar la especialidad', err);
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(
          err,
          err.status === 403 ? this.t().pm_profesional_detalle.error_permisos : this.t().gestion_pm_especialidades.error_eliminar
        );
        this.cdr.detectChanges();
      }
    });
  }
}
