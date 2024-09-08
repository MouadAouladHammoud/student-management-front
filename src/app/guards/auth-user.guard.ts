import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthUserGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRoles = route.data['roles'] as Array<string>; // Récupère les rôles attendus définis dans la route
    if (this.authService.isAuthenticated() && this.hasRole(expectedRoles)) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  // Vérifier si l'utilisateur a l'un des rôles requis
  private hasRole(expectedRoles: Array<string>): boolean {
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return expectedRoles.includes(payload.role); // Vérifier si le rôle de l'utilisateur est dans les rôles attendus
    }
    return false;
  }
}
