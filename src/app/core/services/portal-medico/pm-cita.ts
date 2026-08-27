import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { VideoSintomas } from './pm-cliente';

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

// =========================================================
// REGLAS DEL NEGOCIO
// Espejo de las constantes de FonoAppPortalMedico/PmCita/models.py. Se usan
// aquí para guiar el formulario (mínimos del selector de fecha, tope de
// reprogramaciones, avisos), pero el backend las vuelve a validar siempre:
// es él quien manda. Si allá cambian, hay que actualizarlas aquí.
// =========================================================

export const CITA_DURACION_MINUTOS_DEFECTO = 45;
export const CITA_DURACION_MINUTOS_MINIMA = 15;
export const CITA_DURACION_MINUTOS_MAXIMA = 120;
export const CITA_HORAS_MINIMAS_ANTICIPACION = 2;
export const CITA_REPROGRAMACIONES_MAXIMAS = 3;

/** Duraciones ofrecidas en el formulario, todas dentro del rango permitido. */
export const CITA_DURACIONES_SUGERIDAS = [15, 30, 45, 60, 90, 120];

// Las mismas claves que usan PmClienteService y PortalMedicoService. Se leen
// aquí directamente (igual que en auth.interceptor.ts) porque este servicio
// atiende a las dos identidades: el paciente y el fonoaudiólogo.
const CLAVE_PMC_ACCESS = 'pmc_access_token';
const CLAVE_PM_ACCESS = 'pm_access_token';

@Injectable({
  providedIn: 'root'
})
export class PmCitaService {
  private http = inject(HttpClient);
  private apiCitas = environment.apiUrlPortalMedicoCitas;
  private apiVideos = environment.apiUrlPortalMedicoVideos;

  // ---------------------------------------------------------------------
  // Cabeceras: cada lado de la cita usa su propio token
  // ---------------------------------------------------------------------

  private getClienteAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem(CLAVE_PMC_ACCESS)}` });
  }

  /**
   * Cabeceras para reservar, que ahora funciona con y sin sesión. Si no hay
   * token, se devuelve un objeto vacío en vez de "Bearer null": mandar una
   * cabecera de autorización inválida hace que el backend responda 401 en vez
   * de tratar la petición como anónima.
   */
  private getHeadersOpcionalesDeCliente(): HttpHeaders {
    const token = localStorage.getItem(CLAVE_PMC_ACCESS);
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private getProfesionalAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem(CLAVE_PM_ACCESS)}` });
  }

  // ---------------------------------------------------------------------
  // Lado del paciente
  // ---------------------------------------------------------------------

  /**
   * Reserva tomando una hora publicada. Funciona con y sin sesión: si hay
   * token va como el paciente autenticado, y si no, el payload debe traer
   * 'paciente' con sus datos personales.
   */
  reservar(datos: ReservarCitaPayload): Observable<Cita> {
    return this.http.post<Cita>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.reservar}`,
      datos,
      { headers: this.getHeadersOpcionalesDeCliente() }
    );
  }

  /**
   * Horas libres de un profesional. Endpoint público: el paciente necesita
   * verlas antes de decidir si se registra.
   */
  getDisponibilidadDeProfesional(idProfesional: number): Observable<DisponibilidadPublica[]> {
    return this.http.get<DisponibilidadPublica[]>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.disponibilidadDeProfesional(idProfesional)}`
    );
  }

  /**
   * Citas del paciente. Con soloProximas=true trae únicamente las reservadas
   * que aún no ocurren; sin el filtro, todo el historial (incluye canceladas
   * y realizadas).
   */
  getMisCitas(idCliente: number, soloProximas = false): Observable<Cita[]> {
    const ruta = soloProximas
      ? API_ENDPOINTS.portalMedicoCitas.misCitasProximas(idCliente)
      : API_ENDPOINTS.portalMedicoCitas.misCitas(idCliente);

    return this.http.get<Cita[]>(`${this.apiCitas}${ruta}`, {
      headers: this.getClienteAuthHeaders()
    });
  }

  cancelarComoCliente(idCita: number, datos: CancelarCitaPayload = {}): Observable<Cita> {
    return this.http.patch<Cita>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.clienteCancelar(idCita)}`,
      datos,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  posponerComoCliente(idCita: number, datos: PosponerCitaPayload): Observable<Cita> {
    return this.http.patch<Cita>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.clientePosponer(idCita)}`,
      datos,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  // ---------------------------------------------------------------------
  // Lado del profesional
  // ---------------------------------------------------------------------

  /** Agenda del profesional autenticado; el backend la filtra por su token. */
  getAgenda(soloProximas = false): Observable<Cita[]> {
    const ruta = soloProximas
      ? API_ENDPOINTS.portalMedicoCitas.agendaProximas
      : API_ENDPOINTS.portalMedicoCitas.agenda;

    return this.http.get<Cita[]>(`${this.apiCitas}${ruta}`, {
      headers: this.getProfesionalAuthHeaders()
    });
  }

  cancelarComoProfesional(idCita: number, datos: CancelarCitaPayload = {}): Observable<Cita> {
    return this.http.patch<Cita>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.profesionalCancelar(idCita)}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  posponerComoProfesional(idCita: number, datos: PosponerCitaPayload): Observable<Cita> {
    return this.http.patch<Cita>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.profesionalPosponer(idCita)}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  marcarRealizada(idCita: number): Observable<Cita> {
    return this.http.patch<Cita>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.profesionalMarcarRealizada(idCita)}`,
      {},
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  // --- Seguimiento por código (sin sesión) ---

  /**
   * Consulta una cita con el código que llegó por correo. No lleva cabeceras
   * de autorización: el código es la credencial.
   */
  getPorCodigo(codigo: string): Observable<CitaSeguimiento> {
    return this.http.get<CitaSeguimiento>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.seguimiento(codigo)}`
    );
  }

  cancelarPorCodigo(codigo: string, datos: CancelarCitaPayload = {}): Observable<CitaSeguimiento> {
    return this.http.patch<CitaSeguimiento>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.seguimientoCancelar(codigo)}`,
      datos
    );
  }

  posponerPorCodigo(codigo: string, datos: PosponerCitaPayload): Observable<CitaSeguimiento> {
    return this.http.patch<CitaSeguimiento>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.seguimientoPosponer(codigo)}`,
      datos
    );
  }

  // --- Disponibilidad publicada por el profesional ---

  /**
   * Publica varias horas de una vez. La respuesta separa las creadas de las
   * rechazadas: un solape en una hora no debe obligar a repetir la jornada.
   */
  publicarDisponibilidad(fechasHora: string[], duracionMinutos?: number): Observable<ResultadoPublicacion> {
    const cuerpo: { fechas_hora: string[]; duracion_minutos?: number } = { fechas_hora: fechasHora };
    if (duracionMinutos) cuerpo.duracion_minutos = duracionMinutos;

    return this.http.post<ResultadoPublicacion>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.disponibilidadPublicar}`,
      cuerpo,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /** Horas publicadas por el profesional autenticado, con su estado. */
  getMisDisponibilidades(incluirPasadas = false): Observable<Disponibilidad[]> {
    const ruta = incluirPasadas
      ? API_ENDPOINTS.portalMedicoCitas.disponibilidadMiasTodas
      : API_ENDPOINTS.portalMedicoCitas.disponibilidadMias;

    return this.http.get<Disponibilidad[]>(`${this.apiCitas}${ruta}`, {
      headers: this.getProfesionalAuthHeaders()
    });
  }

  /** Retira una hora publicada. El backend rechaza las que ya tienen cita. */
  retirarDisponibilidad(idDisponibilidad: number): Observable<Disponibilidad> {
    return this.http.delete<Disponibilidad>(
      `${this.apiCitas}${API_ENDPOINTS.portalMedicoCitas.disponibilidadRetirar(idDisponibilidad)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /**
   * Videos de síntomas adjuntos a una cita. El backend solo los entrega al
   * profesional que atiende esa cita (o a un administrador) y siempre filtra
   * los vencidos, así que lo que llegue aquí ya es lo que se puede mostrar.
   */
  getVideosDeCita(idCita: number): Observable<VideoSintomas[]> {
    return this.http.get<VideoSintomas[]>(
      `${this.apiVideos}${API_ENDPOINTS.portalMedicoVideos.listarPorCita(idCita)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  // ---------------------------------------------------------------------
  // Reglas de negocio evaluadas en el cliente
  // Replican PmCita.esta_activa / permite_cambios() para poder deshabilitar
  // botones antes de que el usuario intente una acción que el backend va a
  // rechazar. El backend sigue siendo la autoridad.
  // ---------------------------------------------------------------------

  /** Momento a partir del cual ya no se admiten cambios (fecha_hora − 2 h). */
  horaLimiteCambio(cita: Cita): Date {
    const limite = new Date(cita.fecha_hora);
    limite.setHours(limite.getHours() - CITA_HORAS_MINIMAS_ANTICIPACION);
    return limite;
  }

  /** True si la cita sigue reservada y falta más que la anticipación mínima. */
  permiteCambios(cita: Cita): boolean {
    return cita.esta_activa && new Date() < this.horaLimiteCambio(cita);
  }

  /** True si además le quedan reprogramaciones disponibles (tope de 3). */
  permiteReprogramar(cita: Cita): boolean {
    return this.permiteCambios(cita) && cita.veces_reprogramada < CITA_REPROGRAMACIONES_MAXIMAS;
  }

  reprogramacionesRestantes(cita: Cita): number {
    return Math.max(0, CITA_REPROGRAMACIONES_MAXIMAS - cita.veces_reprogramada);
  }

  /**
   * True si se puede adjuntar un video de síntomas a esta cita: el backend lo
   * exige activa y con permite_carga_video (ver PmVideo/serializer.validate).
   */
  admiteVideo(cita: Cita): boolean {
    return cita.esta_activa && cita.permite_carga_video;
  }

  /** Fin estimado de la atención, para mostrar el rango horario. */
  fechaHoraFin(cita: Cita): Date {
    const fin = new Date(cita.fecha_hora);
    fin.setMinutes(fin.getMinutes() + cita.duracion_minutos);
    return fin;
  }

  // ---------------------------------------------------------------------
  // Utilidades de fecha para los formularios
  // ---------------------------------------------------------------------

  /**
   * Valor mínimo para un <input type="datetime-local">: ahora más la
   * anticipación mínima, en horario local y con el formato AAAA-MM-DDTHH:mm
   * que exige el input.
   */
  minimoParaAgendar(): string {
    const minimo = new Date();
    minimo.setHours(minimo.getHours() + CITA_HORAS_MINIMAS_ANTICIPACION);
    return this.aValorInputLocal(minimo);
  }

  /** Convierte una fecha a AAAA-MM-DDTHH:mm en horario local. */
  aValorInputLocal(fecha: Date): string {
    const dos = (n: number) => `${n}`.padStart(2, '0');
    return (
      `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}` +
      `T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`
    );
  }

  /**
   * Pasa el valor local del input a ISO 8601 con zona, que es lo que espera el
   * DateTimeField del backend. new Date('2026-08-20T10:30') interpreta el texto
   * en la zona del navegador, así que toISOString() entrega el instante correcto.
   */
  aIsoDesdeInputLocal(valorLocal: string): string {
    return new Date(valorLocal).toISOString();
  }

  /**
   * True si el valor elegido en el input no alcanza la anticipación mínima.
   * El atributo [min] del input ya lo impide en la mayoría de navegadores, pero
   * se puede escribir a mano, así que se comprueba antes de enviar.
   */
  faltaAnticipacion(valorLocal: string): boolean {
    if (!valorLocal) return false;

    const minimo = new Date();
    minimo.setHours(minimo.getHours() + CITA_HORAS_MINIMAS_ANTICIPACION);
    return new Date(valorLocal) < minimo;
  }

  // ---------------------------------------------------------------------
  // Presentación
  // ---------------------------------------------------------------------

  /** Clase CSS del badge según el estado (ver filtros_badges.scss). */
  claseEstado(cita: Cita): string {
    switch (cita.estado) {
      case 'RE': return 'badge-cita-reservada';
      case 'RZ': return 'badge-cita-realizada';
      case 'CC':
      case 'CM': return 'badge-cita-cancelada';
      default: return 'badge-pendiente';
    }
  }

  /**
   * Traduce el error del backend a un mensaje legible. Mismo criterio que
   * PmClienteService y PortalMedicoService, con un caso extra: al reservar, las
   * ValidationError de Django llegan como {"error": ["mensaje", ...]} en vez de
   * {"error": "mensaje"}, porque la vista serializa error.messages (una lista).
   */
  extraerMensajeError(err: any, mensajePorDefecto: string): string {
    const cuerpo = err?.error;

    if (!cuerpo) return mensajePorDefecto;
    if (typeof cuerpo === 'string') return cuerpo;

    if (typeof cuerpo === 'object') {
      if (typeof cuerpo.error === 'string') return cuerpo.error;
      if (Array.isArray(cuerpo.error)) return cuerpo.error.join(' ');
      if (typeof cuerpo.detail === 'string') return cuerpo.detail;

      const mensajesDeCampos = Object.values(cuerpo)
        .flat()
        .filter(valor => typeof valor === 'string');
      if (mensajesDeCampos.length > 0) return mensajesDeCampos.join(' ');
    }

    return mensajePorDefecto;
  }
}
