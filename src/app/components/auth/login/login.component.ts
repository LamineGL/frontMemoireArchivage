import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginResponse } from '../../../services/auth.service';


// Interface pour typer la réponse de l'API
// interface LoginResponse {
//   message: string;
//   user: {
//     id: number;
//     nom_complet: string;
//     email: string;
//     role: {
//       id: number;
//       nom_role: string;
//     } | string;
//     departement?: {
//       id: number;
//       nom_departement: string;
//     };
//     statut: string;
//     photo_url?: string;
//   };
//   access_token: string;
//   token_type: string;
// }

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  returnUrl = '';
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialisation du formulaire
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // ✅ Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      console.log('✅ Utilisateur déjà connecté, redirection...');
      this.redirectByRole(this.authService.getUserRole());
    }
  }

  ngOnInit(): void {
    // Récupérer l'URL de retour depuis les query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    console.log('🔗 URL de retour:', this.returnUrl);
  }

  // Getter pour accéder facilement aux contrôles du formulaire
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Soumission du formulaire de connexion
   */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Vérifier si le formulaire est valide
    if (this.loginForm.invalid) {
      console.warn('⚠️ Formulaire invalide');
      return;
    }

    this.loading = true;
    console.log('🔄 Tentative de connexion...');

    // Appel à l'API de connexion
    this.authService.login(this.loginForm.value).subscribe({
      next: (response: LoginResponse) => {
        console.log('✅ Connexion réussie:', response);

        // ✅ Extraire le nom du rôle (gère les 2 cas : objet ou string)
        let roleName: string;

        if (typeof response.user.role === 'string') {
          // Si role est déjà une string
          roleName = response.user.role;
        } else {
          // Si role est un objet avec nom_role
          roleName = response.user.role?.nom_role || '';
        }

        console.log('👤 Rôle détecté:', roleName);
        console.log('📧 Email:', response.user.email);
        console.log('👨 Utilisateur:', response.user.nom_complet);

        // Rediriger selon le rôle
        this.redirectByRole(roleName);
      },
      error: (error) => {
        console.error('❌ Erreur de connexion:', error);

        // Gérer les différents types d'erreurs
        if (error.status === 403) {
          this.errorMessage = 'Votre compte est inactif. Contactez un administrateur.';
        } else if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else {
          this.errorMessage = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        }

        this.loading = false;
      },
      complete: () => {
        console.log('✅ Requête de connexion terminée');
      }
    });
  }

  /**
   * Redirection selon le rôle de l'utilisateur
   */
  private redirectByRole(role: string): void {
    console.log('🔄 Redirection pour le rôle:', role);

    // Si une URL de retour existe, y rediriger
    if (this.returnUrl) {
      console.log('➡️ Redirection vers URL de retour:', this.returnUrl);
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // Redirection selon le rôle
    switch(role) {
      case 'Admin':
        console.log('➡️ Redirection vers /admin/dashboard');
        this.router.navigate(['/admin/dashboard']);
        break;

      case 'Chef_Departement':
        console.log('➡️ Redirection vers /chef/dashboard');
        this.router.navigate(['/chef/dashboardChef']);
        break;

      case 'Employe':
        console.log('➡️ Redirection vers /employe/dashboard');
        this.router.navigate(['/employe/dashboard']);
        break;

      default:
        console.warn('⚠️ Rôle inconnu:', role);
        this.errorMessage = 'Rôle utilisateur non reconnu. Contactez un administrateur.';

        // ✅ Déconnecter l'utilisateur si le rôle est invalide
        this.authService.clearAuth();
        this.loading = false;
    }
  }

  /**
   * Afficher/Masquer le mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
