"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getCurrentSession,
  signInWithPassword,
  signOutCurrentUser,
  signUpWithPassword,
  subscribeToAuthStateChanges,
} from "@/lib/supabase/auth";

type UseAuthSessionState = {
  errorMessage: string | null;
  infoMessage: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  session: Session | null;
  user: User | null;
};

type Credentials = {
  email: string;
  password: string;
};

function createDefaultState(): UseAuthSessionState {
  return {
    errorMessage: null,
    infoMessage: null,
    isLoading: true,
    isSubmitting: false,
    session: null,
    user: null,
  };
}

export function useAuthSession() {
  const [state, setState] = useState<UseAuthSessionState>(() => createDefaultState());

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const session = await getCurrentSession();

      if (cancelled) {
        return;
      }

      setState((currentState) => ({
        ...currentState,
        isLoading: false,
        session,
        user: session?.user ?? null,
      }));
    }

    void loadSession();

    const unsubscribe = subscribeToAuthStateChanges((session) => {
      if (cancelled) {
        return;
      }

      setState((currentState) => ({
        ...currentState,
        errorMessage: null,
        infoMessage: null,
        isLoading: false,
        session,
        user: session?.user ?? null,
      }));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function createAccount(credentials: Credentials) {
    setState((currentState) => ({
      ...currentState,
      errorMessage: null,
      infoMessage: null,
      isSubmitting: true,
    }));

    try {
      const emailRedirectTo =
        typeof window === "undefined" ? undefined : window.location.origin;

      if (!emailRedirectTo) {
        throw new Error("Email confirmation is only available in the browser.");
      }

      await signUpWithPassword(credentials, emailRedirectTo);

      setState((currentState) => ({
        ...currentState,
        errorMessage: null,
        infoMessage: "Check your email to confirm your account before signing in.",
        isSubmitting: false,
      }));
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        errorMessage:
          error instanceof Error ? error.message : "Account creation failed.",
        infoMessage: null,
        isSubmitting: false,
      }));
    }
  }

  async function signIn(credentials: Credentials) {
    setState((currentState) => ({
      ...currentState,
      errorMessage: null,
      infoMessage: null,
      isSubmitting: true,
    }));

    try {
      await signInWithPassword(credentials);
      setState((currentState) => ({
        ...currentState,
        errorMessage: null,
        infoMessage: null,
        isSubmitting: false,
      }));
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        errorMessage:
          error instanceof Error ? error.message : "Sign in failed.",
        infoMessage: null,
        isSubmitting: false,
      }));
    }
  }

  async function signOut() {
    setState((currentState) => ({
      ...currentState,
      errorMessage: null,
      infoMessage: null,
      isSubmitting: true,
    }));

    try {
      await signOutCurrentUser();
      setState((currentState) => ({
        ...currentState,
        errorMessage: null,
        infoMessage: "Signed out. Local capture stays available.",
        isSubmitting: false,
      }));
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        errorMessage:
          error instanceof Error ? error.message : "Sign out failed.",
        infoMessage: null,
        isSubmitting: false,
      }));
    }
  }

  return {
    ...state,
    createAccount,
    hasSession: Boolean(state.session),
    signIn,
    signOut,
  };
}
