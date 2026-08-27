import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types";
import * as authApi from "../api/auth.api";
import { setAccessToken } from "../api/client";
import { useAppStore } from "./useAppStore";

const DEMO_EMAIL = "demo@traveldiaries.com";
const DEMO_PASSWORD = "Travel@123";

interface AuthState {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  onboardingCompleted: boolean;
  currentUser: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  requestPasswordReset: (email: string) => Promise<string>;
  startDemo: () => Promise<void>;
  completeOnboarding: () => void;
  logout: () => void;
}

const avatar = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

function toAuthUser(user: authApi.BackendUser): AuthUser {
  return { name: user.name, email: user.email, avatarUrl: avatar(user.email) };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isDemoMode: false,
      onboardingCompleted: false,
      currentUser: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        try {
          const response = await authApi.login(email, password);
          setAccessToken(response.access_token);
          set({
            isAuthenticated: true,
            isDemoMode: false,
            onboardingCompleted: true,
            currentUser: toAuthUser(response.user),
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          });
          return { success: true };
        } catch {
          return { success: false, error: "Invalid email or password." };
        }
      },

      signup: async ({ firstName, lastName, email, password }) => {
        try {
          const response = await authApi.signup(
            firstName,
            lastName,
            email,
            password,
          );
          setAccessToken(response.access_token);
          set({
            isAuthenticated: true,
            isDemoMode: false,
            onboardingCompleted: false,
            currentUser: toAuthUser(response.user),
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          });
          return { success: true };
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Could not create your account.";
          return { success: false, error: message };
        }
      },

      requestPasswordReset: async (email) => {
        const response = await authApi.forgotPassword(email);
        return response.message;
      },

      startDemo: async () => {
        const result = await get().login(DEMO_EMAIL, DEMO_PASSWORD);
        if (result.success) set({ isDemoMode: true });
      },

      completeOnboarding: () => set({ onboardingCompleted: true }),

      logout: () => {
        const { refreshToken } = get();
        if (refreshToken) authApi.logout(refreshToken).catch(() => {});
        setAccessToken(null);
        set({
          isAuthenticated: false,
          isDemoMode: false,
          onboardingCompleted: false,
          currentUser: null,
          accessToken: null,
          refreshToken: null,
        });
        useAppStore.getState().resetData();
      },
    }),
    {
      name: "tc-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) setAccessToken(state.accessToken);
      },
    },
  ),
);
