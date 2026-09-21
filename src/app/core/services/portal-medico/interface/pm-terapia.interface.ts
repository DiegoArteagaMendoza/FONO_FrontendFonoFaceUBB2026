// Interfaces de la terapia del Portal Médico (app PmTerapia del backend).
// Separadas del servicio según Specs.md: los .ts base de componentes y
// servicios no llevan interfaces, enums ni constantes.

/**
 * Un ejercicio del catálogo privado del fonoaudiólogo, tal como lo entrega
 * PmEjercicioSerializer. No trae 'profesional': quien lo lee es su dueño.
 */
export interface Ejercicio {
  id_ejercicio: number;
  nombre: string;
  instrucciones: string;
  /** URL https del video de ejemplo, lista para <video>. */
  video_ejemplo: string;
  duracion_segundos: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/** Cada cuánto debe reportar el paciente. Espejo de PmPlanTerapia.Periodicidad. */
export type Periodicidad = 'DIARIA' | 'SEMANAL' | 'QUINCENAL';

export type EstadoPlan = 'ACTIVO' | 'CERRADO';

/** Un ejercicio dentro del plan, con el del catálogo incrustado. */
export interface PlanEjercicio {
  id_plan_ejercicio: number;
  orden: number;
  /** Indicaciones específicas para este paciente; puede ir vacío. */
  indicaciones: string;
  ejercicio: Ejercicio;
}

/** El periodo en curso, ya calculado por el backend en hora de Chile. */
export interface PeriodoActual {
  numero: number;
  /** AAAA-MM-DD */
  desde: string;
  hasta: string;
}

/**
 * El plan de terapia, tal como lo entrega PmPlanTerapiaSerializer a los dos
 * lados. Trae los ejercicios activos y los nombres de ambos: cada pantalla usa
 * el que le falta.
 */
export interface PlanTerapia {
  id_plan: number;
  cliente: number;
  profesional: number;
  cita_origen: number | null;
  paciente_nombre: string;
  profesional_nombre: string;
  periodicidad: Periodicidad;
  periodicidad_display: string;
  /** AAAA-MM-DD, en Chile. */
  fecha_inicio: string;
  indicaciones: string;
  estado: EstadoPlan;
  esta_activo: boolean;
  periodo_actual: PeriodoActual;
  ejercicios: PlanEjercicio[];
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_cierre: string | null;
}

/** Un ejercicio al crear o ajustar el plan. */
export interface PlanEjercicioPayload {
  id_ejercicio: number;
  indicaciones?: string;
}

/**
 * Cuerpo de crear (con id_cita) y de ajustar (sin él; todo opcional, lo que
 * no viene no cambia).
 */
export interface PlanTerapiaPayload {
  id_cita?: number;
  periodicidad?: Periodicidad;
  indicaciones?: string;
  ejercicios?: PlanEjercicioPayload[];
}

/**
 * Lo que responde planes/de-cita/: el plan activo si existe, y lo que el
 * formulario necesita saber del paciente antes de intentar asignar uno.
 */
export interface ContextoPlanDeCita {
  plan: PlanTerapia | null;
  paciente_nombre: string;
  /** Sin cuenta el backend rechaza el plan: se explica antes, no después. */
  paciente_tiene_cuenta: boolean;
  cita_realizada: boolean;
}
