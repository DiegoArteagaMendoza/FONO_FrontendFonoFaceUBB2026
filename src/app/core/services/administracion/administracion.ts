import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 1. Interfaz imagenes carrusel
export interface ImagenBanner {
  id: number;
  imagen: string;
  fecha_subida?: string;
}

// 2. Interfaz carrusel
export interface CarruselItem {
  id_banner?: number; // Django usa id_banner
  id?: number;        // Lo dejamos opcional por si lo usas en el HTML
  titulo: string;
  descripcion: string;
  imagenes: ImagenBanner[]; // Ahora es un arreglo de imágenes
  fecha_creacion?: string;
  estado?: boolean;
}

// 3. Interfaz usuarios
export interface UsuarioItem {
  id_usuario?: number;
  nombre: string;
  rut: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdministracionService {
  private apiUrl = environment.apiUrl; 

  public usuarioActual = signal<any>(null);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  cargarPerfil(): void {
    this.http.get<any>(`${this.apiUrl}/usuarios/me/`, { headers: this.getAuthHeaders() }).subscribe({
      next: (usuario) => {
        this.usuarioActual.set(usuario);
      },
      error: (err) => console.error('Error al obtener perfil', err)
    });
  }

  /*
    METODOS PARA OBTENER LO RELACIONADO CON USUARIO
  */

  // 1. Listar (GET)
  getUsuarios(): Observable<UsuarioItem[]> {
    return this.http.get<UsuarioItem[]>(
      `${this.apiUrl}/usuarios/listar/`,
      { headers: this.getAuthHeaders() }
    )
  }

  // 2. Crear (POST)
  crearUsuario(datos: FormData): Observable<any> {
    const url = `${this.apiUrl}/usuarios/crear/`;

    return this.http.post(url, datos);
  } 

  // 3. Eliminar (DELETE) CAMBIA EL ESTADO
  eliminarUsuario(rut: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/usuarios/${rut}/eliminar/`, 
      { headers: this.getAuthHeaders() }
    );
  }


  /*
    METODOS PARA OBTENER LO RELACIONADO CON BANNER
  */

  // 1. Listar (GET)
  getInicio(): Observable<CarruselItem[]> {
    return this.http.get<CarruselItem[]>(
      `${this.apiUrl}/usuarios/banners/listar/`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // 2. Crear (POST) - Usamos FormData porque hay subida de imágenes
  crearInicio(datos: FormData): Observable<any> {
    const url = `${this.apiUrl}/usuarios/banners/crear/`;
    
    return this.http.post(url, datos, { headers: this.getAuthHeaders() });
  }

  // 3. Eliminar (DELETE) - URL corregida según tu urls.py
  eliminarInicio(id_banner: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/usuarios/banners/${id_banner}/eliminar/`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // 4. Editar (PATCH) - Agregado para tu futura vista de edición
  editarInicio(id_banner: number, datos: any | FormData): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/usuarios/banners/${id_banner}/editar/`, 
      datos,
      { headers: this.getAuthHeaders() }
    );
  }
}