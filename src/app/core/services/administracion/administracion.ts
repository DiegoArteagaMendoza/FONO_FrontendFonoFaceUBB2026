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
  id_banner?: number; 
  id?: number;        
  titulo: string;
  descripcion: string;
  imagenes: ImagenBanner[]; 
  fecha_creacion?: string;
  estado?: boolean;
}

// 3. Interfaz usuarios
export interface UsuarioItem {
  id_usuario?: number;
  nombre: string;
  rut: string;
  email: string;
  estado?: boolean;     // Agregado para leerlo en el componente de edición
  is_staff?: boolean;   // Agregado para leerlo en el componente de edición
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
    ===================================================
    METODOS PARA OBTENER LO RELACIONADO CON USUARIO
    ===================================================
  */

  // 1. Listar (GET)
  getUsuarios(): Observable<UsuarioItem[]> {
    return this.http.get<UsuarioItem[]>(
      `${this.apiUrl}/usuarios/listar/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // 2. Crear (POST) - En tu componente vimos que envías JSON, si cambiaste a FormData mantenlo así
  crearUsuario(datos: any): Observable<any> {
    const url = `${this.apiUrl}/usuarios/crear/`;
    // Nota: El login original tuyo no pedía token para crear (AllowAny), pero si lo cambiaste, agrega el header
    return this.http.post(url, datos);
  } 

  // 3. Eliminar (DELETE) CAMBIA EL ESTADO
  eliminarUsuario(rut: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/usuarios/${rut}/eliminar/`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // 4. Editar (PATCH) - Actualiza contraseña, estado o is_staff
  editarUsuario(rut: string, datos: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/usuarios/${rut}/editar/`, 
      datos,
      { headers: this.getAuthHeaders() }
    );
  }

  /*
    ===================================================
    METODOS PARA OBTENER LO RELACIONADO CON BANNER
    ===================================================
  */

  // 1. Listar (GET)
  getInicio(): Observable<CarruselItem[]> {
    return this.http.get<CarruselItem[]>(
      `${this.apiUrl}/usuarios/banners/listar/`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // 2. Crear (POST)
  crearInicio(datos: FormData): Observable<any> {
    const url = `${this.apiUrl}/usuarios/banners/crear/`;
    return this.http.post(url, datos, { headers: this.getAuthHeaders() });
  }

  // 3. Eliminar (DELETE)
  eliminarInicio(id_banner: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/usuarios/banners/${id_banner}/eliminar/`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // 4. Editar (PATCH)
  editarInicio(id_banner: number, datos: any | FormData): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/usuarios/banners/${id_banner}/editar/`, 
      datos,
      { headers: this.getAuthHeaders() }
    );
  }
}