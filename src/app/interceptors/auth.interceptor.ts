import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false; // Indicateur pour vérifier si le rafraîchissement est en cours
  private refreshTokenSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null); // Stocke le nouveau token

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const accessToken = this.authService.getAccessToken();

    // Vérifie si la requête est une requête de rafraîchissement de token
    if (request.url.includes('/auth/refresh-token')) {
      // Ne pas ajouter l'en-tête Authorization pour la requête de rafraîchissement de token
      return next.handle(request);
    }

    // Ajouter le token d'accès à l'en-tête de la requête
    if (accessToken) {
      request = this.addToken(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Adapter le code pour gérer à la fois les erreurs 401 et 403
        if (
          (error.status === 401 || error.status === 403) &&
          !this.isRefreshing
        ) {
          // Gérer l'erreur 401 ou 403 (token expiré ou accès interdit)
          return this.handle401Error(request, next);
        } else if (
          (error.status === 401 || error.status === 403) &&
          this.isRefreshing
        ) {
          // Si le rafraîchissement est en cours, attendre que le nouveau token soit disponible
          return this.waitForNewToken(request, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  // Ajouter le token d'accès à l'en-tête de la requête
  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Gérer les erreurs 401 et 403 (token expiré ou accès interdit)
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Réinitialiser le subject

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshAccessToken(refreshToken).pipe(
          switchMap((response: any) => {
            // Vérifiez si la réponse contient les tokens attendus
            if (response && response.access_token && response.refresh_token) {
              this.isRefreshing = false;
              this.authService.setTokens(
                response.access_token,
                response.refresh_token
              ); // Enregistrer les nouveaux tokens
              this.refreshTokenSubject.next(response.access_token); // Mettre à jour le subject avec le nouveau token

              return next.handle(this.addToken(request, response.access_token)); // Refaire la requête initiale avec le nouveau token
            } else {
              // Si les tokens ne sont pas présents dans la réponse, lever une erreur
              this.isRefreshing = false;
              this.authService.logout(); // Déconnecter l'utilisateur
              return throwError(
                () =>
                  new Error('Tokens are missing in the refresh token response')
              );
            }
          }),
          catchError((err) => {
            console.error('Refresh token failed:', err);
            this.isRefreshing = false;
            this.authService.logout(); // Déconnecter l'utilisateur en cas d'échec
            return throwError(err);
          })
        );
      } else {
        console.warn('No refresh token available, logging out.');
        this.authService.logout();
      }
    }

    return this.waitForNewToken(request, next);
  }

  // Attendre que le nouveau token soit disponible avant de relancer la requête
  private waitForNewToken(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.refreshTokenSubject.pipe(
      filter((token) => token != null), // Filtrer pour attendre que le token soit non null
      take(1), // Prendre une seule valeur
      switchMap((token) => next.handle(this.addToken(request, token!))) // Relancer la requête initiale avec le nouveau token
    );
  }
}
