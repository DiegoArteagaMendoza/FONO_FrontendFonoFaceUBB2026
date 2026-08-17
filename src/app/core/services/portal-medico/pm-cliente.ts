import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';

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
 * Reglas del video, espejo de las constantes del backend
 * (FonoAppPortalMedico/PmVideo/models.py). Se validan aquí para dar feedback
 * inmediato, pero el backend las vuelve a validar: es él quien manda.
 */
export const VIDEO_DURACION_MAXIMA_SEGUNDOS = 30;
export const VIDEO_TAMANO_MAXIMO_MB = 50;
export const VIDEO_EXTENSIONES_PERMITIDAS = ['mp4', 'webm', 'mov'];
export const VIDEO_DIAS_VIGENCIA = 30;

// Claves de localStorage propias del paciente: distintas a las del profesional
// ('pm_*') y a las del administrador de FonoApp ('access_token'), porque son
// tres identidades separadas que pueden convivir en el mismo navegador.
const CLAVE_PMC_ACCESS = 'pmc_access_token';
const CLAVE_PMC_REFRESH = 'pmc_refresh_token';
const CLAVE_PMC_CLIENTE = 'pmc_cliente_data';

@Injectable({
  providedIn: 'root'
})
export class PmClienteService {
  private http = inject(HttpClient);

  private apiClientes = environment.apiUrlPortalMedicoClientes;
  private apiVideos = environment.apiUrlPortalMedicoVideos;

  /** Paciente con sesión iniciada (análogo a PortalMedicoService.profesionalActual) */
  public clienteActual = signal<LoginClienteResponse['cliente'] | null>(
    JSON.parse(localStorage.getItem(CLAVE_PMC_CLIENTE) || 'null')
  );

  // ---------------------------------------------------------------------
  // Sesión del paciente
  // ---------------------------------------------------------------------

  estaAutenticadoComoCliente(): boolean {
    return !!localStorage.getItem(CLAVE_PMC_ACCESS);
  }

  setSesionCliente(respuesta: LoginClienteResponse): void {
    localStorage.setItem(CLAVE_PMC_ACCESS, respuesta.access);
    localStorage.setItem(CLAVE_PMC_REFRESH, respuesta.refresh);
    localStorage.setItem(CLAVE_PMC_CLIENTE, JSON.stringify(respuesta.cliente));
    this.clienteActual.set(respuesta.cliente);
  }

  logoutCliente(): void {
    localStorage.removeItem(CLAVE_PMC_ACCESS);
    localStorage.removeItem(CLAVE_PMC_REFRESH);
    localStorage.removeItem(CLAVE_PMC_CLIENTE);
    this.clienteActual.set(null);
  }

  private getClienteAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(CLAVE_PMC_ACCESS);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Traduce el error del backend a un mensaje legible. Mismo criterio que
   * PortalMedicoService.extraerMensajeError, para que ambos portales muestren
   * los errores igual.
   */
  extraerMensajeError(err: any, mensajePorDefecto: string): string {
    const cuerpo = err?.error;

    if (!cuerpo) return mensajePorDefecto;
    if (typeof cuerpo === 'string') return cuerpo;

    if (typeof cuerpo === 'object') {
      if (typeof cuerpo.error === 'string') return cuerpo.error;
      if (typeof cuerpo.detail === 'string') return cuerpo.detail;

      const mensajesDeCampos = Object.values(cuerpo).flat().filter(v => typeof v === 'string');
      if (mensajesDeCampos.length > 0) return mensajesDeCampos.join(' ');
    }

    return mensajePorDefecto;
  }

  // ---------------------------------------------------------------------
  // Registro, sesión y perfil propio
  // ---------------------------------------------------------------------

  registrar(datos: RegistroClientePayload): Observable<PmCliente> {
    return this.http.post<PmCliente>(
      `${this.apiClientes}${API_ENDPOINTS.portalMedicoClientes.registrar}`,
      datos
    );
  }

  login(credenciales: { identificador: string; password: string }): Observable<LoginClienteResponse> {
    return this.http.post<LoginClienteResponse>(
      `${this.apiClientes}${API_ENDPOINTS.portalMedicoClientes.login}`,
      credenciales
    );
  }

  getPerfil(): Observable<PmCliente> {
    return this.http.get<PmCliente>(
      `${this.apiClientes}${API_ENDPOINTS.portalMedicoClientes.perfil}`,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  editarPerfil(datos: Partial<PmCliente>): Observable<PmCliente> {
    return this.http.patch<PmCliente>(
      `${this.apiClientes}${API_ENDPOINTS.portalMedicoClientes.perfilEditar}`,
      datos,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  cambiarPassword(datos: { password_actual: string; password_nueva: string }): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(
      `${this.apiClientes}${API_ENDPOINTS.portalMedicoClientes.perfilPassword}`,
      datos,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  // ---------------------------------------------------------------------
  // Videos de síntomas (propios del paciente)
  // ---------------------------------------------------------------------

  /**
   * Sube el video del paciente autenticado. El FormData NO lleva el id del
   * cliente: el backend lo toma del token, así nadie sube videos a nombre de otro.
   */
  subirVideo(datos: FormData): Observable<VideoSintomas> {
    return this.http.post<VideoSintomas>(
      `${this.apiVideos}${API_ENDPOINTS.portalMedicoVideos.subir}`,
      datos,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  getMisVideos(): Observable<VideoSintomas[]> {
    return this.http.get<VideoSintomas[]>(
      `${this.apiVideos}${API_ENDPOINTS.portalMedicoVideos.misVideos}`,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  eliminarMiVideo(idVideo: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiVideos}${API_ENDPOINTS.portalMedicoVideos.miVideoEliminar(idVideo)}`,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  /**
   * Lee la duración real del video en el navegador antes de enviarlo.
   * El backend no puede medirla sin dependencias extra (ffmpeg), así que este
   * dato viaja como campo del formulario; el backend igualmente rechaza
   * cualquier valor mayor al máximo permitido.
   */
  obtenerDuracionSegundos(archivo: File): Promise<number> {
    return new Promise((resolver, rechazar) => {
      const url = URL.createObjectURL(archivo);
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);

        // Algunos .webm grabados desde el navegador reportan duración Infinity
        // o NaN. Si pasa, damos por fallida la lectura y dejamos que valide el
        // backend, en vez de mostrar "dura Infinity segundos".
        if (!Number.isFinite(video.duration) || video.duration <= 0) {
          rechazar(new Error('Duración no legible'));
          return;
        }

        resolver(Math.round(video.duration));
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        rechazar(new Error('No se pudo leer el video'));
      };

      video.src = url;
    });
  }
}
