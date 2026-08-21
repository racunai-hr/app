'use client';

type Props = {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
};

export function BankingPager({ page, pageCount, onPage }: Props) {
  return (
    <nav className="pager" aria-label="Paginacija">
      <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Prethodna
      </button>
      <span>
        Stranica {page} / {pageCount}
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        Sljedeća
      </button>
    </nav>
  );
}
