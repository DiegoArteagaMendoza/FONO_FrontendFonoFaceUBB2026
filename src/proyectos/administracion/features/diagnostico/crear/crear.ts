import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticoService } from '@core/services/diagnostico/diagnostico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-crear-diagnostico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear.html',
  styleUrls: ['./crear.scss']
})
export class CrearDiagnostico {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  crearForm: FormGroup;
  isSubmitting = false;
  errorMensaje = '';

  constructor(
    private fb: FormBuilder,
    private diagnosticoService: DiagnosticoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.crearForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', Validators.required],
      valor_minimo: [0, [Validators.required, Validators.min(0)]],
      valor_maximo: [4, [Validators.required, Validators.min(1)]],
      subescalas: this.fb.array([this.crearSubescala()]),
      // Rangos que interpretan el PUNTAJE TOTAL del test (opcional).
      interpretaciones: this.fb.array([])
    });
  }

  // --- Getters de acceso a los FormArray anidados ---

  get subescalas(): FormArray {
    return this.crearForm.get('subescalas') as FormArray;
  }

  get interpretacionesTotal(): FormArray {
    return this.crearForm.get('interpretaciones') as FormArray;
  }

  preguntasDe(subescala: any): FormArray {
    return subescala.get('preguntas') as FormArray;
  }

  interpretacionesDe(subescala: any): FormArray {
    return subescala.get('interpretaciones') as FormArray;
  }

  // --- Construcción de grupos/arreglos dinámicos ---

  private crearPregunta() {
    return this.fb.group({
      texto: ['', Validators.required]
    });
  }

  private crearInterpretacion() {
    return this.fb.group({
      valor_minimo: [0, [Validators.required, Validators.min(0)]],
      valor_maximo: [0, [Validators.required, Validators.min(0)]],
      etiqueta: ['', Validators.required],
      descripcion: ['']
    });
  }

  private crearSubescala() {
    return this.fb.group({
      nombre: ['', Validators.required],
      preguntas: this.fb.array([this.crearPregunta()]),
      // Rangos que interpretan el puntaje de ESTA subescala (opcional).
      interpretaciones: this.fb.array([])
    });
  }

  agregarSubescala(): void {
    this.subescalas.push(this.crearSubescala());
  }

  quitarSubescala(indice: number): void {
    if (this.subescalas.length > 1) {
      this.subescalas.removeAt(indice);
    }
  }

  agregarPregunta(indiceSubescala: number): void {
    const preguntas = this.preguntasDe(this.subescalas.at(indiceSubescala));
    preguntas.push(this.crearPregunta());
  }

  quitarPregunta(indiceSubescala: number, indicePregunta: number): void {
    const preguntas = this.preguntasDe(this.subescalas.at(indiceSubescala));
    if (preguntas.length > 1) {
      preguntas.removeAt(indicePregunta);
    }
  }

  agregarInterpretacionTotal(): void {
    this.interpretacionesTotal.push(this.crearInterpretacion());
  }

  quitarInterpretacionTotal(indice: number): void {
    this.interpretacionesTotal.removeAt(indice);
  }

  agregarInterpretacionSubescala(indiceSubescala: number): void {
    const interpretaciones = this.interpretacionesDe(this.subescalas.at(indiceSubescala));
    interpretaciones.push(this.crearInterpretacion());
  }

  quitarInterpretacionSubescala(indiceSubescala: number, indiceInterpretacion: number): void {
    const interpretaciones = this.interpretacionesDe(this.subescalas.at(indiceSubescala));
    interpretaciones.removeAt(indiceInterpretacion);
  }

  // Replica en el cliente la validación de solape que hace el backend, para
  // avisar antes de enviar en vez de esperar el 400.
  private tieneSolape(rangos: { valor_minimo: number; valor_maximo: number }[]): boolean {
    const ordenados = [...rangos].sort((a, b) => a.valor_minimo - b.valor_minimo);
    for (let i = 1; i < ordenados.length; i++) {
      if (ordenados[i].valor_minimo <= ordenados[i - 1].valor_maximo) {
        return true;
      }
    }
    return false;
  }

  private mapearInterpretaciones(formArray: FormArray) {
    return formArray.controls.map(control => ({
      valor_minimo: Number(control.get('valor_minimo')?.value),
      valor_maximo: Number(control.get('valor_maximo')?.value),
      etiqueta: control.get('etiqueta')?.value,
      descripcion: control.get('descripcion')?.value || ''
    }));
  }

  onSubmit(): void {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    const valorMinimo = Number(this.crearForm.get('valor_minimo')?.value);
    const valorMaximo = Number(this.crearForm.get('valor_maximo')?.value);
    if (valorMaximo <= valorMinimo) {
      this.errorMensaje = this.t().creacion_diagnostico.alerta_escala;
      return;
    }

    const interpretacionesTotal = this.mapearInterpretaciones(this.interpretacionesTotal);
    const subescalas = this.subescalas.controls.map((subescala, indiceSub) => ({
      nombre: subescala.get('nombre')?.value,
      orden: indiceSub + 1,
      preguntas: this.preguntasDe(subescala).controls.map((pregunta, indicePregunta) => ({
        texto: pregunta.get('texto')?.value,
        orden: indicePregunta + 1
      })),
      interpretaciones: this.mapearInterpretaciones(this.interpretacionesDe(subescala))
    }));

    if (
      this.tieneSolape(interpretacionesTotal) ||
      subescalas.some(subescala => this.tieneSolape(subescala.interpretaciones))
    ) {
      this.errorMensaje = this.t().creacion_diagnostico.alerta_interpretacion_solape;
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    const payload = {
      nombre: this.crearForm.get('nombre')?.value,
      descripcion: this.crearForm.get('descripcion')?.value,
      valor_minimo: valorMinimo,
      valor_maximo: valorMaximo,
      subescalas,
      interpretaciones: interpretacionesTotal
    };

    this.diagnosticoService.crearFormulario(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['administracion/diagnostico']);
      },
      error: (err) => {
        console.error('Error devuelto por el servidor:', err);
        this.isSubmitting = false;

        if (err.status === 400) {
          const mensajes: string[] = [];
          for (const campo in err.error) {
            if (err.error.hasOwnProperty(campo)) {
              const errorDelCampo = Array.isArray(err.error[campo]) ? err.error[campo].join(' ') : err.error[campo];
              mensajes.push(`• ${campo.toUpperCase()}: ${errorDelCampo}`);
            }
          }
          this.errorMensaje = 'Revisa los siguientes datos:\n' + mensajes.join('\n');
        } else if (err.status === 401 || err.status === 403) {
          this.errorMensaje = 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.';
        } else if (err.status >= 500) {
          this.errorMensaje = 'Ocurrió un problema en el servidor. Por favor, intenta de nuevo más tarde.';
        } else {
          this.errorMensaje = `Ocurrió un error inesperado (Código ${err.status}). Verifica tu conexión.`;
        }

        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['administracion/diagnostico']);
  }
}
