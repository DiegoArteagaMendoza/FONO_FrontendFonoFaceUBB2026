import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { HttpHeaders } from '@angular/common/http';

// Interfaces basadas en la documentación de la API
export interface ImagenInformacion {
  id: number;
  imagen: string;
  fecha_subida: string;
}

export interface Informacion {
  id_informacion: number;
  titulo: string;
  categoria: string;
  categoria_display: string;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: boolean;
  FonoApp_Administracion: number;
  imagenes: ImagenInformacion[];
}

@Injectable({
  providedIn: 'root'
})
export class InformacionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // El endpoint listar/ es público según la documentación
  getInformacion(categoria?: string): Observable<Informacion[]> {
    let url = `${this.apiUrl}${API_ENDPOINTS.informacion.listar}`;
    if (categoria) {
      url += `?categoria=${categoria}`;
    }
    return this.http.get<Informacion[]>(url);
  }
  
  crearInformacion(datos: FormData): Observable<any> {
    // Obtenemos el token guardado en el login
    const token = localStorage.getItem('access_token');
    
    // Configuramos la cabecera de autorización Bearer
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}${API_ENDPOINTS.informacion.crear}`;
    
    // Enviamos la petición POST con el FormData y las cabeceras
    return this.http.post(url, datos, { headers });
  }

  editarInformacion(id: number, datos: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Requiere validación Bearer
    });

    const url = `${this.apiUrl}${API_ENDPOINTS.informacion.editar(id)}`;
    
    // Enviamos la petición PATCH con el JSON de los textos
    return this.http.patch(url, datos, { headers });
  }

}