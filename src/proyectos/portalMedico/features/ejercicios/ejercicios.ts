import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { PmTerapiaService } from '@core/services/portal-medico/pm-terapia';
import { Ejercicio } from '@core/services/portal-medico/interface/pm-terapia.interface';
import { ResultadoValidacionVideo } from '@core/services/portal-medico/interface/pm-cliente.interface';
import {
  EJEMPLO_DURACION_MAXIMA_SEGUNDOS,
  EJEMPLO_TAMANO_MAXIMO_MB
} from '@core/services/portal-medico/constants/pm-terapia.const';
import { VIDEO_EXTENSIONES_PERMITIDAS } from '@core/services/portal-medico/constants/pm-cliente.const';
import { TextosService } from '@core/services/textos/textos';

import { ModoEjercicios } from './interface/ejercicios.interface';

/**
 * Catálogo de ejercicios del fonoaudiólogo.
 *
 * Es lo que después asigna a sus pacientes en un plan de terapia: nombre,
 * instrucciones y un video corto de ejemplo. El video es permanente —no vence
 * como los de síntomas— porque es material del profesional y sirve mientras el
 * ejercicio exista.
 *
 * Listado, creación y edición viven en la misma pantalla, alternando por
 * 'modo': el catálogo es corto y abrir una ruta por formulario solo agregaría
 * navegación sin aportar nada.
 */
@Component({
  selector: 'app-pm-ejercicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ejercicios.html'
})
export class PmEjerciciosComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public pmTerapiaService = inject(PmTerapiaService);

  private portalMedicoService = inject(PortalMedicoService);
  // Para validar el archivo con las mismas reglas que el resto de los videos.
  private pmClienteService = inject(PmClienteService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  // App sin zone.js: cada respuesta HTTP necesita su detectChanges().
  private cdr = inject(ChangeDetectorRef);

  modo: ModoEjercicios = 'listado';

  ejercicios: Ejercicio[] = [];
  cargando = true;
  errorListado: string | null = null;
  mensajeListado: string | null = null;

  formulario: FormGroup;
  editando: Ejercicio | null = null;
  guardando = false;
  errorFormulario: string | null = null;

  archivo: File | null = null;
  duracionSegundos: number | null = null;
  tamanoMb: number | null = null;

  readonly duracionMaxima = EJEMPLO_DURACION_MAXIMA_SEGUNDOS;
  readonly pesoMaximo = EJEMPLO_TAMANO_MAXIMO_MB;
  readonly formatos = VIDEO_EXTENSIONES_PERMITIDAS;

  constructor() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      instrucciones: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }
    this.cargarEjercicios();
  }

  // ---------------------------------------------------------------------
  // Listado
  // ---------------------------------------------------------------------

  cargarEjercicios(): void {
    this.cargando = true;
    this.errorListado = null;

    this.pmTerapiaService.getMisEjercicios().subscribe({
      next: (ejercicios) => {
        this.ejercicios = ejercicios;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.errorListado = this.pmTerapiaService.extraerMensajeError(
          err, this.t().pm_ejercicios.error_servidor
        );
        this.cdr.detectChanges();
      }
    });
  }

  textoDuracion(ejercicio: Ejercicio): string {
    return this.textosService.reemplazarVariables(this.t().pm_ejercicios.duracion_ejemplo, {
      segundos: ejercicio.duracion_segundos + ''
    });
  }

  eliminar(ejercicio: Ejercicio): void {
    if (!confirm(this.t().pm_ejercicios.confirmar_eliminar)) return;

    this.errorListado = null;
    this.mensajeListado = null;

    this.pmTerapiaService.eliminarEjercicio(ejercicio.id_ejercicio).subscribe({
      next: () => {
        this.ejercicios = this.ejercicios.filter(e => e.id_ejercicio !== ejercicio.id_ejercicio);
        this.mensajeListado = this.t().pm_ejercicios.exito_eliminar;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorListado = this.pmTerapiaService.extraerMensajeError(
          err, this.t().pm_ejercicios.error_eliminar
        );
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Formulario: abrir y cerrar
  // ---------------------------------------------------------------------

  abrirCrear(): void {
    this.editando = null;
    this.formulario.reset({ nombre: '', instrucciones: '' });
    this.limpiarArchivo();
    this.errorFormulario = null;
    this.mensajeListado = null;
    this.modo = 'crear';
  }

  abrirEditar(ejercicio: Ejercicio): void {
    this.editando = ejercicio;
    this.formulario.reset({ nombre: ejercicio.nombre, instrucciones: ejercicio.instrucciones });
    this.limpiarArchivo();
    this.errorFormulario = null;
    this.mensajeListado = null;
    this.modo = 'editar';
  }

  cerrarFormulario(): void {
    this.modo = 'listado';
    this.editando = null;
    this.limpiarArchivo();
    this.errorFormulario = null;
  }

  get tituloFormulario(): string {
    return this.modo === 'editar'
      ? this.t().pm_ejercicios.form_titulo_editar
      : this.t().pm_ejercicios.form_titulo_nuevo;
  }

  get textoAyudaVideo(): string {
    return this.textosService.reemplazarVariables(this.t().pm_ejercicios.ayuda_video, {
      segundos: this.duracionMaxima + '',
      peso: this.pesoMaximo + '',
      formatos: this.formatos.join(', ')
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  // ---------------------------------------------------------------------
  // Video de ejemplo
  // ---------------------------------------------------------------------

  /**
   * Mismas reglas que el resto de los videos del portal, con los topes del
   * ejemplo (15 s, 30 MB). El backend vuelve a validar; esto es para que la
   * persona se entere al instante y no tras subir el archivo.
   */
  async alElegirVideo(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.errorFormulario = null;
    this.limpiarArchivo();

    if (!archivo) {
      this.cdr.detectChanges();
      return;
    }

    const revision = await this.pmClienteService.validarArchivoDeVideo(archivo, {
      duracionMaximaSegundos: this.duracionMaxima,
      tamanoMaximoMb: this.pesoMaximo
    });

    if (!revision.valido) {
      this.errorFormulario = this.mensajeDeMotivo(revision);
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.archivo = archivo;
    this.duracionSegundos = revision.duracionSegundos ?? null;
    this.tamanoMb = revision.tamanoMb ?? null;
    this.cdr.detectChanges();
  }

  private mensajeDeMotivo(revision: ResultadoValidacionVideo): string {
    const textos = this.t().pm_ejercicios;

    switch (revision.motivo) {
      case 'formato':
        return this.textosService.reemplazarVariables(textos.alerta_video_formato, {
          formatos: this.formatos.join(', ')
        });
      case 'peso':
        return this.textosService.reemplazarVariables(textos.alerta_video_peso, {
          peso: (revision.tamanoMb ?? 0) + '', maximo: this.pesoMaximo + ''
        });
      case 'duracion':
        return this.textosService.reemplazarVariables(textos.alerta_video_duracion, {
          duracion: (revision.duracionSegundos ?? 0) + '', maximo: this.duracionMaxima + ''
        });
      default:
        return textos.alerta_video_ilegible;
    }
  }

  private limpiarArchivo(): void {
    this.archivo = null;
    this.duracionSegundos = null;
    this.tamanoMb = null;
  }

  // ---------------------------------------------------------------------
  // Guardar
  // ---------------------------------------------------------------------

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    // Al crear, el video es obligatorio: un ejercicio sin demostración no le
    // sirve al paciente. Al editar, solo si se eligió uno nuevo.
    if (this.modo === 'crear' && (!this.archivo || this.duracionSegundos === null)) {
      this.errorFormulario = this.t().pm_ejercicios.alerta_video_req;
      return;
    }

    this.guardando = true;
    this.errorFormulario = null;

    const datos = new FormData();
    datos.append('nombre', this.formulario.value.nombre.trim());
    datos.append('instrucciones', this.formulario.value.instrucciones.trim());
    if (this.archivo && this.duracionSegundos !== null) {
      datos.append('video_ejemplo', this.archivo);
      datos.append('duracion_segundos', this.duracionSegundos + '');
    }

    const peticion = this.modo === 'editar' && this.editando
      ? this.pmTerapiaService.editarEjercicio(this.editando.id_ejercicio, datos)
      : this.pmTerapiaService.crearEjercicio(datos);

    peticion.subscribe({
      next: (guardado) => {
        this.guardando = false;

        if (this.modo === 'editar') {
          this.ejercicios = this.ejercicios.map(e => e.id_ejercicio === guardado.id_ejercicio ? guardado : e);
          this.mensajeListado = this.t().pm_ejercicios.exito_editar;
        } else {
          // El backend lista del más nuevo al más antiguo: el recién creado va primero.
          this.ejercicios = [guardado, ...this.ejercicios];
          this.mensajeListado = this.t().pm_ejercicios.exito_crear;
        }

        this.cerrarFormulario();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.errorFormulario = this.pmTerapiaService.extraerMensajeError(
          err, this.t().pm_ejercicios.error_guardar
        );
        this.cdr.detectChanges();
      }
    });
  }
}
