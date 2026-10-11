// Separado del .ts base del componente según Specs.md: los componentes no
// llevan interfaces, enums ni constantes.

/**
 * Lo que le falta al paciente antes de su atención.
 *
 * Se calcula una sola vez y se guarda, en vez de resolverlo con getters en la
 * plantilla: 'video' depende de cruzar los videos subidos contra la cita, y no
 * es algo que convenga recalcular en cada ciclo de render.
 */
export interface PendientePaciente {
  /** Puede adjuntar un video y todavía no lo ha hecho. */
  video: boolean;
  /** Ya adjuntó uno: se le confirma, para que no quede con la duda. */
  videoListo: boolean;
  /** Sigue en plazo para cambiar la fecha o cancelar. */
  cambios: boolean;
}
