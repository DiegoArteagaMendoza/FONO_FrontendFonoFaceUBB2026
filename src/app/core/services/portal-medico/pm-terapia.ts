import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';

import { Ejercicio } from './interface/pm-terapia.interface';
import { CLAVE_PM_ACCESS } from './constants/pm-cliente.const';

/**
 * Terapia del Portal Médico (app PmTerapia): el catálogo de ejercicios del
 * fonoaudiólogo y, en entregas siguientes, los planes y el seguimiento.
 *
 * Todo lo del catálogo va con el token del profesional: los ejercicios son
 * privados y el backend rechaza cualquier otro.
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
