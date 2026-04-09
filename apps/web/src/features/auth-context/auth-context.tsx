import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "@forum-reddit/shared-types";

import { AppApiError } from "../../shared/api/http-client";
import { PUBLIC_VIEWER_KEY, toViewerKey } from "../../shared/api/query-keys";

const STORAGE_KEY = "forum-reddit.dev-auth";

type AuthSession = {
  userId: string;
  role: UserRole;
};

type AuthSessionContextValue = {
  auth: AuthSession;
  isAuthenticated: boolean;
  hasActiveSession: boolean;
  isSessionLoading: boolean;
  sessionError: string | null;
  sessionStatus: "public" | "checking" | "valid" | "invalid";
  viewerId: string | undefined;
  headers: Record<string, string>;
  setUserId: (userId: string) => void;
  setRole: (role: UserRole) => void;
  applyPreset: (userId: string, role: UserRole) => void;
  reset: () => void;
};

const DEFAULT_AUTH_SESSION: AuthSession = {
  userId: "",
  role: "user",
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

function isUserRole(value: unknown): value is UserRole {
  return value === "user" || value === "moderator" || value === "admin";
}

function parseStoredAuthSession(): AuthSession {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_SESSION;
  }

  const rawStoredSession = window.localStorage.getItem(STORAGE_KEY);
  if (!rawStoredSession) {
    return DEFAULT_AUTH_SESSION;
  }

  try {
    const parsed = JSON.parse(rawStoredSession) as Partial<AuthSession>;
    const role = isUserRole(parsed.role) ? parsed.role : DEFAULT_AUTH_SESSION.role;
    const userId = typeof parsed.userId === "string" ? parsed.userId.trim() : "";

    return {
      userId,
      role,
    };
  } catch {
    return DEFAULT_AUTH_SESSION;
  }
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<AuthSession>(() => parseStoredAuthSession());
  const [sessionStatus, setSessionStatus] = useState<"public" | "checking" | "valid" | "invalid">(
    auth.userId ? "checking" : "public",
  );
  const [sessionError, setSessionError] = useState<string | null>(null);
  const previousAuthRef = useRef<AuthSession | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    if (!auth.userId) {
      setSessionStatus("public");
      setSessionError(null);
      return;
    }

    const controller = new AbortController();

    async function validateCurrentUser() {
      setSessionStatus("checking");
      setSessionError(null);

      try {
        const response = await fetch("/api/me", {
          method: "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "x-user-id": auth.userId,
            "x-user-role": auth.role,
          },
        });

        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        if (!response.ok) {
          throw new AppApiError({
            status: response.status,
            code: "SESSION_INVALID",
            message: payload?.message ?? "Sessao invalida para o usuario informado.",
          });
        }

        setSessionStatus("valid");
        setSessionError(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSessionStatus("invalid");
        setSessionError(
          error instanceof AppApiError
            ? error.message
            : "Nao foi possivel validar a sessao informada.",
        );
      }
    }

    void validateCurrentUser();

    return () => controller.abort();
  }, [auth.role, auth.userId]);

  useEffect(() => {
    const previousAuth = previousAuthRef.current;
    previousAuthRef.current = auth;

    if (!previousAuth) {
      return;
    }

    if (previousAuth.userId !== auth.userId) {
      const previousViewerKey = toViewerKey(previousAuth.userId);

      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey.some((part) => part === previousViewerKey) ||
          (previousViewerKey === PUBLIC_VIEWER_KEY && query.queryKey.some((part) => part === PUBLIC_VIEWER_KEY)),
      });
      return;
    }

    if (previousAuth.role !== auth.role && auth.userId) {
      queryClient.invalidateQueries({
        queryKey: ["platform", "me", auth.userId],
      });
    }
  }, [auth, queryClient]);

  const setUserId = useCallback((userId: string) => {
    const nextUserId = userId.trim();

    setSessionStatus(nextUserId ? "checking" : "public");
    setSessionError(null);

    setAuth((previous) => ({
      ...previous,
      userId: nextUserId,
    }));
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setSessionStatus((previousStatus) => (auth.userId ? "checking" : previousStatus));
    setSessionError(null);

    setAuth((previous) => ({
      ...previous,
      role,
    }));
  }, [auth.userId]);

  const applyPreset = useCallback((userId: string, role: UserRole) => {
    const nextUserId = userId.trim();

    setSessionStatus(nextUserId ? "checking" : "public");
    setSessionError(null);

    setAuth({
      userId: nextUserId,
      role,
    });
  }, []);

  const reset = useCallback(() => {
    setSessionStatus("public");
    setSessionError(null);
    setAuth(DEFAULT_AUTH_SESSION);
  }, []);

  const isAuthenticated = auth.userId.length > 0;
  const hasActiveSession = sessionStatus === "valid";
  const isSessionLoading = sessionStatus === "checking";
  const viewerId = hasActiveSession ? auth.userId : undefined;

  const headers = useMemo<Record<string, string>>(() => {
    const nextHeaders: Record<string, string> = {};

    if (hasActiveSession) {
      nextHeaders["x-user-id"] = auth.userId;
      nextHeaders["x-user-role"] = auth.role;
    }

    return nextHeaders;
  }, [auth.role, auth.userId, hasActiveSession]);

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated,
      hasActiveSession,
      isSessionLoading,
      sessionError,
      sessionStatus,
      viewerId,
      headers,
      applyPreset,
      setRole,
      setUserId,
      reset,
    }),
    [
      auth,
      headers,
      isAuthenticated,
      hasActiveSession,
      isSessionLoading,
      sessionError,
      sessionStatus,
      viewerId,
      applyPreset,
      reset,
      setRole,
      setUserId,
    ],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used inside AuthSessionProvider.");
  }

  return context;
}
