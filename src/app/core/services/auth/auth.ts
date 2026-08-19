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

  /**
   * True si hay sesión de administrador de FonoApp iniciada en este navegador.
   * Equivalente a estaAutenticadoComoProfesional() de PortalMedicoService y a
   * estaAutenticadoComoCliente() de PmClienteService, para las otras dos identidades.
   */
  estaAutenticado(): boolean {
    return !!localStorage.getItem('access_token');
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
  //    La sesión del profesional del Portal Médico (pm_*) tampoco es un dato de
  //    ESTA sesión: es una identidad totalmente distinta (ver PortalMedicoService)
  //    que puede seguir activa en otra pestaña, así que también se conserva.
  //    Lo mismo vale para la sesión del paciente (pmc_*): es una tercera
  //    identidad independiente (ver PmClienteService).
  const temaGuardado = localStorage.getItem(CLAVE_TEMA);
  const clavesAPreservar = [
    'pm_access_token', 'pm_refresh_token', 'pm_profesional_data',
    'pmc_access_token', 'pmc_refresh_token', 'pmc_cliente_data',
  ];
  const preservados = clavesAPreservar
    .map(clave => [clave, localStorage.getItem(clave)] as const)
    .filter(([, valor]) => valor !== null);

  localStorage.clear();

  if (temaGuardado) {
    localStorage.setItem(CLAVE_TEMA, temaGuardado);
  }
  preservados.forEach(([clave, valor]) => localStorage.setItem(clave, valor as string));

  // 4. Limpia el sessionStorage por si acaso
  sessionStorage.clear();

  // 5. Si usas cookies, deberías borrarlas aquí también
  // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
}