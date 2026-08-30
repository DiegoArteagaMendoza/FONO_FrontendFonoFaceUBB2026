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
  // Id de la respuesta ya registrada, para pedir el envío de SU resultado por correo.
  idRespuesta: number | null = null;

  // Envío del resultado por correo: el correo se escribe recién acá, no forma
  // parte de la respuesta del test ni se guarda en ningún lado (ver
  // DiagnosticoService.enviarResultadoPorCorreo); el backend solo lo usa para
  // este envío puntual, con la misma configuración de correo que usa el
  // Portal Médico para confirmar una reserva de hora.
  correoForm: FormGroup;
  correoEnviando = false;
  correoEnviado = false;
  correoError = '';

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

    this.correoForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
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
        this.idRespuesta = respuesta.id_respuesta;
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
    this.idRespuesta = null;
    if (this.formulario) {
      this.construirFormulario(this.formulario);
    }
    this.respuestaForm.patchValue({ paciente_nombre: '', paciente_fecha_nacimiento: '' });
    this.correoForm.reset();
    this.correoEnviando = false;
    this.correoEnviado = false;
    this.correoError = '';
    this.cdr.detectChanges();
  }

  // Le pide al backend que envíe el resultado ya calculado (guardado al responder
  // el test) al correo recién ingresado. El correo no se guarda en ningún lado;
  // el backend solo lo usa para este envío puntual (ver DiagnosticoService).
  enviarPorCorreo(): void {
    if (this.correoForm.invalid) {
      this.correoForm.markAllAsTouched();
      return;
    }

    if (!this.idRespuesta) {
      return;
    }

    this.correoEnviando = true;
    this.correoEnviado = false;
    this.correoError = '';

    const destino = this.correoForm.get('correo')?.value;
    this.diagnosticoService.enviarResultadoPorCorreo(this.idRespuesta, destino).subscribe({
      next: (respuesta) => {
        this.correoEnviando = false;
        if (respuesta.correo_enviado) {
          this.correoEnviado = true;
        } else {
          this.correoError = this.t().portal_autoevaluacion_detalle.correo_sin_enviar;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al enviar el resultado por correo', err);
        this.correoEnviando = false;
        this.correoError = this.t().portal_autoevaluacion_detalle.correo_sin_enviar;
        this.cdr.detectChanges();
      }
    });
  }

  verOtras(): void {
    this.router.navigate(['/portal/autoevaluacion']);
  }

  volver(): void {
    this.router.navigate(['/portal/autoevaluacion']);
  }
}
