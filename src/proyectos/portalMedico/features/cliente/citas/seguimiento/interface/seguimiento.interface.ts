// Separado del .ts base del componente segun Specs.md: los componentes
// no llevan interfaces, enums ni constantes.

/** Acción abierta sobre la cita consultada (solo una a la vez). */
export type AccionSeguimiento = 'posponer' | 'cancelar' | null;
