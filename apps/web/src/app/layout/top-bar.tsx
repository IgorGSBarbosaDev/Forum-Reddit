import { NavLink } from "react-router-dom";

import type { UserRole } from "@forum-reddit/shared-types";

import { useAuthSession } from "../../features/auth-context/auth-context";

const NAV_ITEMS = [
  { to: "/", label: "Feed" },
  { to: "/saved", label: "Salvos" },
  { to: "/admin/tools", label: "Admin" },
];

export function TopBar() {
  const {
    auth,
    isAuthenticated,
    isSessionLoading,
    sessionError,
    sessionStatus,
    applyPreset,
    setRole,
    setUserId,
    reset,
  } = useAuthSession();

  function renderSessionStatus() {
    if (!isAuthenticated) {
      return "Modo publico";
    }

    if (isSessionLoading) {
      return `Validando sessao de ${auth.userId}...`;
    }

    if (sessionStatus === "valid") {
      return `Sessao ativa como ${auth.userId} (${auth.role})`;
    }

    return `Sessao invalida: ${sessionError ?? "usuario inexistente ou inativo."}`;
  }

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
        <div className="inline-actions">
          <button type="button" className="button button--ghost" onClick={() => applyPreset("user-1", "user")}>
            user-1
          </button>
          <button type="button" className="button button--ghost" onClick={() => applyPreset("admin", "admin")}>
            admin
          </button>
        </div>

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
          {renderSessionStatus()}
        </p>
      </div>
    </header>
  );
}
