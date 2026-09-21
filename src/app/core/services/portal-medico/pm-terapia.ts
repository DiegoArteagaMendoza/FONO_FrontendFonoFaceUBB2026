import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';

import {
  Ejercicio,
  PlanTerapia,
  PlanTerapiaPayload,
  ContextoPlanDeCita,
  VideoProgreso
} from './interface/pm-terapia.interface';
import { CLAVE_PM_ACCESS, CLAVE_PMC_ACCESS } from './constants/pm-cliente.const';

/**
 * Terapia del Portal Médico (app PmTerapia): el catálogo de ejercicios del
 * fonoaudiólogo, los planes de terapia de sus pacientes y, en entregas
 * siguientes, los videos de progreso y el seguimiento.
 *
 * El catálogo y los planes van con el token del profesional; la lectura del
 * propio plan, con el del paciente. El backend rechaza cualquier cruce.
 */
@Injectable({
  providedIn: 'root'
})
export class PmTerapiaService {
  private http = inject(HttpClient);
  private apiTerapia = environment.apiUrlPortalMedicoTerapia;

  private getProfesionalAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem(CLAVE_PM_ACCESS)}` });
  }

  private getClienteAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem(CLAVE_PMC_ACCESS)}` });
  }

  // ---------------------------------------------------------------------
  // Catálogo de ejercicios (fonoaudiólogo)
  // ---------------------------------------------------------------------

  getMisEjercicios(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.ejercicios}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /** FormData: nombre, instrucciones, video_ejemplo y duracion_segundos. */
  crearEjercicio(datos: FormData): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.ejercicioCrear}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /**
   * FormData con solo lo que cambia. Si va un video nuevo, tiene que ir con
   * su duracion_segundos; el backend lo exige.
   */
  editarEjercicio(idEjercicio: number, datos: FormData): Observable<Ejercicio> {
    return this.http.patch<Ejercicio>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.ejercicioEditar(idEjercicio)}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  eliminarEjercicio(idEjercicio: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.ejercicioEliminar(idEjercicio)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  // ---------------------------------------------------------------------
  // Plan de terapia (fonoaudiólogo)
  // ---------------------------------------------------------------------

  /** Crea el plan desde una cita realizada. El cuerpo lleva id_cita. */
  crearPlan(datos: PlanTerapiaPayload): Observable<PlanTerapia> {
    return this.http.post<PlanTerapia>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.planCrear}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  getMisPlanes(incluirCerrados = false): Observable<PlanTerapia[]> {
    const ruta = incluirCerrados
      ? API_ENDPOINTS.portalMedicoTerapia.planesTodos
      : API_ENDPOINTS.portalMedicoTerapia.planes;

    return this.http.get<PlanTerapia[]>(`${this.apiTerapia}${ruta}`, {
      headers: this.getProfesionalAuthHeaders()
    });
  }

  getPlan(idPlan: number): Observable<PlanTerapia> {
    return this.http.get<PlanTerapia>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.planDetalle(idPlan)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /**
   * Ajusta ejercicios, periodicidad o indicaciones. Solo viaja lo que cambia.
   * Cambiar la periodicidad reinicia el plan a hoy: el backend lo hace, aquí
   * solo conviene avisarlo antes de enviar.
   */
  ajustarPlan(idPlan: number, datos: PlanTerapiaPayload): Observable<PlanTerapia> {
    return this.http.patch<PlanTerapia>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.planAjustar(idPlan)}`,
      datos,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  cerrarPlan(idPlan: number): Observable<PlanTerapia> {
    return this.http.post<PlanTerapia>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.planCerrar(idPlan)}`,
      {},
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  /**
   * El plan activo del paciente de esa cita (o null), más el nombre del
   * paciente y si tiene cuenta. El formulario del plan decide con esto si
   * crea, ajusta, o explica por qué no se puede.
   */
  getPlanDeCita(idCita: number): Observable<ContextoPlanDeCita> {
    return this.http.get<ContextoPlanDeCita>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.planDeCita(idCita)}`,
      { headers: this.getProfesionalAuthHeaders() }
    );
  }

  // ---------------------------------------------------------------------
  // Plan de terapia (paciente)
  // ---------------------------------------------------------------------

  /** Los planes activos del paciente con sesión, con ejercicios y video de ejemplo. */
  getMisPlanesComoPaciente(): Observable<PlanTerapia[]> {
    return this.http.get<PlanTerapia[]>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.misPlanes}`,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  // ---------------------------------------------------------------------
  // Videos de progreso (paciente)
  // ---------------------------------------------------------------------

  /** FormData: id_plan_ejercicio, video, duracion_segundos y comentario opcional. */
  subirVideoProgreso(idPlan: number, datos: FormData): Observable<VideoProgreso> {
    return this.http.post<VideoProgreso>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.miPlanVideoSubir(idPlan)}`,
      datos,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  /** Historial del plan, vigentes y vencidos, del más nuevo al más viejo. */
  getVideosDeMiPlan(idPlan: number): Observable<VideoProgreso[]> {
    return this.http.get<VideoProgreso[]>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.miPlanVideos(idPlan)}`,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  eliminarMiVideoProgreso(idVideo: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiTerapia}${API_ENDPOINTS.portalMedicoTerapia.miVideoProgresoEliminar(idVideo)}`,
      { headers: this.getClienteAuthHeaders() }
    );
  }

  // ---------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------

  /**
   * Mensaje legible desde la respuesta de error de DRF. Los errores de campo
   * llegan como { campo: ['mensaje'] } y los generales como { error: '...' }.
   */
  extraerMensajeError(err: any, porDefecto: string): string {
    const cuerpo = err?.error;
    if (!cuerpo || typeof cuerpo !== 'object') return porDefecto;

    if (typeof cuerpo.error === 'string') return cuerpo.error;
    if (typeof cuerpo.detail === 'string') return cuerpo.detail;

    for (const valor of Object.values(cuerpo)) {
      if (typeof valor === 'string') return valor;
      if (Array.isArray(valor) && typeof valor[0] === 'string') return valor[0];
    }

    return porDefecto;
  }
}
