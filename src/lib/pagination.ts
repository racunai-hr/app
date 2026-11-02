export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
export type PageWindowItem = number | 'gap';

export function parsePage(raw: string | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.floor(value);
}

export function parsePageSize(raw: string | null): PageSizeOption {
  const value = Number(raw);
  if ((PAGE_SIZE_OPTIONS as readonly number[]).includes(value)) {
    return value as PageSizeOption;
  }
  return DEFAULT_PAGE_SIZE;
}

export function pageCountOf(count: number, pageSize: number): number {
  if (!Number.isFinite(count) || count <= 0) return 1;
  const size =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.ceil(count / size));
}

export function clampPage(value: number, pageCount: number): number {
  const safeMax = Number.isFinite(pageCount) && pageCount >= 1 ? Math.floor(pageCount) : 1;
  if (!Number.isFinite(value)) return 1;
  return Math.min(safeMax, Math.max(1, Math.floor(value)));
}

export function pageWindow(
  page: number,
  pageCount: number,
  siblings = 1,
): PageWindowItem[] {
  const safeCount = Number.isFinite(pageCount) && pageCount >= 1 ? Math.floor(pageCount) : 1;
  const current = clampPage(page, safeCount);
  const pages = new Set<number>([1, safeCount]);
  const reach = Number.isFinite(siblings) && siblings >= 0 ? Math.floor(siblings) : 1;
  for (let next = current - reach; next <= current + reach; next += 1) {
    if (next >= 1 && next <= safeCount) pages.add(next);
  }

  const sorted = [...pages].sort((left, right) => left - right);
  const window: PageWindowItem[] = [];
  for (const item of sorted) {
    const previous = window[window.length - 1];
    if (typeof previous === 'number' && item - previous > 1) {
      if (item - previous === 2) window.push(previous + 1);
      else window.push('gap');
    }
    window.push(item);
  }
  return window;
}

export function writePageParams(
  params: URLSearchParams,
  page: number,
  pageSize: number,
): URLSearchParams {
  const safePage = parsePage(String(page));
  const safeSize = parsePageSize(String(pageSize));
  if (safePage > 1) params.set('page', String(safePage));
  else params.delete('page');
  if (safeSize !== DEFAULT_PAGE_SIZE) params.set('page_size', String(safeSize));
  else params.delete('page_size');
  return params;
}
