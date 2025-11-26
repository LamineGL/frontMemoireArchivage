import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Auth Components
import { LoginComponent } from './components/auth/login/login.component';

// Admin Components
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { DashboardComponent as AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { UsersComponent } from './components/admin/users/users.component';
import { DepartementsComponent } from './components/admin/departements/departements.component';
import { DocumentsComponent as AdminDocumentsComponent, DocumentsComponent } from './components/admin/documents/documents.component';
import { StatistiquesComponent as AdminStatistiquesComponent } from './components/admin/statistiques/statistiques.component';

// Chef Components
import { ChefLayoutComponent } from './components/layouts/chef-layout/chef-layout.component';
//import { DashboardComponent as ChefDashboardComponent } from './components/chef/dashboard/dashboard.component';

import { EmployesComponent } from './components/chef/employes/employes.component';
import { StatistiquesComponentChef } from './components/chef/statistiques/statistiques.component';

// Employé Components
import { EmployeLayoutComponent } from './components/layouts/employe-layout/employe-layout.component';
import { DashboardComponent as EmployeDashboardComponent } from './components/employe/dashboard/dashboard.component';
import { MesDocumentsComponent } from './components/employe/mes-documents/mes-documents.component';
import { AccesComponent } from './components/employe/acces/acces.component';
import { NotificationsComponent } from './components/employe/notifications/notifications.component';
import { ChefDocumentsComponent } from './components/chef/documents/documents.component';
import { ChefDashboardComponent } from './components/chef/dashboard/dashboard.component';
import { NotificationsComponentChef } from './components/chef/notifications/notifications.component';
import { NotificationsComponentAdmin } from './components/admin/notifications/notifications.component';
import { ProfileComponent } from './components/shared/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,

    // Auth
    LoginComponent,

    //Profil
    ProfileComponent,

    // Admin
    AdminLayoutComponent,
    AdminDashboardComponent,
    UsersComponent,
    DepartementsComponent,
    AdminDocumentsComponent,
    AdminStatistiquesComponent,
    DocumentsComponent,
    NotificationsComponentAdmin,

    // Chef
    ChefLayoutComponent,
    ChefDashboardComponent,
    ChefDocumentsComponent,
    EmployesComponent,
    //ChefStatistiquesComponent,
    ChefDashboardComponent,
    StatistiquesComponentChef,
    NotificationsComponentChef,

    // Employé
    EmployeLayoutComponent,
    EmployeDashboardComponent,
    MesDocumentsComponent,
    AccesComponent,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
