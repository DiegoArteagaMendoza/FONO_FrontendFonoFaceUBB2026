import { ProfesionalPerfil } from '../portal-medico';

/**
 * Lo que devuelve el backend al deshabilitar la cuenta de un profesional.
 *
 * La baja no es solo apagar la cuenta: arrastra sus citas futuras, sus horas
 * publicadas y sus planes de terapia. Estas cifras son lo que se le muestra al
 * administrador para que sepa qué acaba de pasar.
 */
export interface ResultadoBajaProfesional {
  mensaje: string;
  profesional: ProfesionalPerfil;
  citas_canceladas: number;
  /** De esas citas, a cuántos pacientes se les pudo avisar por correo. */
  pacientes_avisados: number;
  bloques_retirados: number;
  planes_cerrados: number;
}

/** Respuesta al reactivar una cuenta. No revierte nada de lo anterior. */
export interface ResultadoAltaProfesional {
  mensaje: string;
  profesional: ProfesionalPerfil;
}
