// Separado del .ts base del componente segun Specs.md: los componentes
// no llevan interfaces, enums ni constantes.

/** Acción abierta sobre una cita concreta (solo una a la vez). */
export type AccionCita = 'posponer' | 'cancelar' | null;
