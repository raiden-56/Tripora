import { create } from "zustand";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
}

interface ConfirmState {
  open: ConfirmOptions | null;
  resolve: ((ok: boolean) => void) | null;
  ask: (options: ConfirmOptions) => Promise<boolean>;
  settle: (ok: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: null,
  resolve: null,
  ask: (options) =>
    new Promise<boolean>((resolve) => {
      get().resolve?.(false); // a newer question cancels an unanswered one
      set({ open: options, resolve });
    }),
  settle: (ok) => {
    get().resolve?.(ok);
    set({ open: null, resolve: null });
  },
}));

/** `if (await confirmAction({ title: "Delete trip?", danger: true })) ...` */
export const confirmAction = (options: ConfirmOptions) =>
  useConfirmStore.getState().ask(options);
