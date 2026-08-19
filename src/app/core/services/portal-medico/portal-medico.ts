import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';

// =========================================================
// INTERFACES (reflejan los serializers de PmMedico)
// =========================================================

export type EstadoVerificacion = 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';
export type TipoDocumento = 'CEDULA_IDENTIDAD' | 'CERTIFICADO_TITULO' | 'CERTIFICADO_SUPERINTENDENCIA';

export interface Especialidad {
  id_especialidad: number;
  nombre_especialidad_profesional: string;
  especialidad_requiere_certificado: boolean;
}

export interface ProfesionalEspecialidad {
  id_especialidad: number;
  especialidad: Especialidad;
  fecha_asignacion: string;
}

export interface DocumentoRespaldo {
  id_documento: number;
  id_profesional: number;
  tipo_documeto_profesional: TipoDocumento;
  url_documento_profesional: string;
  fecha_subida_documento_profesional: string;
  documento_profesional_valido: boolean;
}

export interface Acreditacion {
  id_acreditacion: number;
  id_profesional: number;
  estado_verificacion_profesional: EstadoVerificacion;
  fecha_solicitud_profesional: string;
  fecha_resolucion_profesional: string | null;
  id_administrador_resolutor: number | null;
}

export interface ProfesionalPerfil {
  id_profesional: number;
  nombres_profesional: string;
  apellidos_profesional: string;
  rut_profesional: string;
  numero_registro_salud_profesional: string;
  email_profesional: string;
  telefono_profesional: string;
  estado_cuenta_profesional: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  acreditaciones: Acreditacion[];
  documentos: DocumentoRespaldo[];
  especialidades_asignadas: ProfesionalEspecialidad[];
}

export interface ProfesionalDirectorio {
  id_profesional: number;
  nombres_profesional: string;
  apellidos_profesional: string;
  numero_registro_salud_profesional: string;
  email_profesional: string;
  telefono_profesional: string;
  especialidades: Especialidad[];
}

export interface RegistroProfesionalPayload {
  nombres_profesional: string;
  apellidos_profesional: string;
  rut_profesional: string;
  email_profesional: string;
  telefono_profesional: string;
  password: string;
  numero_registro_salud_profesional?: string;
}

export interface LoginProfesionalResponse {
  refresh: string;
  access: string;
  profesional: {
    id_profesional: number;
    nombres_profesional: string;
    email_profesional: string;
  };
}

// Claves de localStorage propias del profesional: deliberadamente distintas a las
// de AuthService ('access_token'/'refresh_token'/'user_data') porque son dos
// identidades separadas (administrador de FonoApp vs. profesional de PmMedico)
// que pueden convivir en el mismo navegador.
const CLAVE_PM_ACCESS = 'pm_access_token';
const CLAVE_PM_REFRESH = 'pm_refresh_token';
const CLAVE_PM_PROFESIONAL = 'pm_profesional_data';

@Injectable({
  providedIn: 'root'
})
export class PortalMedicoService {
  private apiUrl = environment.apiUrlPortalMedico;

  // Sesión del profesional autenticado (análogo a AdministracionService.usuarioActual,
  // pero para la identidad "profesional" en vez de "administrador de FonoApp").
  public profesionalActual = signal<LoginProfesionalResponse['profesional'] | null>(
    JSON.parse(localStorage.getItem(CLAVE_PM_PROFESIONAL) || 'null')
  );

  constructor(private http: HttpClient) {}

  /**
   * Traduce el cuerpo de un HttpErrorResponse del backend de PmMedico a un
   * mensaje legible, cubriendo las tres formas en que puede llegar un error:
   *   1. Vista propia con {"error": "mensaje"} (ej: resolver acreditación,
   *      eliminar documento validado).
   *   2. Permiso denegado de DRF con {"detail": "mensaje"} (403, ej: intentar
   *      aprobar sin ser administrador con rol máximo).
   *   3. Errores de validación de un serializer, con forma
   *      {"campo": ["mensaje1", "mensaje2"], ...} (400).
   * Si no reconoce la forma (caída de red, 500, etc.) devuelve el mensaje de
   * respaldo que le pase cada componente.
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
  // Cabeceras de autenticación
  // ---------------------------------------------------------------------

  /** Token del profesional (login propio en PmMedico). */
  private getProfesionalAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(CLAVE_PM_ACCESS);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Token del administrador de FonoApp (mismo 'access_token' que usa AdministracionService):
   * lo reutilizamos porque el backend de PmMedico valida ese mismo JWT para las
   * acciones administrativas (listar profesionales, validar documentos, resolver
   * acreditaciones, gestionar el catálogo de especialidades).
   */
  private getAdminAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ---------------------------------------------------------------------
  // Sesión del profesional
  // ---------------------------------------------------------------------

  estaAutenticadoComoProfesional(): boolean {
    return !!localStorage.getItem(CLAVE_PM_ACCESS);
  }

  setSesionProfesional(respuesta: LoginProfesionalResponse): void {
    localStorage.setItem(CLAVE_PM_ACCESS, respuesta.access);
    localStorage.setItem(CLAVE_PM_REFRESH, respuesta.refresh);
    localStorage.setItem(CLAVE_PM_PROFESIONAL, JSON.stringify(respuesta.profesional));
    this.profesionalActual.set(respuesta.profesional);
  }

  logoutProfesional(): void {
    localStorage.removeItem(CLAVE_PM_ACCESS);
    localStorage.removeItem(CLAVE_PM_REFRESH);
    localStorage.removeItem(CLAVE_PM_PROFESIONAL);
    this.profesionalActual.set(null);
  }

  /*
    ===================================================
    PROFESIONAL: REGISTRO, SESIÓN Y PERFIL PROPIO
    ===================================================
  */

  registrar(datos: RegistroProfesionalPayload): Observable<ProfesionalPerfil> {
    return this.http.post<ProfesionalPerfil>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.registrar}`,
      datos
    );
  }

  login(credenciales: { identificador: string; password: string }): Observable<LoginProfesionalResponse> {
    return this.http.post<LoginProfesionalResponse>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.login}`,
      credenciales
    );
  }

  getPerfil(): Observable<ProfesionalPerfil> {
    return this.http.get<ProfesionalPerfil>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.perfil}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  editarPerfil(datos: Partial<ProfesionalPerfil>): Observable<ProfesionalPerfil> {
    return this.http.patch<ProfesionalPerfil>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.perfilEditar}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  cambiarPassword(datos: { password_actual: string; password_nueva: string }): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.perfilPassword}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  eliminarCuenta(): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.perfilEliminar}`,
      { headers: this.getProfesionalAuthHeaders() }
    ).pipe(tap(() => this.logoutProfesional()));
  }

  /*
    ===================================================
    PROFESIONAL: DIRECTORIO PÚBLICO Y CATÁLOGO
    ===================================================
  */

  getDirectorio(): Observable<ProfesionalDirectorio[]> {
    return this.http.get<ProfesionalDirectorio[]>(`${this.apiUrl}${API_ENDPOINTS.portalMedico.directorio}`);
  }

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.apiUrl}${API_ENDPOINTS.portalMedico.especialidadesListar}`);
  }

  getEspecialidadesDeProfesional(idProfesional: number): Observable<ProfesionalEspecialidad[]> {
    return this.http.get<ProfesionalEspecialidad[]>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.profesionalEspecialidadesListar(idProfesional)}`
    );
  }

  /*
    ===================================================
    DOCUMENTOS DE RESPALDO (propios del profesional)
    ===================================================
  */

  subirDocumento(datos: FormData): Observable<DocumentoRespaldo> {
    return this.http.post<DocumentoRespaldo>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.documentoSubir}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  eliminarDocumento(idDocumento: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.documentoEliminar(idDocumento)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /*
    ===================================================
    ESPECIALIDADES PROPIAS (autogestión N:M)
    ===================================================
  */

  asignarEspecialidad(idEspecialidad: number): Observable<ProfesionalEspecialidad> {
    return this.http.post<ProfesionalEspecialidad>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.especialidadAsignar}`,
      { id_especialidad: idEspecialidad },
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  quitarEspecialidad(idEspecialidad: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.especialidadQuitar(idEspecialidad)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /*
    ===================================================
    ACREDITACIÓN (propia)
    ===================================================
  */

  getEstadoAcreditacion(idProfesional: number): Observable<Acreditacion> {
    return this.http.get<Acreditacion>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.acreditacionEstado(idProfesional)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /*
    ===================================================
    ADMINISTRACIÓN (usa el token de administrador de FonoApp)
    ===================================================
  */

  // 1. Profesionales
  getProfesionales(estadoVerificacion?: EstadoVerificacion): Observable<ProfesionalPerfil[]> {
    let url = `${this.apiUrl}${API_ENDPOINTS.portalMedico.listar}`;
    if (estadoVerificacion) {
      url += `?estado_verificacion=${estadoVerificacion}`;
    }
    return this.http.get<ProfesionalPerfil[]>(url, { headers: this.getAdminAuthHeaders() });
  }

  getProfesionalDetalle(idProfesional: number): Observable<ProfesionalPerfil> {
    return this.http.get<ProfesionalPerfil>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.detalle(idProfesional)}`,
      { headers: this.getAdminAuthHeaders() }
    );
  }

  // 2. Documentos
  getDocumentosDeProfesional(idProfesional: number): Observable<DocumentoRespaldo[]> {
    return this.http.get<DocumentoRespaldo[]>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.profesionalDocumentosListar(idProfesional)}`,
      { headers: this.getAdminAuthHeaders() }
    );
  }

  validarDocumento(idDocumento: number, esValido: boolean): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.documentoValidar(idDocumento)}`,
      { documento_profesional_valido: esValido },
      { headers: this.getAdminAuthHeaders() }
    );
  }

  // 3. Acreditaciones
  getAcreditacionesPendientes(): Observable<Acreditacion[]> {
    return this.http.get<Acreditacion[]>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.acreditacionesPendientes}`,
      { headers: this.getAdminAuthHeaders() }
    );
  }

  resolverAcreditacion(idAcreditacion: number, nuevoEstado: 'APROBADO' | 'RECHAZADO'): Observable<Acreditacion> {
    return this.http.patch<Acreditacion>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.acreditacionResolver(idAcreditacion)}`,
      { estado_verificacion_profesional: nuevoEstado },
      { headers: this.getAdminAuthHeaders() }
    );
  }

  // 4. Catálogo de especialidades (crear/editar/eliminar es solo administrador rol máximo)
  crearEspecialidad(datos: Partial<Especialidad>): Observable<Especialidad> {
    return this.http.post<Especialidad>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.especialidadCrear}`,
      datos,
      { headers: this.getAdminAuthHeaders() }
    );
  }

  editarEspecialidad(idEspecialidad: number, datos: Partial<Especialidad>): Observable<Especialidad> {
    return this.http.patch<Especialidad>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.especialidadEditar(idEspecialidad)}`,
      datos,
      { headers: this.getAdminAuthHeaders() }
    );
  }

  eliminarEspecialidad(idEspecialidad: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}${API_ENDPOINTS.portalMedico.especialidadEliminar(idEspecialidad)}`,
      { headers: this.getAdminAuthHeaders() }
    );
  }
}
