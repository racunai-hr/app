'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import {
  clampPage,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  pageWindow,
  parsePageSize,
  type PageSizeOption,
} from '@/lib/pagination';

type Props = {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  count?: number;
  pageSize?: number;
  onPageSize?: (size: PageSizeOption) => void;
};

export function Pagination({
  page,
  pageCount,
  onPage,
  count,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageSize,
}: Props) {
  const [draft, setDraft] = useState(String(page));
  const committedPage = useRef(page);
  const showNav = pageCount > 1;

  useEffect(() => {
    committedPage.current = page;
    setDraft(String(page));
  }, [page]);

  function commitPage() {
    const parsed = Number(draft);
    if (!draft.trim() || !Number.isFinite(parsed)) {
      setDraft(String(committedPage.current));
      return;
    }
    const target = clampPage(parsed, pageCount);
    setDraft(String(target));
    if (target !== committedPage.current) {
      committedPage.current = target;
      onPage(target);
    }
  }

  function handleGoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitPage();
  }

  const start = count && count > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = count && count > 0 ? Math.min(page * pageSize, count) : 0;

  return (
    <nav className="pager" aria-label="Paginacija">
      {count !== undefined && (
        <span className="pager-summary">
          {count > 0 ? `${start}–${end} od ${count}` : `0 od ${count}`}
        </span>
      )}

      {showNav && (
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Prethodna
        </button>
      )}

      {showNav && (
        <div className="pager-pages">
          {pageWindow(page, pageCount).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} className="pager-gap" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={item === page ? 'pager-page pager-page-active' : 'pager-page'}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Stranica ${item}`}
                onClick={() => {
                  if (item !== page) onPage(item);
                }}
              >
                {item}
              </button>
            ),
          )}
        </div>
      )}

      {showNav && (
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Sljedeća
        </button>
      )}

      {showNav && (
        <form className="pager-goto" onSubmit={handleGoto}>
          <label>
            Idi na
            <input
              type="number"
              min={1}
              max={pageCount}
              inputMode="numeric"
              aria-label="Broj stranice"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitPage}
            />
          </label>
        </form>
      )}

      {onPageSize && (
        <label className="pager-size">
          Redaka
          <select
            aria-label="Redaka po stranici"
            value={pageSize}
            onChange={(event) => {
              const next = parsePageSize(event.target.value);
              if (next !== pageSize) onPageSize(next);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
}
