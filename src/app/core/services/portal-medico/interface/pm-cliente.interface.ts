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

/**
 * El video visto por quien llega con su código de seguimiento, sin sesión.
 *
 * Trae menos campos que VideoSintomas a propósito: el backend no entrega
 * ningún identificador a quien se autentica con un código (regla 4 del Specs
 * del backend). No hace falta ninguno, porque el video se gestiona a través de
 * la cita, que ya viene dada por el propio código.
 */
export interface VideoSeguimiento {
  video: string;
  descripcion: string | null;
  duracion_segundos: number;
  fecha_subida: string;
  fecha_expiracion: string;
  dias_restantes: number;
  esta_vigente: boolean;
}

/** Por qué se rechazó un archivo de video antes de enviarlo. */
export type MotivoVideoInvalido = 'formato' | 'peso' | 'duracion' | 'ilegible';

/**
 * Resultado de revisar un archivo en el navegador.
 *
 * El servicio devuelve el motivo y los números, no el mensaje: los textos viven
 * en textos.ts y los arma cada pantalla. Así las reglas (formato, peso,
 * duración) se escriben una sola vez aunque las usen dos pantallas distintas
 * —la del paciente con cuenta y la del seguimiento por código—, que es donde
 * antes se habrían duplicado.
 */
export interface ResultadoValidacionVideo {
  valido: boolean;
  motivo?: MotivoVideoInvalido;
  /** Duración leída, cuando se pudo leer. */
  duracionSegundos?: number;
  /** Peso en MB, redondeado a un decimal. */
  tamanoMb?: number;
}
