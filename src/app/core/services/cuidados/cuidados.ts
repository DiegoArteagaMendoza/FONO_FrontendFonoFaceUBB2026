import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { environment } from '../../../../environments/environment';

export interface Cuidado {
  id_cuidado: number;
  publico: string;
  publico_display: string;
  titulo: string;
  contenido: string;
  img: string | null;
  fuente: string | null;
  estado: boolean;
  FonoApp_Administracion: number;
}

@Injectable({
  providedIn: 'root'
})
export class CuidadosService {
  // Utilizamos la URL base desde tus environments (ej. http://127.0.0.1:8000)
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Listar GET - Acceso Público
  getCuidados(): Observable<Cuidado[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.cuidados.listar}`;
    return this.http.get<Cuidado[]>(url);
  }

  // 2. Filtrar por Público GET - Acceso Público
  getCuidadosPorPublico(tipoPublico: string): Observable<Cuidado[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.cuidados.porPublico(tipoPublico)}`;
    return this.http.get<Cuidado[]>(url);
  }

  // 3. Crear POST - Requiere Bearer Token
  crearCuidado(datos: FormData): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.cuidados.crear}`;
    return this.http.post(url, datos, { headers: this.getAuthHeaders() });
  }

  // 4. Editar PATCH - Requiere Bearer Token
  editarCuidado(id: number, datos: any): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.cuidados.editar(id)}`;
    return this.http.patch(url, datos, { headers: this.getAuthHeaders() });
  }

  // 5. Eliminar DELETE - Requiere Bearer Token
  eliminarCuidado(id: number): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.cuidados.eliminar(id)}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }
}