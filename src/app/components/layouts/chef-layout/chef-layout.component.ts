import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User  } from '../../../services/auth.service';

@Component({
  selector: 'app-chef-layout',
  templateUrl: './chef-layout.component.html',
  styleUrls: ['./chef-layout.component.css']
})
export class ChefLayoutComponent implements OnInit {
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
}
