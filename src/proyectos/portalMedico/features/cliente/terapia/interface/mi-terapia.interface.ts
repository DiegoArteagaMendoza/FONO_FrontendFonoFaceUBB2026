// Separado del .ts base del componente según Specs.md: los componentes no
// llevan interfaces, enums ni constantes.

import { VideoProgreso } from '@core/services/portal-medico/interface/pm-terapia.interface';

/**
 * El formulario de subida abierto sobre un ejercicio concreto (solo uno a la
 * vez), con el archivo ya revisado en el navegador.
 */
export interface SubidaEnCurso {
  idPlan: number;
  idPlanEjercicio: number;
  nombreEjercicio: string;
  archivo: File | null;
  duracionSegundos: number | null;
  tamanoMb: number | null;
  comentario: string;
  enviando: boolean;
  error: string | null;
}

/** El historial de un plan, con su propio estado de carga. */
export interface HistorialPlan {
  videos: VideoProgreso[];
  cargando: boolean;
  error: string | null;
}
