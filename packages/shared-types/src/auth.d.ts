/** Public HTTP contracts only. Never expose database entities or secrets here. */
export interface AuthUser {
  onboardingState: "NEEDS_PROFILE" | "READY";
  player: PlayerIdentity | null;
  id: string;
  email: string;
  role: "PLAYER" | "ADMIN";
  profile: { id: string; displayName: string } | null;
  authMethods: { password: boolean; google: boolean };
}
export interface PlayerIdentity { id: string; playerName: string; avatarKey: string; onboardingCompletedAt: string }
export interface RegisterRequest { displayName?: string; email: string; password: string }
export interface LoginRequest { email: string; password: string }
export interface LinkGoogleRequest { password: string }
export interface AuthResponse { user: AuthUser }
export interface AuthProvidersResponse { password: boolean; google: boolean }
export interface GoogleLinkResponse { authorizationUrl: string }
export interface ApiErrorResponse { statusCode: number; message: string; code?: string }
