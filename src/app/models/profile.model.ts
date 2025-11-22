// src/app/models/profile.model.ts

export interface User {
  id: number;
  nom_complet: string;
  email: string;
  role: { id: number; nom_role: string } | string;
  departement?: {
    id: number;
    nom_departement: string;
  };
  statut?: string;
  photo_profil?: string;
  created_at?: string;
  updated_at?: string;
}

// ✅ Réponse pour les mises à jour de profil
export interface ProfileUpdateResponse {
  message: string;
  user: User;
}

// ✅ Réponse pour la suppression de photo
export interface PhotoDeleteResponse {
  message: string;
  user: User;
}

// ✅ Réponse pour changement de mot de passe
export interface PasswordChangeResponse {
  message: string;
}
