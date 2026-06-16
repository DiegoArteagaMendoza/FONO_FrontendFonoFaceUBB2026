import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // <-- Importar entorno genérico
import { API_ENDPOINTS } from '../../constants/api.constants'; // <-- Importar constantes

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

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }
}