export interface TokenResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  nom_complet: string;
  email: string;
  role: string;
  departement: string;
}
