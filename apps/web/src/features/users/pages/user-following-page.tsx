import { WebRoutes } from "@forum-reddit/routes";

import { PaginationFooter } from "../../../components/ui/pagination-footer";
import { EmptyState, ErrorState, LoadingState } from "../../../components/ui/view-states";
import { Link, useParams, useSearchParams } from "../../../routes/navigation";
import { useUserFollowingQuery } from "../queries/use-user-following-query";

function parsePositiveInt(rawValue: string | null, fallback: number): number {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function UserFollowingPage() {
  const params = useParams<{ userId?: string }>();
  const userId = params.userId;

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);

  const followingQuery = useUserFollowingQuery(userId, page, limit);

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    next.set("limit", String(limit));
    setSearchParams(next, { replace: true });
  }

  if (!userId) {
    return <ErrorState title="Usuario invalido" description="Identificador do usuario nao informado." />;
  }

  if (followingQuery.isLoading) {
    return <LoadingState title="Carregando seguindo" />;
  }

  if (followingQuery.isError) {
    return (
      <ErrorState
        title="Falha ao carregar seguindo"
        description={followingQuery.error.message}
        action={
          <button type="button" className="button button--primary" onClick={() => followingQuery.refetch()}>
            Tentar novamente
          </button>
        }
      />
    );
  }

  const payload = followingQuery.data;
  if (!payload || payload.data.length === 0) {
    return <EmptyState title="Este usuario nao segue ninguem" />;
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Seguindo</h1>
        <p className="page-subtitle">Lista paginada de perfis seguidos por este usuario.</p>
      </header>

      <div className="panel">
        <ul className="stack-list">
          {payload.data.map((user) => {
            const label = user.displayName || user.username || "Deleted user";

            return (
              <li key={user.id}>
                <Link to={WebRoutes.users.byId(user.id)}>{label}</Link>
              </li>
            );
          })}
        </ul>

        <PaginationFooter
          page={payload.meta.page}
          totalPages={payload.meta.totalPages}
          isBusy={followingQuery.isFetching}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
