import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders numbered pages with an ellipsis', () => {
    render(<Pagination page={5} pageCount={9} onPage={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Stranica 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stranica 5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Stranica 9' })).toBeInTheDocument();
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('calls onPage when a page number is clicked', () => {
    const onPage = vi.fn();
    render(<Pagination page={5} pageCount={9} onPage={onPage} />);
    fireEvent.click(screen.getByRole('button', { name: 'Stranica 6' }));
    expect(onPage).toHaveBeenCalledWith(6);
  });

  it('clamps a typed page on submit and does not call onPage twice after blur', () => {
    const onPage = vi.fn();
    render(<Pagination page={1} pageCount={9} onPage={onPage} />);
    const input = screen.getByLabelText('Broj stranice');
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.submit(input.closest('form')!);
    expect(onPage).toHaveBeenCalledTimes(1);
    expect(onPage).toHaveBeenCalledWith(9);
    fireEvent.blur(input);
    expect(onPage).toHaveBeenCalledTimes(1);
  });

  it('does not navigate on empty or invalid input', () => {
    const onPage = vi.fn();
    render(<Pagination page={3} pageCount={9} onPage={onPage} />);
    const input = screen.getByLabelText('Broj stranice');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.submit(input.closest('form')!);
    expect(onPage).not.toHaveBeenCalled();
    expect(input).toHaveValue(3);
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);
    expect(onPage).not.toHaveBeenCalled();
    expect(input).toHaveValue(3);
  });

  it('calls onPageSize when the row selector changes', () => {
    const onPageSize = vi.fn();
    render(
      <Pagination
        page={3}
        pageCount={9}
        pageSize={20}
        onPage={vi.fn()}
        onPageSize={onPageSize}
      />,
    );
    fireEvent.change(screen.getByLabelText('Redaka po stranici'), { target: { value: '50' } });
    expect(onPageSize).toHaveBeenCalledTimes(1);
    expect(onPageSize).toHaveBeenCalledWith(50);
  });
});
