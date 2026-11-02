import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePageBounds } from './usePageBounds';

describe('usePageBounds', () => {
  it('does not call onPage while ready is false', () => {
    const onPage = vi.fn();
    renderHook(() => usePageBounds({ page: 9, pageCount: 2, ready: false, onPage }));
    expect(onPage).not.toHaveBeenCalled();
  });

  it('does not call onPage when the page is already in range', () => {
    const onPage = vi.fn();
    renderHook(() => usePageBounds({ page: 2, pageCount: 2, ready: true, onPage }));
    expect(onPage).not.toHaveBeenCalled();
  });

  it('clamps to pageCount after the count is ready', () => {
    const onPage = vi.fn();
    renderHook(() => usePageBounds({ page: 9, pageCount: 2, ready: true, onPage }));
    expect(onPage).toHaveBeenCalledTimes(1);
    expect(onPage).toHaveBeenCalledWith(2);
  });
});
