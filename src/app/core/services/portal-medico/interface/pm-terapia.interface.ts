// Interfaces de la terapia del Portal Médico (app PmTerapia del backend).
// Separadas del servicio según Specs.md: los .ts base de componentes y
// servicios no llevan interfaces, enums ni constantes.

/**
 * Un ejercicio del catálogo privado del fonoaudiólogo, tal como lo entrega
 * PmEjercicioSerializer. No trae 'profesional': quien lo lee es su dueño.
 */
export interface Ejercicio {
  id_ejercicio: number;
  nombre: string;
  instrucciones: string;
  /** URL https del video de ejemplo, lista para <video>. */
  video_ejemplo: string;
  duracion_segundos: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
