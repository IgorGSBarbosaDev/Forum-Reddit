import type { ReactNode } from "react";

type StateCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "default" | "error";
};

function StateCard({ title, description, action, tone = "default" }: StateCardProps) {
  return (
    <section className={`state-card ${tone === "error" ? "state-card--error" : ""}`}>
      <h3 className="state-card__title">{title}</h3>
      {description ? <p className="state-card__description">{description}</p> : null}
      {action ? <div className="state-card__action">{action}</div> : null}
    </section>
  );
}

export function LoadingState(props: { title?: string; description?: string }) {
  return (
    <StateCard
      title={props.title ?? "Carregando..."}
      description={props.description ?? "Estamos buscando os dados mais recentes."}
      action={
        <div className="skeleton-lines" aria-hidden="true">
          <span className="skeleton-line" />
          <span className="skeleton-line" />
          <span className="skeleton-line" />
        </div>
      }
    />
  );
}

export function EmptyState(props: { title: string; description?: string; action?: ReactNode }) {
  return <StateCard title={props.title} description={props.description} action={props.action} />;
}

export function ErrorState(props: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <StateCard
      tone="error"
      title={props.title ?? "Nao foi possivel concluir esta acao."}
      description={props.description ?? "Tente novamente em alguns instantes."}
      action={props.action}
    />
  );
}