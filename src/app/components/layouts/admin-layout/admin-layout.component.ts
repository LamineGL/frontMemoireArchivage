import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService,User } from '../../../services/auth.service';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  currentUser: User | null = null;
  sidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          this.authService.clearAuth();
          this.router.navigate(['/login']);
        }
      });
    }
  }

  getUserRole(user: User | null): string {
    if (!user || !user.role) return '';
    return typeof user.role === 'string'
      ? user.role
      : user.role.nom_role;
  }
}
