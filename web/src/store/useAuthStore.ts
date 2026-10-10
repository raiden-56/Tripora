import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { AuthUser } from "../types";
import * as authApi from "../api/auth.api";
import * as usersApi from "../api/users.api";
import { registerAuthHandlers, setAccessToken } from "../api/client";
import { useAppStore } from "./useAppStore";

const DEMO_EMAIL = "demo@traveldiaries.com";
const DEMO_PASSWORD = "Travel@123";
const STORAGE_KEY = "tc-auth";

interface AuthState {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  onboardingCompleted: boolean;
  currentUser: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** When false the session lives in sessionStorage and ends with the tab. */
  rememberMe: boolean;

  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
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
  startDemo: () => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: () => void;
  logout: () => void;
}

const avatar = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

function toAuthUser(user: authApi.BackendUser): AuthUser {
  return { name: user.name, email: user.email, avatarUrl: avatar(user.email) };
}

/** Reads from whichever storage holds the session; writes to the one chosen by "Remember me". */
const sessionAwareStorage: StateStorage = {
  getItem: (name) => sessionStorage.getItem(name) ?? localStorage.getItem(name),
  setItem: (name, value) => {
    const remember = (JSON.parse(value) as { state?: { rememberMe?: boolean } }).state?.rememberMe ?? true;
    (remember ? localStorage : sessionStorage).setItem(name, value);
    (remember ? sessionStorage : localStorage).removeItem(name);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

async function onboardingDone(): Promise<boolean> {
  try {
    return (await usersApi.getMyProfile()).onboarding_completed;
  } catch {
    return true; // don't trap a returning user in onboarding over a transient error
  }
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
      rememberMe: true,

      login: async (email, password, rememberMe = true) => {
        try {
          const response = await authApi.login(email, password);
          setAccessToken(response.access_token);
          const onboarded = await onboardingDone();
          set({
            isAuthenticated: true,
            isDemoMode: false,
            onboardingCompleted: onboarded,
            currentUser: toAuthUser(response.user),
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            rememberMe,
          });
          return { success: true };
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Invalid email or password.";
          return { success: false, error: message };
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
            rememberMe: true,
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
        const result = await get().login(DEMO_EMAIL, DEMO_PASSWORD, false);
        if (result.success) set({ isDemoMode: true });
        return result;
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
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionAwareStorage),
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        isDemoMode: s.isDemoMode,
        onboardingCompleted: s.onboardingCompleted,
        currentUser: s.currentUser,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        rememberMe: s.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) setAccessToken(state.accessToken);
      },
    },
  ),
);

// Keep tabs in step: when another tab refreshes or logs out, adopt its tokens instead
// of later trying a refresh token that tab already rotated (which would log us out).
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) useAuthStore.persist.rehydrate();
  });
}

registerAuthHandlers({
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onTokenRefreshed: (tokens) =>
    useAuthStore.setState({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      currentUser: toAuthUser(tokens.user),
    }),
  onAuthExpired: () => {
    // Another tab may have rotated the refresh token a moment ago; only log out if
    // storage doesn't hold a newer session.
    const used = useAuthStore.getState().refreshToken;
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      const { refreshToken, accessToken } = useAuthStore.getState();
      if (refreshToken && refreshToken !== used && accessToken) {
        setAccessToken(accessToken);
        return;
      }
      useAuthStore.getState().logout();
    });
  },
});
