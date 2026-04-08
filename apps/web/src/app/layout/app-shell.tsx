import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet } from "react-router-dom";

import { queryKeys } from "../../shared/api/query-keys";
import { useForumApi } from "../../shared/api/use-forum-api";
import { TopBar } from "./top-bar";

const SIDE_LINKS = [
  { to: "/", label: "Feed" },
  { to: "/posts/new", label: "Criar post" },
  { to: "/saved", label: "Posts salvos" },
  { to: "/users/user-1", label: "Perfil de exemplo" },
  { to: "/admin/tools", label: "Ferramentas admin" },
];

export function AppShell() {
  const api = useForumApi();

  const healthQuery = useQuery({
    queryKey: queryKeys.platform.health,
    queryFn: () => api.platform.getHealth(),
    staleTime: 60_000,
  });

  return (
    <div className="app-shell">
      <TopBar />

      <div className="shell-grid">
        <aside className="side-nav" aria-label="Navegacao secundaria">
          <h2>Espacos</h2>
          <ul>
            {SIDE_LINKS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? "side-nav__item side-nav__item--active" : "side-nav__item")}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <main className="shell-main" id="main-content">
          <Outlet />
        </main>

        <aside className="context-panel" aria-label="Contexto da aplicacao">
          <h2>Status da API</h2>

          {healthQuery.isLoading ? <p>Checando backend...</p> : null}
          {healthQuery.isError ? <p className="inline-error">Falha de conectividade.</p> : null}
          {healthQuery.isSuccess ? (
            <p className="inline-success">
              {healthQuery.data.service}: {healthQuery.data.status}
            </p>
          ) : null}

          <div className="context-panel__divider" />

          <h3>Fase atual</h3>
          <p>
            Fundacao completa com arquitetura por dominio, contrato tipado, roteamento e estados de tela.
          </p>
        </aside>
      </div>
    </div>
  );
}