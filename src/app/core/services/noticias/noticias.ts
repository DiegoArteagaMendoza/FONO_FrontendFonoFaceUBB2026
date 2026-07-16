import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';

// Interfaces basadas en la documentación de la API de noticias
export interface ImagenNoticia {
  id: number;
  imagen: string;
  fecha_subida: string;
}

export interface Noticia {
  id_noticia: number;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: boolean;
  FonoApp_Administracion: number;
  imagenes: ImagenNoticia[];
}

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // El endpoint listar/ es público según la documentación
  getNoticias(): Observable<Noticia[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.noticias.listar}`;
    return this.http.get<Noticia[]>(url);
  }

  // El endpoint newsletter/suscribir/ también es público
  suscribirNewsletter(email: string): Observable<{ mensaje: string }> {
    const url = `${this.apiUrl}${API_ENDPOINTS.noticias.newsletterSuscribir}`;
    return this.http.post<{ mensaje: string }>(url, { email });
  }

  crearNoticia(datos: FormData): Observable<any> {
    // Obtenemos el token guardado en el login
    const token = localStorage.getItem('access_token');

    // Configuramos la cabecera de autorización Bearer
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}${API_ENDPOINTS.noticias.crear}`;

    // Enviamos la petición POST con el FormData y las cabeceras
    return this.http.post(url, datos, { headers });
  }

  eliminarNoticia(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Requiere validación Bearer
    });

    const url = `${this.apiUrl}${API_ENDPOINTS.noticias.eliminar(id)}`;

    return this.http.delete(url, { headers });
  }

  editarNoticia(id: number, datos: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Requiere validación Bearer
    });

    const url = `${this.apiUrl}${API_ENDPOINTS.noticias.editar(id)}`;

    // Enviamos la petición PATCH con el JSON de los textos (titulo y/o contenido)
    return this.http.patch(url, datos, { headers });
  }

  agregarImagenesNoticia(idNoticia: number, datos: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}${API_ENDPOINTS.noticias.imagenAgregar(idNoticia)}`;

    return this.http.post(url, datos, { headers });
  }

  eliminarImagenNoticia(idImagen: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}${API_ENDPOINTS.noticias.imagenEliminar(idImagen)}`;

    return this.http.delete(url, { headers });
  }
}
