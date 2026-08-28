// Estructura de un formulario de autoevaluación (ej. Índice de Fatiga Vocal, IDV-CH).
// El administrador la define completa al crear el formulario; no se editan
// subescalas ni preguntas una vez publicado (ver DiagnosticoService.editarFormulario).

export interface DiagnosticoPregunta {
  id_pregunta?: number;
  texto: string;
  orden: number;
}

// Rango de puntaje asociado a un resultado clínico (ej. 0-10 "Leve"). Se define
// junto al formulario, a nivel de puntaje total o dentro de una subescala
// puntual (ver DiagnosticoSubescala.interpretaciones); no se puede editar una
// vez publicado el formulario, igual que las preguntas.
export interface DiagnosticoInterpretacion {
  id_interpretacion?: number;
  valor_minimo: number;
  valor_maximo: number;
  etiqueta: string;
  descripcion: string;
}

// Interpretación ya resuelta que trae el resultado de una respuesta concreta
// (el rango en el que cayó el puntaje). Null si el formulario no definió
// rangos para ese puntaje, o si el puntaje no cayó en ninguno.
export interface DiagnosticoInterpretacionResultado {
  etiqueta: string;
  descripcion: string;
}

export interface DiagnosticoSubescala {
  id_subescala?: number;
  nombre: string;
  orden: number;
  preguntas: DiagnosticoPregunta[];
  // Rangos que interpretan el puntaje de ESTA subescala en particular (ej. las
  // partes Funcional/Física/Emocional del IDV-CH). Opcional.
  interpretaciones?: DiagnosticoInterpretacion[];
}

export interface DiagnosticoFormulario {
  id_formulario: number;
  nombre: string;
  descripcion: string;
  valor_minimo: number;
  valor_maximo: number;
  estado: boolean;
  fecha_creacion: string;
  FonoApp_Administracion: number;
  subescalas: DiagnosticoSubescala[];
  // Rangos que interpretan el PUNTAJE TOTAL del test (no los de cada subescala,
  // esos van dentro de cada subescala.interpretaciones).
  interpretaciones: DiagnosticoInterpretacion[];
}

// Payload de creación: el backend asigna id_formulario, estado, fecha_creacion
// y FonoApp_Administracion (usuario autenticado), por eso no van aquí.
export interface DiagnosticoFormularioCrear {
  nombre: string;
  descripcion: string;
  valor_minimo: number;
  valor_maximo: number;
  subescalas: DiagnosticoSubescala[];
  interpretaciones?: DiagnosticoInterpretacion[];
}

// Payload de edición: solo campos simples, la estructura de preguntas e
// interpretaciones no se toca.
export interface DiagnosticoFormularioEditable {
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
  valor_minimo?: number;
  valor_maximo?: number;
}

export interface DiagnosticoRespuestaDetalleInput {
  pregunta: number;
  valor: number;
}

// Payload que envía el cliente al responder el test desde el portal público.
export interface DiagnosticoRespuestaCrear {
  formulario: number;
  paciente_nombre: string;
  paciente_fecha_nacimiento?: string | null;
  detalles: DiagnosticoRespuestaDetalleInput[];
}

export interface DiagnosticoSubescalaPuntaje {
  id_subescala: number;
  subescala: string;
  puntaje: number;
  interpretacion: DiagnosticoInterpretacionResultado | null;
}

export interface DiagnosticoResultado {
  puntaje_total: number;
  interpretacion_total: DiagnosticoInterpretacionResultado | null;
  subescalas: DiagnosticoSubescalaPuntaje[];
}

// Respuesta del backend al registrar una aplicación del test, con el resultado
// ya calculado (puntaje total y desglose por subescala).
export interface DiagnosticoRespuesta {
  id_respuesta: number;
  formulario: number;
  paciente_nombre: string;
  paciente_fecha_nacimiento: string | null;
  fecha_diligenciamiento: string;
  // Vacío cuando el propio cliente respondió desde el portal público sin sesión.
  FonoApp_Administracion: number | null;
  resultado: DiagnosticoResultado;
}

// Versión liviana usada para listar resultados ya registrados de un formulario
// (panel de administración).
export interface DiagnosticoRespuestaListado {
  id_respuesta: number;
  formulario: number;
  paciente_nombre: string;
  paciente_fecha_nacimiento: string | null;
  fecha_diligenciamiento: string;
  puntaje_total: number;
  interpretacion_total: DiagnosticoInterpretacionResultado | null;
  detalle_subescalas: DiagnosticoSubescalaPuntaje[];
}
