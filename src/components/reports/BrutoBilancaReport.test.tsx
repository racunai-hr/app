import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { BrutoBilancaReport } from './BrutoBilancaReport';

describe('BrutoBilancaReport', () => {
  it('offers only years that already have a generated trial balance', () => {
    render(<BrutoBilancaReport slug="finestar" />);

    const year = screen.getByLabelText('Godina');
    expect(year.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '2021',
      '2020',
      '2019',
      '2018',
      '2017',
      '2016',
      '2015',
      '2014',
    ]);
    expect(screen.getByText(/Razdoblje od 01\.01\.2021\. do 31\.12\.2021\./)).toBeInTheDocument();
    expect(screen.getByText('Žiro račun OTP')).toBeInTheDocument();
    expect(screen.getAllByText('203.533,35').length).toBeGreaterThan(0);
    expect(screen.getAllByText('321.384,00').length).toBeGreaterThan(0);
    expect(screen.getByText('Obveze za zajmove Ante Vrcan')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2020' } });

    expect(screen.getByText(/Razdoblje od 01\.01\.2020\. do 31\.12\.2020\./)).toBeInTheDocument();
    expect(screen.getByText('Zemljište')).toBeInTheDocument();
    expect(screen.getByText('Oprema u pripremi')).toBeInTheDocument();
    expect(screen.getAllByText('664.768,00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('166.192,00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3.275,44').length).toBeGreaterThan(0);
    expect(screen.getAllByText('17.736,25').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0,56').length).toBeGreaterThan(0);
    expect(screen.getByText('Preneseni gubitak 2018.')).toBeInTheDocument();
    expect(screen.getByText('Preneseni gubitak 2019.')).toBeInTheDocument();
    expect(screen.getAllByText('1.662.508,65').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2019' } });

    expect(screen.getByText(/Razdoblje od 01\.01\.2019\. do 31\.12\.2019\./)).toBeInTheDocument();
    expect(screen.getAllByText('17.736,25').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.920,71').length).toBeGreaterThan(0);
    expect(screen.getAllByText('460,00').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2018' } });

    expect(screen.getByText(/Razdoblje od 01\.01\.2018\. do 31\.12\.2018\./)).toBeInTheDocument();
    expect(screen.getByText('Potraživanja za kamate na dane zajmove')).toBeInTheDocument();
    expect(screen.getAllByText('17.966,25').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.565,98').length).toBeGreaterThan(0);
    expect(screen.getByText('Preneseni gubitak 2017.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2017' } });

    expect(screen.getByText(/Razdoblje od 01\.01\.2017\. do 31\.12\.2017\./)).toBeInTheDocument();
    expect(screen.getByText('Potraživanja za kamatu iz danih zajmova')).toBeInTheDocument();
    expect(screen.getAllByText('2.026,99').length).toBeGreaterThan(0);
    expect(screen.getAllByText('11.915,89').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2016' } });

    expect(screen.getByText(/Razdoblje od 01\.01\.2016\. do 31\.12\.2016\./)).toBeInTheDocument();
    expect(screen.getByText('Potraživanja za kamate iz danih pozajmica')).toBeInTheDocument();
    expect(screen.getAllByText('1.481,10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.657,10').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2015' } });

    expect(screen.getByText(/Razdoblje od 01\.01\.2015\. do 31\.12\.2015\./)).toBeInTheDocument();
    expect(screen.getByText('Glavna blagajna')).toBeInTheDocument();
    expect(screen.getAllByText('10.594,00').length).toBeGreaterThan(0);
  });

  it('shows no year control when the tenant has no generated trial balance', () => {
    render(<BrutoBilancaReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generirane bruto bilance.')).toBeInTheDocument();
    expect(screen.queryByText('73.331,14')).not.toBeInTheDocument();
  });
});
