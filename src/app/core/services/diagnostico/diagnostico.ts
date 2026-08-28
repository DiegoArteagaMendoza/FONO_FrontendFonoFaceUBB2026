import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api.constants';
import { environment } from '../../../../environments/environment';
import {
  DiagnosticoFormulario,
  DiagnosticoFormularioCrear,
  DiagnosticoFormularioEditable,
  DiagnosticoRespuesta,
  DiagnosticoRespuestaCrear,
  DiagnosticoRespuestaListado
} from './interface/diagnostico.interface';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Listar formularios GET - Acceso Público (alimenta el desplegable
  // "Autoevaluación" del portal de cliente y el listado del panel admin)
  listarFormularios(): Observable<DiagnosticoFormulario[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.diagnostico.listar}`;
    return this.http.get<DiagnosticoFormulario[]>(url);
  }

  // 2. Detalle de un formulario GET - Acceso Público (vista para responderlo)
  obtenerFormulario(idFormulario: number): Observable<DiagnosticoFormulario> {
    const url = `${this.apiUrl}${API_ENDPOINTS.diagnostico.detalle(idFormulario)}`;
    return this.http.get<DiagnosticoFormulario>(url);
  }

  // 3. Crear formulario POST - Requiere Bearer Token (administrador, cualquier rol)
  crearFormulario(datos: DiagnosticoFormularioCrear): Observable<DiagnosticoFormulario> {
    const url = `${this.apiUrl}${API_ENDPOINTS.diagnostico.crear}`;
    return this.http.post<DiagnosticoFormulario>(url, datos, { headers: this.getAuthHeaders() });
  }

  // 4. Editar campos simples PATCH - Requiere Bearer Token
  editarFormulario(idFormulario: number, datos: DiagnosticoFormularioEditable): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.diagnostico.editar(idFormulario)}`;
    return this.http.patch(url, datos, { headers: this.getAuthHeaders() });
  }

  // 5. Baja lógica DELETE - Requiere Bearer Token
  eliminarFormulario(idFormulario: number): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.diagnostico.eliminar(idFormulario)}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  // 6. Responder el test POST - Acceso Público (el cliente no tiene cuenta propia)
  responder(datos: DiagnosticoRespuestaCrear): Observable<DiagnosticoRespuesta> {
    const url = `${this.apiUrl}${API_ENDPOINTS.diagnostico.responder}`;
    return this.http.post<DiagnosticoRespuesta>(url, datos);
  }

  // 7. Resultados registrados de un formulario GET - Requiere Bearer Token
  listarRespuestas(idFormulario: number): Observable<DiagnosticoRespuestaListado[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.diagnostico.respuestasDeFormulario(idFormulario)}`;
    return this.http.get<DiagnosticoRespuestaListado[]>(url, { headers: this.getAuthHeaders() });
  }
}
