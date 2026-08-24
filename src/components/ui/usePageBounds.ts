'use client';

import { useEffect } from 'react';

type Args = {
  page: number;
  pageCount: number;
  ready: boolean;
  onPage: (page: number) => void;
};

export function usePageBounds({ page, pageCount, ready, onPage }: Args) {
  useEffect(() => {
    if (!ready) return;
    if (page > pageCount) onPage(pageCount);
  }, [ready, page, pageCount, onPage]);
}
