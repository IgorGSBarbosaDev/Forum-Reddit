type PaginationFooterProps = {
  page: number;
  totalPages: number;
  isBusy?: boolean;
  onPageChange: (nextPage: number) => void;
};

export function PaginationFooter({ page, totalPages, isBusy = false, onPageChange }: PaginationFooterProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <footer className="pagination-footer" aria-label="Paginacao">
      <button
        type="button"
        className="button button--ghost"
        onClick={() => onPageChange(page - 1)}
        disabled={isBusy || page <= 1}
      >
        Anterior
      </button>

      <p className="pagination-footer__meta">
        Pagina <strong>{page}</strong> de <strong>{totalPages}</strong>
      </p>

      <button
        type="button"
        className="button button--ghost"
        onClick={() => onPageChange(page + 1)}
        disabled={isBusy || page >= totalPages}
      >
        Proxima
      </button>
    </footer>
  );
}