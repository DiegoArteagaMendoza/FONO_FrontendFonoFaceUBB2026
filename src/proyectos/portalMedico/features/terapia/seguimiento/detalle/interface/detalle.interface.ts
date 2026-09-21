// Separado del .ts base del componente según Specs.md: los componentes no
// llevan interfaces, enums ni constantes.

/**
 * El estado de edición de la retroalimentación de un video. Cada video tiene
 * el suyo para que escribir en uno no bloquee ni borre lo de otro.
 */
export interface EdicionRetro {
  texto: string;
  guardando: boolean;
  error: string | null;
  guardado: boolean;
}
