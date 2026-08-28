import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagnosticoService } from '@core/services/diagnostico/diagnostico';
import { DiagnosticoFormulario, DiagnosticoResultado } from '@core/services/diagnostico/interface/diagnostico.interface';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-autoevaluacion-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './autoevaluacion-detalle.html',
  styleUrls: ['./autoevaluacion-detalle.scss']
})
export class AutoevaluacionDetalleComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  idFormulario: number = 0;
  formulario: DiagnosticoFormulario | null = null;
  respuestaForm: FormGroup;
  escalaOpciones: number[] = [];

  cargando = true;
  enviando = false;
  errorMensaje = '';
  errorCarga = '';
  resultado: DiagnosticoResultado | null = null;

  constructor(
    private fb: FormBuilder,
    private diagnosticoService: DiagnosticoService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.respuestaForm = this.fb.group({
      paciente_nombre: ['', Validators.required],
      paciente_fecha_nacimiento: [''],
      subescalas: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.idFormulario = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idFormulario) {
      this.cargarFormulario();
    } else {
      this.volver();
    }
  }

  get subescalasForm(): FormArray {
    return this.respuestaForm.get('subescalas') as FormArray;
  }

  preguntasDe(subescala: any): FormArray {
    return subescala.get('preguntas') as FormArray;
  }

  cargarFormulario(): void {
    this.cargando = true;
    this.diagnosticoService.obtenerFormulario(this.idFormulario).subscribe({
      next: (formulario) => {
        this.formulario = formulario;
        this.escalaOpciones = this.construirEscala(formulario.valor_minimo, formulario.valor_maximo);
        this.construirFormulario(formulario);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el formulario', err);
        this.errorCarga = this.t().portal_autoevaluacion_detalle.error_no_encontrado;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private construirEscala(minimo: number, maximo: number): number[] {
    const opciones: number[] = [];
    for (let valor = minimo; valor <= maximo; valor++) {
      opciones.push(valor);
    }
    return opciones;
  }

  private construirFormulario(formulario: DiagnosticoFormulario): void {
    const subescalasArray = formulario.subescalas.map(subescala =>
      this.fb.group({
        preguntas: this.fb.array(
          subescala.preguntas.map(pregunta =>
            this.fb.group({
              id_pregunta: [pregunta.id_pregunta],
              valor: [null, Validators.required]
            })
          )
        )
      })
    );
    this.respuestaForm.setControl('subescalas', this.fb.array(subescalasArray));
  }

  onSubmit(): void {
    if (this.respuestaForm.invalid) {
      this.respuestaForm.markAllAsTouched();
      this.errorMensaje = this.t().portal_autoevaluacion_detalle.alerta_pregunta_sin_responder;
      return;
    }

    this.enviando = true;
    this.errorMensaje = '';

    const valores = this.respuestaForm.value;
    const detalles = valores.subescalas.flatMap((subescala: any) =>
      subescala.preguntas.map((pregunta: any) => ({
        pregunta: pregunta.id_pregunta,
        valor: Number(pregunta.valor)
      }))
    );

    this.diagnosticoService.responder({
      formulario: this.idFormulario,
      paciente_nombre: valores.paciente_nombre,
      paciente_fecha_nacimiento: valores.paciente_fecha_nacimiento || null,
      detalles
    }).subscribe({
      next: (respuesta) => {
        this.resultado = respuesta.resultado;
        this.enviando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al enviar las respuestas', err);
        this.errorMensaje = this.t().portal_autoevaluacion_detalle.error_envio;
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }

  responderOtraVez(): void {
    this.resultado = null;
    if (this.formulario) {
      this.construirFormulario(this.formulario);
    }
    this.respuestaForm.patchValue({ paciente_nombre: '', paciente_fecha_nacimiento: '' });
    this.cdr.detectChanges();
  }

  verOtras(): void {
    this.router.navigate(['/portal/autoevaluacion']);
  }

  volver(): void {
    this.router.navigate(['/portal/autoevaluacion']);
  }
}
