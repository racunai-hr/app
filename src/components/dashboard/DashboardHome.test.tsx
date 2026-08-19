import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardHome } from './DashboardHome';
import { MOCK_DATA_NOTICE } from '@/lib/dashboard/mockData';

describe('DashboardHome', () => {
  it('renders the eight overview sections with mock data for Fine Star', () => {
    render(<DashboardHome companyName="Fine Star d.o.o." onMockAction={() => undefined} />);

    expect(screen.getByRole('heading', { name: 'Pregled' })).toBeInTheDocument();
    expect(screen.getByText(/Fine Star d\.o\.o\./)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(MOCK_DATA_NOTICE))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Financijski sažetak' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kontrola poslovnih knjiga' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novčani tok' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Zadaci koji traže pozornost' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Starosna struktura potraživanja' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Porezni kalendar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nedavni dokumenti' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Brze radnje' })).toBeInTheDocument();
    expect(screen.getByText('Stanje poslovnih računa')).toBeInTheDocument();
    expect(screen.getByText('PDV')).toBeInTheDocument();
    expect(screen.getByText('JOPPD')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Priljevi i odljevi/ })).toBeInTheDocument();
    expect(screen.getByText('Priljev')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull();
  });

  it('invokes mock handlers for tasks and quick actions', () => {
    const onMockAction = vi.fn();
    render(<DashboardHome companyName="Fine Star d.o.o." onMockAction={onMockAction} />);
    fireEvent.click(screen.getByRole('button', { name: /Novi izlazni račun/ }));
    fireEvent.click(screen.getByRole('button', { name: /Neusuglašene bankovne transakcije/ }));
    expect(onMockAction).toHaveBeenCalledTimes(2);
  });
});
