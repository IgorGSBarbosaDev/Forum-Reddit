import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { useAuthSession } from "../../auth-context/auth-context";
import { useFollowUserMutation, useUnfollowUserMutation } from "../hooks/use-follow-mutations";
import { toUserMutationMessage } from "../lib/user-mutation-errors";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/ui/view-states";

export function UserProfilePage() {
  const params = useParams();
  const userId = params.userId;
  const [actionError, setActionError] = useState<string | null>(null);

  const api = useForumApi();
  const { auth, hasActiveSession, isAuthenticated, sessionError, viewerId } = useAuthSession();

  const profileQuery = useQuery({
    queryKey: queryKeys.users.profile(userId ?? "", viewerId),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User id is required.");
      }

      return api.users.getProfile(userId);
    },
  });

  const relationshipQuery = useQuery({
    queryKey: queryKeys.users.relationship(userId ?? "", viewerId ?? ""),
    enabled: Boolean(userId) && hasActiveSession && Boolean(viewerId),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User id is required.");
      }

      return api.users.getRelationship(userId);
    },
  });

  const followMutation = useFollowUserMutation(userId ?? "");
  const unfollowMutation = useUnfollowUserMutation(userId ?? "");

  if (!userId) {
    return <ErrorState title="Usuario invalido" description="Identificador do usuario nao informado." />;
  }

  if (profileQuery.isLoading) {
    return <LoadingState title="Carregando perfil" description="Buscando informacoes deste usuario." />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        title="Falha ao carregar perfil"
        description={profileQuery.error.message}
        action={
          <button type="button" className="button button--primary" onClick={() => profileQuery.refetch()}>
            Tentar novamente
          </button>
        }
      />
    );
  }

  const profile = profileQuery.data;
  if (!profile) {
    return <EmptyState title="Perfil nao encontrado" />;
  }

  const name = profile.displayName || profile.username || "Deleted user";
  const isOwnProfile = hasActiveSession && viewerId === profile.id;
  const isRelationshipLoading = hasActiveSession && !isOwnProfile && relationshipQuery.isLoading;
  const isFollowBusy = followMutation.isPending || unfollowMutation.isPending;
  const following = hasActiveSession
    ? (relationshipQuery.data?.following ?? profile.following)
    : false;

  async function handleToggleFollow() {
    setActionError(null);

    if (!hasActiveSession) {
      setActionError(
        sessionError ?? (isAuthenticated
          ? "O usuario informado nao existe ou nao esta ativo."
          : "Informe x-user-id no topo para seguir usuarios."),
      );
      return;
    }

    if (isOwnProfile) {
      setActionError("Nao e possivel seguir seu proprio perfil.");
      return;
    }

    try {
      if (following) {
        await unfollowMutation.mutateAsync();
      } else {
        await followMutation.mutateAsync();
      }
    } catch (error) {
      setActionError(toUserMutationMessage(error, "Nao foi possivel atualizar relacionamento de follow."));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">{name}</h1>
        <p className="page-subtitle">{profile.bio ?? "Sem biografia informada."}</p>
      </header>

      <div className="panel">
        <ul className="meta-list" aria-label="Resumo de relacionamento">
          <li>{profile.followersCount} seguidores</li>
          <li>{profile.followingCount} seguindo</li>
          {hasActiveSession && !isOwnProfile ? (
            <li>{following ? "Voce segue este usuario" : "Voce ainda nao segue"}</li>
          ) : null}
        </ul>

        <div className="inline-actions">
          {hasActiveSession && !isOwnProfile ? (
            <button
              type="button"
              className="button button--primary"
              onClick={handleToggleFollow}
              disabled={isFollowBusy || isRelationshipLoading}
            >
              {isRelationshipLoading
                ? "Carregando relacionamento..."
                : isFollowBusy
                  ? "Atualizando..."
                  : following
                    ? "Deixar de seguir"
                    : "Seguir"}
            </button>
          ) : null}

          <Link className="button button--ghost" to={`/users/${profile.id}/followers`}>
            Ver seguidores
          </Link>
          <Link className="button button--ghost" to={`/users/${profile.id}/following`}>
            Ver seguindo
          </Link>
        </div>

        {hasActiveSession && relationshipQuery.isError ? (
          <p className="inline-error">Falha ao carregar relacionamento: {relationshipQuery.error.message}</p>
        ) : null}

        {actionError ? <p className="inline-error">{actionError}</p> : null}
      </div>
    </section>
  );
}
