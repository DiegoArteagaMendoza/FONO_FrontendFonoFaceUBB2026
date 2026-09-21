// Separado del .ts base del componente según Specs.md: los componentes no
// llevan interfaces, enums ni constantes.

/**
 * Un ejercicio del catálogo tal como lo maneja el formulario: si está marcado
 * y con qué indicación para este paciente. Se arma cruzando el catálogo con el
 * plan existente, si lo hay.
 */
export interface EjercicioElegible {
  id_ejercicio: number;
  nombre: string;
  instrucciones: string;
  video_ejemplo: string;
  elegido: boolean;
  indicaciones: string;
}
