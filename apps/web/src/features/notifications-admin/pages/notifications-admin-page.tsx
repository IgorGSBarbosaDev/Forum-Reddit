import { useAuthSession } from "../../auth-context/auth-context";
import { EmptyState, ErrorState, LoadingState } from "../../../components/ui/view-states";
import { useProcessNotificationsMutation } from "../queries/use-process-notifications-mutation";

export function NotificationsAdminPage() {
  const { auth, isAuthenticated, hasActiveSession, isSessionLoading, sessionError } = useAuthSession();
  const processMutation = useProcessNotificationsMutation();

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Autenticacao obrigatoria"
        description="Informe x-user-id para acessar ferramentas administrativas."
      />
    );
  }

  if (isSessionLoading) {
    return <LoadingState title="Validando sessao" description="Confirmando acesso as ferramentas administrativas." />;
  }

  if (!hasActiveSession) {
    return (
      <ErrorState
        title="Sessao invalida"
        description={sessionError ?? "O usuario informado nao existe ou nao esta ativo."}
      />
    );
  }

  const isModerator = auth.role === "moderator" || auth.role === "admin";
  if (!isModerator) {
    return (
      <EmptyState
        title="Permissao insuficiente"
        description="Apenas moderator/admin pode processar eventos de notificacao."
      />
    );
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Admin tools</h1>
        <p className="page-subtitle">Processamento manual de notificacoes internas pendentes.</p>
      </header>

      <div className="panel">
        <button
          type="button"
          className="button button--primary"
          onClick={() => processMutation.mutate()}
          disabled={processMutation.isPending}
        >
          {processMutation.isPending ? "Processando..." : "Processar notificacoes"}
        </button>

        {processMutation.isSuccess ? (
          <p className="inline-success">
            Processamento concluido. Eventos tratados: {processMutation.data.processedCount}
          </p>
        ) : null}

        {processMutation.isError ? (
          <p className="inline-error">Erro ao processar: {processMutation.error.message}</p>
        ) : null}
      </div>
    </section>
  );
}
