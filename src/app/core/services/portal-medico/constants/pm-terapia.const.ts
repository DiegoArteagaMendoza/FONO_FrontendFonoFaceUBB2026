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
