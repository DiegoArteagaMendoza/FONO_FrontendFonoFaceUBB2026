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
  estado: boolean;
  is_staff?: boolean;
  // Rol máximo del sistema (superusuario de Django): exclusivo de SuperAdmin,
  // ver RolSistema y mapearRolAPermisos() más abajo.
  is_superuser?: boolean;
}

/**
 * Modelo de 3 roles del sistema, derivados de la combinación (is_staff,
 * is_superuser) que ya trae el backend — no es un campo nuevo en la BD, solo
 * una forma más clara de presentarlo y editarlo en el frontend:
 *   - 'usuario':    is_staff=false, is_superuser=false. Gestiona el contenido
 *                   público (información, cuidados, la voz, noticias, carrusel,
 *                   textos dinámicos).
 *   - 'admin':      is_staff=true,  is_superuser=false. Todo lo de 'usuario',
 *                   más el Portal Médico (acreditaciones, documentos,
 *                   especialidades). No administra otras cuentas.
 *   - 'superadmin': is_staff=true,  is_superuser=true.  Todo lo anterior, más
 *                   Gestión de Usuarios (crear/editar/activar cuentas y roles).
 */
export type RolSistema = 'usuario' | 'admin' | 'superadmin';

// 4. Interfaz Información General (Textos Dinámicos)
export interface InfoGeneralItem {
  id_info?: number;
  seccion: string;
  clave: string;
  titulo?: string;
  descripcion?: string;
  enlace?: string;
  estado?: boolean;
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

  /**
   * Igual que getAuthHeaders(), pero para endpoints que aceptan tanto peticiones
   * anónimas como autenticadas (ej: /usuarios/crear/, que es público para el
   * registro inicial del sistema, pero que además necesita saber si YA hay un
   * admin autenticado para poder respetar los permisos que este intente asignarle
   * al usuario nuevo). Si no hay sesión, no manda ningún header: mandar
   * "Bearer null" haría que el backend intente decodificarlo como JWT y falle
   * con 401, rompiendo el registro público.
   */
  private getAuthHeadersOpcional(): { headers: HttpHeaders } | Record<string, never> {
    const token = localStorage.getItem('access_token');
    if (!token) return {};
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  /** Traduce el rol elegido en el formulario a los flags que espera el backend. */
  mapearRolAPermisos(rol: RolSistema): { is_staff: boolean; is_superuser: boolean } {
    switch (rol) {
      case 'superadmin': return { is_staff: true, is_superuser: true };
      case 'admin': return { is_staff: true, is_superuser: false };
      default: return { is_staff: false, is_superuser: false };
    }
  }

  /** Inversa de mapearRolAPermisos(): deriva el rol a partir de un usuario ya cargado. */
  obtenerRolDeUsuario(usuario: { is_staff?: boolean; is_superuser?: boolean } | null | undefined): RolSistema {
    if (usuario?.is_superuser) return 'superadmin';
    if (usuario?.is_staff) return 'admin';
    return 'usuario';
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

  // 2. Crear (POST)
  crearUsuario(datos: any): Observable<any> {
    const url = `${this.apiUrl}/usuarios/crear/`;
    // Mandamos el token si hay sesión activa: así el backend sabe si quien crea
    // el usuario ya es administrador (is_staff) o superusuario, y respeta esos
    // permisos en la cuenta nueva. Si no hay sesión (registro público inicial),
    // no se manda header y el usuario nace sin esos permisos (ver usuarios_create).
    return this.http.post(url, datos, this.getAuthHeadersOpcional());
  }

  // 3. Eliminar (DELETE) CAMBIA EL ESTADO
  eliminarUsuario(rut: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/usuarios/${rut}/eliminar/`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // 4. Editar (PATCH)
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

  /*
    ===================================================
    MÉTODOS PARA INFORMACIÓN GENERAL (TEXTOS DINÁMICOS)
    ===================================================
  */

  // 1. Listar para Admin (GET) - Trae todos, incluyendo inactivos
  getInfoGeneralListarAdmin(): Observable<InfoGeneralItem[]> {
    return this.http.get<InfoGeneralItem[]>(
      `${this.apiUrl}/info-general/listar/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // 2. Crear (POST)
  crearInfoGeneral(datos: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/info-general/crear/`,
      datos,
      { headers: this.getAuthHeaders() }
    );
  }

  // 3. Editar (PATCH)
  editarInfoGeneral(id_info: number, datos: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/info-general/${id_info}/editar/`,
      datos,
      { headers: this.getAuthHeaders() }
    );
  }

  // 4. Eliminar (DELETE) - Borrado lógico
  eliminarInfoGeneral(id_info: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/info-general/${id_info}/eliminar/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // 5. Endpoint Público (GET) - Para que lo consuma el cliente sin token
  getInfoGeneralPublico(seccion?: string): Observable<InfoGeneralItem[]> {
    let url = `${this.apiUrl}/info-general/publico/`;
    if (seccion) {
      url += `?seccion=${seccion}`;
    }
    return this.http.get<InfoGeneralItem[]>(url); 
  }
}