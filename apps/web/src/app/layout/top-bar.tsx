import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";

import type { UserRole } from "@forum-reddit/shared-types";

import { useAuthSession } from "../../features/auth-context/auth-context";
import { queryKeys } from "../../shared/api/query-keys";
import { useForumApi } from "../../shared/api/use-forum-api";

const NAV_ITEMS = [
  { to: "/", label: "Feed" },
  { to: "/saved", label: "Salvos" },
  { to: "/admin/tools", label: "Admin" },
];

export function TopBar() {
  const { auth, isAuthenticated, setRole, setUserId, reset } = useAuthSession();
  const api = useForumApi();

  const meQuery = useQuery({
    queryKey: queryKeys.platform.me(auth.userId),
    enabled: isAuthenticated,
    queryFn: () => api.platform.getMe(),
  });

  return (
    <header className="top-bar">
      <div className="top-bar__brand">
        <strong>Forum Reddit</strong>
        <span>Frontend runtime-first</span>
      </div>

      <nav className="top-bar__nav" aria-label="Navegacao principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "top-bar__nav-item top-bar__nav-item--active" : "top-bar__nav-item"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="top-bar__auth" aria-label="Configuracao de autenticacao de desenvolvimento">
        <label>
          <span>x-user-id</span>
          <input
            className="top-bar__input"
            placeholder="ex.: user-1"
            value={auth.userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </label>

        <label>
          <span>x-user-role</span>
          <select
            className="top-bar__select"
            value={auth.role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="user">user</option>
            <option value="moderator">moderator</option>
            <option value="admin">admin</option>
          </select>
        </label>

        <button type="button" className="button button--ghost" onClick={reset}>
          Limpar
        </button>

        <p className="top-bar__auth-state" aria-live="polite">
          {isAuthenticated
            ? meQuery.isSuccess
              ? `Autenticado como ${meQuery.data.currentUserId} (${meQuery.data.role})`
              : "Headers ativos"
            : "Modo publico"}
        </p>
      </div>
    </header>
  );
}