import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types";

export interface DemoCredential {
  email: string;
  password: string;
  name: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: "demo@travelcanvas.com",
    password: "Travel@123",
    name: "Demo Traveler",
  },
  { email: "ganesh@travelcanvas.com", password: "Ganesh@123", name: "Ganesh" },
];

interface AuthState {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  onboardingCompleted: boolean;
  currentUser: AuthUser | null;

  login: (
    email: string,
    password: string,
  ) => { success: boolean; error?: string };
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
  }) => void;
  requestPasswordReset: (email: string) => string;
  startDemo: () => void;
  completeOnboarding: () => void;
  logout: () => void;
}

const avatar = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isDemoMode: false,
      onboardingCompleted: false,
      currentUser: null,

      login: (email, password) => {
        const match = DEMO_CREDENTIALS.find(
          (c) =>
            c.email.toLowerCase() === email.trim().toLowerCase() &&
            c.password === password,
        );
        if (!match) {
          return { success: false, error: "Invalid email or password." };
        }
        set({
          isAuthenticated: true,
          isDemoMode: false,
          onboardingCompleted: true,
          currentUser: {
            name: match.name,
            email: match.email,
            avatarUrl: avatar(match.email),
          },
        });
        return { success: true };
      },

      signup: ({ firstName, lastName, email }) => {
        set({
          isAuthenticated: true,
          isDemoMode: false,
          onboardingCompleted: false,
          currentUser: {
            name: `${firstName} ${lastName}`.trim(),
            email,
            avatarUrl: avatar(email),
          },
        });
      },

      requestPasswordReset: () =>
        "If this email exists, a password reset link has been sent.",

      startDemo: () =>
        set({
          isAuthenticated: true,
          isDemoMode: true,
          onboardingCompleted: true,
          currentUser: {
            name: "Ganesh",
            email: "ganesh@travelcanvas.com",
            avatarUrl: avatar("ganesh"),
          },
        }),

      completeOnboarding: () => set({ onboardingCompleted: true }),

      logout: () =>
        set({
          isAuthenticated: false,
          isDemoMode: false,
          onboardingCompleted: false,
          currentUser: null,
        }),
    }),
    { name: "tc-auth" },
  ),
);
