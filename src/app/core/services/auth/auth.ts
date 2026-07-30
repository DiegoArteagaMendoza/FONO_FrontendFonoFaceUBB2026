import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // <-- Importar entorno genérico
import { API_ENDPOINTS } from '../../constants/api.constants'; // <-- Importar constantes
import { CLAVE_TEMA } from '../tema/tema';

export interface LoginResponse {
  refresh: string;
  access: string;
  user: {
    nombre: string;
    email: string;
    rut: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Construimos la URL combinando la base del entorno y el endpoint centralizado
  private loginUrl = `${environment.apiUrl}${API_ENDPOINTS.auth.login}`;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials);
  }

  setSession(authResult: LoginResponse): void {
    localStorage.setItem('access_token', authResult.access);
    localStorage.setItem('refresh_token', authResult.refresh);
    localStorage.setItem('user_data', JSON.stringify(authResult.user));
  }
// En core/services/auth/auth.service.ts

logout() {
  // 1. Borra los tokens específicos
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  // 2. Borra cualquier dato del usuario guardado
  localStorage.removeItem('user_data');

  // 3. Limpia TODO el localStorage por seguridad.
  //    La preferencia de tema no es un dato de sesión, así que la conservamos
  //    para que al cerrar sesión no se pierda el modo claro/oscuro elegido.
  const temaGuardado = localStorage.getItem(CLAVE_TEMA);
  localStorage.clear();
  if (temaGuardado) {
    localStorage.setItem(CLAVE_TEMA, temaGuardado);
  }

  // 4. Limpia el sessionStorage por si acaso
  sessionStorage.clear();

  // 5. Si usas cookies, deberías borrarlas aquí también
  // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
}