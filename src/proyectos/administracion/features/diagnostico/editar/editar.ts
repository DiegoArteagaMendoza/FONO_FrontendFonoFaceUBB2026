import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DiagnosticoService } from '@core/services/diagnostico/diagnostico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-editar-diagnostico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html'
})
export class EditarDiagnostico implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  editarForm: FormGroup;
  idFormulario: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';

  constructor(
    private fb: FormBuilder,
    private diagnosticoService: DiagnosticoService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.editarForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', Validators.required],
      valor_minimo: [0, [Validators.required, Validators.min(0)]],
      valor_maximo: [4, [Validators.required, Validators.min(1)]],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.idFormulario = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idFormulario) {
      this.cargarDatosActuales();
    } else {
      this.volver();
    }
  }

  cargarDatosActuales(): void {
    this.cargandoDatos = true;
    this.diagnosticoService.listarFormularios().subscribe({
      next: (datos) => {
        const actual = datos.find(item => item.id_formulario === this.idFormulario);
        if (actual) {
          this.editarForm.patchValue({
            nombre: actual.nombre,
            descripcion: actual.descripcion,
            valor_minimo: actual.valor_minimo,
            valor_maximo: actual.valor_maximo,
            estado: actual.estado
          });
        } else {
          this.errorMensaje = this.t().edicion_diagnostico.error_no_encontrado;
        }
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos actuales', err);
        this.errorMensaje = this.t().erorres.error_cargando_datos;
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      return;
    }

    const valorMinimo = Number(this.editarForm.get('valor_minimo')?.value);
    const valorMaximo = Number(this.editarForm.get('valor_maximo')?.value);
    if (valorMaximo <= valorMinimo) {
      this.errorMensaje = this.t().creacion_diagnostico.alerta_escala;
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    this.diagnosticoService.editarFormulario(this.idFormulario, this.editarForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.volver();
      },
      error: (err) => {
        console.error('Error al editar el formulario:', err);
        this.isSubmitting = false;

        if (err.status === 400) {
          const mensajes: string[] = [];
          for (const campo in err.error) {
            if (err.error.hasOwnProperty(campo)) {
              const errorDelCampo = Array.isArray(err.error[campo]) ? err.error[campo].join(' ') : err.error[campo];
              mensajes.push(`• ${campo.toUpperCase()}: ${errorDelCampo}`);
            }
          }
          this.errorMensaje = 'Errores de validación:\n' + mensajes.join('\n');
        } else if (err.status === 401 || err.status === 403) {
          this.errorMensaje = 'Sesión expirada o permisos insuficientes.';
        } else {
          this.errorMensaje = `Error inesperado (Código ${err.status}).`;
        }

        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['administracion/diagnostico']);
  }
}
