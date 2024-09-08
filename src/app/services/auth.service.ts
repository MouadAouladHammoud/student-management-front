import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8021/api/v1';

  constructor(private http: HttpClient, private router: Router) {}

  public login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/authenticate`, { email, password })
      .pipe(
        map((response) => {
          this.setTokens(response.access_token, response.refresh_token);
          return true;
        }),
        catchError((error) => {
          return of(false);
        })
      );
  }

  // Enregistrer les tokens dans le localStorage
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Récupérer le token d'accès
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Récupérer le token de rafraîchissement
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Rafraîchir le token d'accès
  refreshAccessToken(refreshToken: string): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/auth/refresh-token`,
        {}, // Pas de payload
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`, // Envoyer le refresh_token dans l'en-tête
          },
        }
      )
      .pipe(
        map((response) => {
          // Vérifie si la réponse contient les tokens attendus
          if (response && response.access_token && response.refresh_token) {
            return response; // Retourne la réponse si elle contient les tokens
          } else {
            throw new Error('No tokens found in the response');
          }
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split('.')[1])); // Décode le JWT pour obtenir les données
      return payload.role === role;
    }
    return false;
  }

  // Fonction pour extraire le 'subject' du JWT
  getSubjectFromToken(): string | null {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      // Séparez le JWT en ses trois parties (header, payload, signature)
      const payloadBase64 = token.split('.')[1];

      // Décodez la partie payload du JWT
      const payload = atob(payloadBase64);

      // Parsez le payload en objet JSON
      const parsedPayload = JSON.parse(payload);
      // Retournez le 'sub' (subject) du token
      return parsedPayload.sub;
    } catch (e) {
      console.error('Invalid JWT token:', e);
      return null;
    }
  }
}
