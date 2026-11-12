import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { PmCitaService } from '@core/services/portal-medico/pm-cita';
import { EnlaceReunion, PlataformaReunion } from '@core/services/portal-medico/interface/pm-cita.interface';
import {
  ENLACE_REUNION_LARGO_MAXIMO,
  PLATAFORMAS_REUNION
} from '@core/services/portal-medico/constants/pm-cita.const';
import { TextosService } from '@core/services/textos/textos';
import { CambioEnlaceReunion } from './interface/enlace-reunion.interface';

/**
 * Formulario del link de la reunión online (Google Meet o Zoom) que genera el
 * propio fonoaudiólogo. Lo usan "Mis horas" (al publicar y en cada hora) y la
 * agenda (en cada cita), para que la regla y los mensajes sean los mismos.
 *
 * Dos modos:
 *  - Con botones (por defecto): "Guardar link" emite (guardar) con el valor
 *    ya validado; "Cancelar" emite (cancelar).
 *  - Sin botones (conAcciones = false): se incrusta en otro formulario y emite
 *    (cambio) en cada modificación, con el valor y si es válido.
 *
 * Con requerido = false, dejar ambos campos vacíos es válido (publicar horas
 * sin link y agregarlo después).
 */
@Component({
  selector: 'app-pm-enlace-reunion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enlace-reunion.html'
})
export class EnlaceReunionComponent implements OnInit {
  public t = inject(TextosService).t;
  private pmCitaService = inject(PmCitaService);
  private fb = inject(FormBuilder);

  /** Valor con el que parte el formulario (al editar un link existente). */
  @Input() valorInicial: EnlaceReunion | null = null;
  @Input() conAcciones = true;
  @Input() requerido = true;
  @Input() guardando = false;
  /** Prefijo de los id de los campos, para que no se repitan en un listado. */
  @Input() idCampos = 'enlace-reunion';

  @Output() guardar = new EventEmitter<EnlaceReunion>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() cambio = new EventEmitter<CambioEnlaceReunion>();

  readonly plataformas = PLATAFORMAS_REUNION;
  readonly largoMaximo = ENLACE_REUNION_LARGO_MAXIMO;

  formulario: FormGroup = this.fb.group({
    plataforma_reunion: [null as PlataformaReunion | null],
    enlace_reunion: ['']
  });

  /** Se muestran los errores después del primer intento de guardar o al salir del campo. */
  intentado = false;

  ngOnInit(): void {
    this.formulario.patchValue({
      plataforma_reunion: this.valorInicial?.plataforma_reunion ?? null,
      enlace_reunion: this.valorInicial?.enlace_reunion ?? ''
    });
    this.formulario.valueChanges.subscribe(() => {
      this.cambio.emit({ valor: this.valor, valido: !this.error });
    });
  }

  get valor(): EnlaceReunion {
    const plataforma = this.formulario.value.plataforma_reunion || null;
    const enlace = (this.formulario.value.enlace_reunion || '').trim() || null;
    return { plataforma_reunion: plataforma, enlace_reunion: enlace };
  }

  /** Mensaje del primer problema, o null si el valor se puede enviar. */
  get error(): string | null {
    const { plataforma_reunion, enlace_reunion } = this.valor;
    const textos = this.t().pm_reunion;

    if (!plataforma_reunion && !enlace_reunion) {
      return this.requerido ? textos.alerta_plataforma : null;
    }
    if (!plataforma_reunion) return textos.alerta_plataforma;
    if (!enlace_reunion) return textos.alerta_enlace;
    if (!this.pmCitaService.enlaceReunionValido(plataforma_reunion, enlace_reunion)) {
      const nombre = this.nombrePlataforma(plataforma_reunion);
      return textos.alerta_formato.split('{plataforma}').join(nombre);
    }
    return null;
  }

  get mostrarError(): boolean {
    const tocado = this.formulario.get('enlace_reunion')?.touched || this.formulario.get('plataforma_reunion')?.touched;
    return !!this.error && (this.intentado || !!tocado);
  }

  nombrePlataforma(plataforma: PlataformaReunion): string {
    return plataforma === 'ZOOM' ? this.t().pm_reunion.plataforma_ZOOM : this.t().pm_reunion.plataforma_MEET;
  }

  get placeholder(): string {
    return this.formulario.value.plataforma_reunion === 'ZOOM'
      ? this.t().pm_reunion.placeholder_ZOOM
      : this.t().pm_reunion.placeholder_MEET;
  }

  enviar(): void {
    this.intentado = true;
    if (this.error || this.guardando) return;
    this.guardar.emit(this.valor);
  }
}
