import { Periodicidad } from '../interface/pm-terapia.interface';

// Constantes de la terapia. Separadas del servicio según Specs.md.

/**
 * Reglas del video de ejemplo de un ejercicio, espejo de las constantes del
 * backend (FonoAppPortalMedico/PmTerapia/models.py). Se validan aquí para dar
 * feedback inmediato, pero el backend las vuelve a validar: es él quien manda.
 *
 * Es más corto y liviano que el video de síntomas a propósito: una
 * demostración de cómo se hace el ejercicio, no una clase.
 */
export const EJEMPLO_DURACION_MAXIMA_SEGUNDOS = 15;
export const EJEMPLO_TAMANO_MAXIMO_MB = 30;

/** Ejercicios que caben en un plan. Lo fijó el fonoaudiólogo: más no se cumplen. */
export const EJERCICIOS_MAXIMOS_POR_PLAN = 3;

/**
 * Periodicidades ofrecidas en el formulario, en el orden en que se muestran.
 * El texto visible sale de textos.ts (pm_plan.periodicidad_*).
 */
export const PERIODICIDADES: Periodicidad[] = ['DIARIA', 'SEMANAL', 'QUINCENAL'];

/** Días de cada periodicidad, para explicar el periodo en pantalla. */
export const DIAS_POR_PERIODICIDAD: Record<Periodicidad, number> = {
  DIARIA: 1,
  SEMANAL: 7,
  QUINCENAL: 15
};

/**
 * Reglas del video de progreso, espejo de PmTerapia/models.py: mismos topes
 * que el de síntomas, pero vive solo 7 días.
 */
export const PROGRESO_DURACION_MAXIMA_SEGUNDOS = 30;
export const PROGRESO_TAMANO_MAXIMO_MB = 50;
export const PROGRESO_DIAS_VIGENCIA = 7;
