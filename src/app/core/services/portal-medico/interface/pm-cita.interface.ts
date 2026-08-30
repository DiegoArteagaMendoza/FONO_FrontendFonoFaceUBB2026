// Interfaces de las citas del Portal Médico (app PmCita del backend).
// Separadas del servicio según Specs.md: los .ts base de componentes y
// servicios no llevan interfaces, enums ni constantes.

// =========================================================
// INTERFACES (reflejan PmCita/serializer.py)
// =========================================================

/** Estados de una cita, tal como los define PmCita.Estado en el backend. */
export type EstadoCita = 'RE' | 'CC' | 'CM' | 'RZ';

/** Quién originó una cancelación o una reprogramación (PmCita.Origen). */
export type OrigenCambio = 'CLIENTE' | 'PROFESIONAL';

export interface Cita {
  id_cita: number;
  cliente: number;
  profesional: number;
  fecha_hora: string;
  duracion_minutos: number;
  motivo_consulta: string | null;
  estado: EstadoCita;
  permite_carga_video: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;

  // Cancelación
  motivo_cancelacion: string | null;
  fecha_cancelacion: string | null;
  cancelada_por: OrigenCambio | null;

  // Reprogramación
  fecha_hora_original: string | null;
  veces_reprogramada: number;
  motivo_reprogramacion: string | null;
  reprogramada_por: OrigenCambio | null;
  fecha_ultima_reprogramacion: string | null;

  // Atención
  fecha_marcada_realizada: string | null;

  // Calculados por el backend
  esta_activa: boolean;
  ya_paso: boolean;

  /** Solo llegan al reservar. */
  reservada_sin_sesion?: boolean;
  codigo_seguimiento?: string;
  correo_enviado?: boolean;
}

/**
 * Cita vista desde el seguimiento por código, sin sesión. El backend entrega
 * aquí los nombres ya resueltos y omite los ids internos, así que esta forma
 * NO coincide con la de Cita.
 */
export interface CitaSeguimiento {
  codigo_seguimiento: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo_consulta: string | null;
  estado: EstadoCita;
  estado_display: string;
  profesional_nombre: string;
  paciente_nombre: string;
  motivo_cancelacion: string | null;
  fecha_hora_original: string | null;
  veces_reprogramada: number;
  esta_activa: boolean;
  ya_paso: boolean;
  permite_cambios: boolean;
  reprogramaciones_restantes: number;
  permite_carga_video: boolean;
}

/** Hora publicada por un profesional, tal como la ve el paciente al elegir. */
export interface DisponibilidadPublica {
  id_disponibilidad: number;
  profesional: number;
  fecha_hora: string;
  fecha_hora_fin: string;
  duracion_minutos: number;
}

/** La misma hora vista por el profesional dueño, que sí sabe si ya fue tomada. */
export interface Disponibilidad extends DisponibilidadPublica {
  cita: number | null;
  estado: boolean;
  fecha_creacion: string;
  esta_reservado: boolean;
  esta_disponible: boolean;
  ya_paso: boolean;
}

/** Respuesta de publicar: cada hora se evalúa por separado. */
export interface ResultadoPublicacion {
  creados: Disponibilidad[];
  rechazados: { fecha_hora: string; motivo: string }[];
}

/**
 * Datos personales de quien reserva sin haber iniciado sesión. Con ellos el
 * backend crea o recupera su ficha; son los mismos campos del registro salvo
 * la contraseña.
 */
export interface PacienteInvitadoPayload {
  nombres_cliente: string;
  apellidos_clientes: string;
  rut_cliente: string;
  fecha_nacimiento_cliente: string;
  email_cliente: string;
  telefono_cliente: string;
}

/**
 * Cuerpo de POST /reservar/. Ni la fecha ni la duración ni el profesional
 * viajan aquí: los tres salen del bloque que el profesional publicó.
 *
 * 'paciente' solo se envía cuando no hay sesión. Con token, el dueño de la
 * cita sale siempre del token.
 */
export interface ReservarCitaPayload {
  id_disponibilidad: number;
  motivo_consulta?: string;
  paciente?: PacienteInvitadoPayload;
}

export interface PosponerCitaPayload {
  fecha_hora: string;
  motivo?: string;
}

export interface CancelarCitaPayload {
  motivo?: string;
}
