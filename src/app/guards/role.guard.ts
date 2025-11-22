import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRole = this.authService.getUserRole();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRoles && expectedRoles.includes(userRole)) {
      return true;
    }

    // Rediriger vers le dashboard approprié
    this.redirectToDashboard(userRole);
    return false;
  }

  private redirectToDashboard(role: string): void {
    switch(role) {
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Chef_Departement':
        this.router.navigate(['/chef/dashboardChef']);
        break;
      case 'Employe':
        this.router.navigate(['/employe/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
