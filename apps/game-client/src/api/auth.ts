import type {
  AuthResponse,
  AuthProvidersResponse,
  RegisterRequest,
  LoginRequest,
  GoogleLinkResponse,
} from "@gemora/shared-types";
import { request } from "./http";

export const auth = {
  providers: () => request<AuthProvidersResponse>("/auth/providers"),
  me: () => request<AuthResponse>("/auth/me"),
  register: (body: RegisterRequest) =>
    request<AuthResponse>("/auth/register", body),
  login: (body: LoginRequest) => request<AuthResponse>("/auth/login", body),
  logout: () => request<void>("/auth/logout", {}),
  linkGoogle: (password: string) =>
    request<GoogleLinkResponse>("/auth/google/link", { password }),
};
