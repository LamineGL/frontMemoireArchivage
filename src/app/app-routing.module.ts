import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Admin Layout et Components
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { DashboardComponent as AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { UsersComponent } from './components/admin/users/users.component';
import { DepartementsComponent } from './components/admin/departements/departements.component';
import { DocumentsComponent as AdminDocumentsComponent } from './components/admin/documents/documents.component';
import { StatistiquesComponent as AdminStatistiquesComponent } from './components/admin/statistiques/statistiques.component';

// Chef Layout et Components
import { ChefLayoutComponent } from './components/layouts/chef-layout/chef-layout.component';
//import { DashboardComponent as ChefDashboardComponent } from './components/chef/dashboard/dashboard.component';
//import { DocumentsComponent as ChefDocumentsComponent } from './components/chef/documents/documents.component';
import { EmployesComponent } from './components/chef/employes/employes.component';
//import { StatistiquesComponent as ChefStatistiquesComponent, StatistiquesComponentChef } from './components/chef/statistiques/statistiques.component';

// Employé Layout et Components
import { EmployeLayoutComponent } from './components/layouts/employe-layout/employe-layout.component';
import { DashboardComponent as EmployeDashboardComponent } from './components/employe/dashboard/dashboard.component';
import { MesDocumentsComponent } from './components/employe/mes-documents/mes-documents.component';
import { AccesComponent } from './components/employe/acces/acces.component';
import { NotificationsComponent } from './components/employe/notifications/notifications.component';
import { ChefDocumentsComponent } from './components/chef/documents/documents.component';
import { ChefDashboardComponent } from './components/chef/dashboard/dashboard.component';
import { StatistiquesComponentChef } from './components/chef/statistiques/statistiques.component';
import { NotificationsComponentChef } from './components/chef/notifications/notifications.component';
import { NotificationsComponentAdmin } from './components/admin/notifications/notifications.component';
import { ProfileComponent } from './components/shared/profile/profile.component';

const routes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Authentification
  { path: 'login', component: LoginComponent },

  // Routes Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'departements', component: DepartementsComponent },
      { path: 'documents', component: AdminDocumentsComponent },
      { path: 'statistiques', component: AdminStatistiquesComponent },
       { path: 'notifications', component: NotificationsComponentAdmin },

      { path: 'profile', component: ProfileComponent }
    ]
  },

  // Routes Chef
  {
    path: 'chef',
    component: ChefLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Chef_Departement'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboardChef', component: ChefDashboardComponent},
      { path: 'documentsChef', component: ChefDocumentsComponent },
      { path: 'employes', component: EmployesComponent },
      { path: 'statistiques', component: StatistiquesComponentChef },
      { path: 'notifications', component: NotificationsComponentChef },

       { path: 'profile', component: ProfileComponent }
    ]
  },

  // Routes Employé
  {
    path: 'employe',
    component: EmployeLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employe'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmployeDashboardComponent },
      { path: 'mes-documents', component: MesDocumentsComponent },
      { path: 'acces', component: AccesComponent },
      { path: 'notifications', component: NotificationsComponent },

       { path: 'profile', component: ProfileComponent }
    ]
  },

  // Route 404
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
