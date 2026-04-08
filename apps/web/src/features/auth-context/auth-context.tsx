import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { UserRole } from "@forum-reddit/shared-types";

const STORAGE_KEY = "forum-reddit.dev-auth";

type AuthSession = {
  userId: string;
  role: UserRole;
};

type AuthSessionContextValue = {
  auth: AuthSession;
  isAuthenticated: boolean;
  headers: Record<string, string>;
  setUserId: (userId: string) => void;
  setRole: (role: UserRole) => void;
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
  const [auth, setAuth] = useState<AuthSession>(() => parseStoredAuthSession());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const setUserId = useCallback((userId: string) => {
    setAuth((previous) => ({
      ...previous,
      userId: userId.trim(),
    }));
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setAuth((previous) => ({
      ...previous,
      role,
    }));
  }, []);

  const reset = useCallback(() => {
    setAuth(DEFAULT_AUTH_SESSION);
  }, []);

  const isAuthenticated = auth.userId.length > 0;

  const headers = useMemo<Record<string, string>>(() => {
    const nextHeaders: Record<string, string> = {};

    if (isAuthenticated) {
      nextHeaders["x-user-id"] = auth.userId;
      nextHeaders["x-user-role"] = auth.role;
    }

    return nextHeaders;
  }, [auth.role, auth.userId, isAuthenticated]);

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated,
      headers,
      setRole,
      setUserId,
      reset,
    }),
    [auth, headers, isAuthenticated, reset, setRole, setUserId],
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