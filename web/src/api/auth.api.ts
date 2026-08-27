import { apiRequest } from "./client";

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: "USER" | "GUIDE" | "ADMIN";
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: BackendUser;
}

export function login(email: string, password: string) {
  return apiRequest<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function signup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  return apiRequest<TokenResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: { first_name: firstName, last_name: lastName, email, password },
    auth: false,
  });
}

export function refresh(refreshToken: string) {
  return apiRequest<TokenResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
    auth: false,
  });
}

export function logout(refreshToken: string) {
  return apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
    auth: false,
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}
