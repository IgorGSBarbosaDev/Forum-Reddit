import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Pagina nao encontrada</h1>
        <p className="page-subtitle">O caminho solicitado nao existe nesta aplicacao.</p>
      </header>

      <div className="panel">
        <p>Verifique o endereco e tente novamente.</p>
        <Link to="/" className="button button--primary">
          Voltar para feed
        </Link>
      </div>
    </section>
  );
}