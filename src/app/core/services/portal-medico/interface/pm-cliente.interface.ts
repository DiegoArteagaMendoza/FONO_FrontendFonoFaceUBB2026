// Interfaces del paciente y sus videos de síntomas (apps PmCliente y PmVideo).
// Separadas del servicio según Specs.md: los .ts base de componentes y
// servicios no llevan interfaces, enums ni constantes.

// =========================================================
// INTERFACES (reflejan los serializers de PmCliente y PmVideo)
// =========================================================

export interface PmCliente {
  id_cliente: number;
  nombres_cliente: string;
  apellidos_clientes: string;
  rut_cliente: string;
  fecha_nacimiento_cliente: string;   // AAAA-MM-DD
  email_cliente: string;
  telefono_cliente: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: boolean;
}

export interface RegistroClientePayload {
  nombres_cliente: string;
  apellidos_clientes: string;
  rut_cliente: string;
  fecha_nacimiento_cliente: string;
  email_cliente: string;
  telefono_cliente: string;
  password: string;
}

export interface LoginClienteResponse {
  refresh: string;
  access: string;
  cliente: {
    id_cliente: number;
    nombres_cliente: string;
    apellidos_clientes: string;
    email_cliente: string;
  };
}

export interface VideoSintomas {
  id_video: number;
  cliente: number;
  /** Cita a la que se adjuntó el video, si el paciente eligió una. */
  cita: number | null;
  video: string;
  descripcion: string | null;
  duracion_segundos: number;
  fecha_subida: string;
  fecha_expiracion: string;
  estado: boolean;
  fecha_eliminacion: string | null;
  motivo_eliminacion: string | null;
  dias_restantes: number;
  esta_vigente: boolean;
}
