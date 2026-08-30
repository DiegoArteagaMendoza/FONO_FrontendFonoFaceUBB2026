// Separado del .ts base del componente según Specs.md: los componentes no
// llevan interfaces, enums ni constantes.

/**
 * Conteos de las horas publicadas por el profesional.
 *
 * 'libresProximos' es el que decide si se muestra el aviso: hay horas libres,
 * pero pueden estar todas a un mes vista, y eso para el paciente que busca
 * atención pronto equivale a no tener ninguna.
 */
export interface ResumenHoras {
  libres: number;
  reservadas: number;
  libresProximos: number;
}
