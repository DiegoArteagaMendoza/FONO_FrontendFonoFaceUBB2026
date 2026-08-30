// Constantes de negocio de las citas. Separadas del servicio según Specs.md.

// =========================================================
// REGLAS DEL NEGOCIO
// Espejo de las constantes de FonoAppPortalMedico/PmCita/models.py. Se usan
// aquí para guiar el formulario (mínimos del selector de fecha, tope de
// reprogramaciones, avisos), pero el backend las vuelve a validar siempre:
// es él quien manda. Si allá cambian, hay que actualizarlas aquí.
// =========================================================

export const CITA_DURACION_MINUTOS_DEFECTO = 45;
export const CITA_DURACION_MINUTOS_MINIMA = 15;
export const CITA_DURACION_MINUTOS_MAXIMA = 120;
export const CITA_HORAS_MINIMAS_ANTICIPACION = 2;
export const CITA_REPROGRAMACIONES_MAXIMAS = 3;

/** Duraciones ofrecidas en el formulario, todas dentro del rango permitido. */
export const CITA_DURACIONES_SUGERIDAS = [15, 30, 45, 60, 90, 120];
