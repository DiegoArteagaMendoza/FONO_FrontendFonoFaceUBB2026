import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';

import {
  PmCliente,
  RegistroClientePayload,
  LoginClienteResponse,
  VideoSintomas
} from './interface/pm-cliente.interface';
import {
  VIDEO_DURACION_MAXIMA_SEGUNDOS,
  VIDEO_TAMANO_MAXIMO_MB,
  VIDEO_EXTENSIONES_PERMITIDAS,
  CLAVE_PMC_ACCESS,
  CLAVE_PMC_REFRESH,
  CLAVE_PMC_CLIENTE,
  CLAVE_PM_ACCESS
} from './constants/pm-cliente.const';

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
  // Consulta del profesional (no del propio paciente)
  // ---------------------------------------------------------------------

  /**
   * Pacientes activos, tal como los ve el fonoaudiólogo. La agenda lo usa para
   * mostrar el nombre de quien reservó cada cita, porque el serializer de PmCita
   * entrega el id del cliente y no sus datos.
   *
   * Va con el token del profesional, no con el del paciente: el backend exige
   * EsProfesional | EsAdministrador en este endpoint.
   */
  getClientesComoProfesional(): Observable<PmCliente[]> {
    return this.http.get<PmCliente[]>(
      `${this.apiClientes}${API_ENDPOINTS.portalMedicoClientes.listar}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem(CLAVE_PM_ACCESS)}` }) }
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
