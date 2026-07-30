import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { environment } from '../../../../environments/environment';

export interface Voz {
  id_voz: number;
  categoria: string;
  categoria_display: string;
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
export class VozService {
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
  getVoz(): Observable<Voz[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.voz.listar}`;
    return this.http.get<Voz[]>(url);
  }

  // 2. Filtrar por Categoría GET - Acceso Público
  getVozPorCategoria(tipoCategoria: string): Observable<Voz[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.voz.porCategoria(tipoCategoria)}`;
    return this.http.get<Voz[]>(url);
  }

  // 3. Crear POST - Requiere Bearer Token
  crearVoz(datos: FormData): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.voz.crear}`;
    return this.http.post(url, datos, { headers: this.getAuthHeaders() });
  }

  // 4. Editar PATCH - Requiere Bearer Token
  editarVoz(id: number, datos: any): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.voz.editar(id)}`;
    return this.http.patch(url, datos, { headers: this.getAuthHeaders() });
  }

  // 5. Eliminar DELETE - Requiere Bearer Token
  eliminarVoz(id: number): Observable<any> {
    const url = `${this.apiUrl}${API_ENDPOINTS.voz.eliminar(id)}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }
}
