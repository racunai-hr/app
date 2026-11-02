import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { GfiReport } from './GfiReport';

describe('GfiReport', () => {
  it('offers only years that already have a filed report', () => {
    render(<GfiReport slug="finestar" />);

    const year = screen.getByLabelText('Godina');
    expect(year.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '2022',
      '2021',
      '2020',
      '2019',
      '2018',
      '2017',
      '2016',
      '2015',
      '2014',
      '2013',
    ]);
    expect(screen.getByText(/FINE STAR d\.o\.o\. za usluge, OIB 36619131370/)).toBeInTheDocument();
    expect(screen.getByText(/Bana Josipa Jelačića 58, Šibenik/)).toBeInTheDocument();
    expect(screen.getByText(/Mikro poduzetnik/)).toBeInTheDocument();
    expect(screen.getByText(/Toni Šupe/)).toBeInTheDocument();
    expect(screen.getByText(/Privatno od osnivanja/)).toBeInTheDocument();
    expect(screen.getByText(/Identifikator 7428243/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 26\.04\.2023\./)).toBeInTheDocument();
    expect(screen.getByText(/387\.847\.189,32/)).toBeInTheDocument();
    expect(screen.getByText(/datoteke 4\.0\.2/)).toBeInTheDocument();
    expect(screen.getByText(/u prethodnoj godini 0, u tekućoj 1/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2021' } });

    expect(screen.getByText(/Identifikator 7122844/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 28\.03\.2022\./)).toBeInTheDocument();
    expect(screen.getByText(/377\.619\.595,69/)).toBeInTheDocument();
    expect(screen.getByText(/datoteke 4\.0\.1/)).toBeInTheDocument();
    expect(screen.queryByText(/Nalog za uplatu/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bilješke uz financijske izvještaje' })).toHaveAttribute(
      'href',
      '/t/finestar/izvjestaji/biljeske#biljeske',
    );
    expect(screen.getByRole('link', { name: 'Odluka o raspodjeli dobiti ili pokriću gubitka' })).toHaveAttribute(
      'href',
      '/t/finestar/izvjestaji/biljeske#odluka',
    );

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2020' } });

    expect(screen.getByText(/Martina Banović/)).toBeInTheDocument();
    expect(screen.getByText(/Identifikator 6910660/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 20\.04\.2021\./)).toBeInTheDocument();
    expect(screen.getByText(/384\.750\.620,68/)).toBeInTheDocument();
    expect(screen.getByText(/datoteke 3\.0\.4/)).toBeInTheDocument();
    expect(screen.queryByText(/Nalog za uplatu/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Bilješke uz financijske izvještaje' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2019' } });

    expect(screen.getByText(/Identifikator 6687228/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 27\.03\.2020\./)).toBeInTheDocument();
    expect(screen.getByText(/368\.528\.561,45/)).toBeInTheDocument();
    expect(screen.getByText(/datoteke 3\.0\.4/)).toBeInTheDocument();
    expect(screen.queryByText(/Nalog za uplatu/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2018' } });

    expect(screen.getByText(/Identifikator 6464204/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 02\.04\.2019\./)).toBeInTheDocument();
    expect(screen.getByText(/368\.531\.075,37/)).toBeInTheDocument();
    expect(screen.getByText(/datoteke 3\.0\.4/)).toBeInTheDocument();
    expect(screen.queryByText(/Nalog za uplatu/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2017' } });

    expect(screen.getByText(/Identifikator 6236191/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 09\.03\.2018\./)).toBeInTheDocument();
    expect(screen.getByText(/368\.535\.563,68/)).toBeInTheDocument();
    expect(screen.getByText(/Nalog za uplatu 01\.03\.2018\./)).toBeInTheDocument();
    expect(screen.getByText(/232,00 HRK/)).toBeInTheDocument();
    expect(screen.getByText(/HR4223900001100017042/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2016' } });

    expect(screen.getByText(/HSFI/)).toBeInTheDocument();
    expect(screen.getByText(/Identifikator 6024452/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 31\.03\.2017\./)).toBeInTheDocument();
    expect(screen.getByText(/368\.526\.521,28/)).toBeInTheDocument();
    expect(screen.queryByText(/Nalog za uplatu/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2015' } });

    expect(screen.getByText(/Identifikator 5783448/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 15\.03\.2016\./)).toBeInTheDocument();
    expect(screen.getByText(/368\.698\.172,35/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Potvrda o primitku — Statistika i javna objava' })).toBeInTheDocument();
    expect(screen.getByText('Odluka o utvrđivanju godišnjeg financijskog izvještaja')).toBeInTheDocument();
    expect(screen.queryByText(/5573651/)).not.toBeInTheDocument();
    expect(screen.queryByText('AOP')).not.toBeInTheDocument();
  });

  it('keeps the 2014 receipts when that year is selected', () => {
    render(<GfiReport slug="finestar" />);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2014' } });

    expect(screen.getByText(/Identifikator 5573651/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 27\.03\.2015\./)).toBeInTheDocument();
    expect(screen.getByText(/368\.478\.303,70/)).toBeInTheDocument();
    expect(screen.getByText(/Identifikator 5676163/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 12\.06\.2015\./)).toBeInTheDocument();
    expect(screen.getByText(/368\.394\.236,76/)).toBeInTheDocument();
    expect(screen.getByText('Dodatni podaci za poduzetnike')).toBeInTheDocument();
    expect(screen.getByText('Bilješke uz financijske izvještaje')).toBeInTheDocument();
    expect(screen.queryByText('AOP')).not.toBeInTheDocument();
    expect(screen.queryByText(/5314026/)).not.toBeInTheDocument();
  });

  it('shows the 2013 inactivity statement without the later cover', () => {
    render(<GfiReport slug="finestar" />);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2013' } });

    expect(screen.getByRole('heading', { name: 'Izjava o neaktivnosti' })).toBeInTheDocument();
    expect(screen.getByText(/Izjava od 15\.02\.2014\./)).toBeInTheDocument();
    expect(screen.getByText(/Identifikator 5314026/)).toBeInTheDocument();
    expect(screen.getByText(/Predano 26\.02\.2014\./)).toBeInTheDocument();
    expect(screen.getAllByText('Izjava o neaktivnosti')).toHaveLength(2);
    expect(screen.queryByText(/Kontrolni broj/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mali poduzetnik/)).not.toBeInTheDocument();
  });

  it('shows no year control when the tenant has no filed report', () => {
    render(<GfiReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generiranog godišnjeg financijskog izvještaja.')).toBeInTheDocument();
    expect(screen.queryByText('5573651')).not.toBeInTheDocument();
  });
});
