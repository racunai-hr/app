import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { PodRdgReport } from './PodRdgReport';

describe('PodRdgReport', () => {
  it('offers only years that already have a generated form', () => {
    render(<PodRdgReport slug="finestar" />);

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
    expect(
      screen.getByText(/Razdoblje od 01\.01\.2021\. do 31\.12\.2021\. Obrazac POD-RDG, raspored od 2016\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText('−8.775').length).toBe(2);
    expect(screen.getAllByText('3.809').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.440').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2020' } });

    expect(
      screen.getByText(/Razdoblje od 01\.01\.2020\. do 31\.12\.2020\. Obrazac POD-RDG, raspored od 2016\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText('−1').length).toBe(2);
    expect(screen.getAllByText('−230').length).toBe(2);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2019' } });

    expect(
      screen.getByText(/Razdoblje od 01\.01\.2019\. do 31\.12\.2019\. Obrazac POD-RDG, raspored od 2016\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText('230').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−230').length).toBe(4);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2018' } });

    expect(
      screen.getByText(/Razdoblje od 01\.01\.2018\. do 31\.12\.2018\. Obrazac POD-RDG, raspored od 2016\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText('230').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−230').length).toBe(2);
    expect(screen.getAllByText('1.129').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2017' } });

    expect(
      screen.getByText(/Razdoblje od 01\.01\.2017\. do 31\.12\.2017\. Obrazac POD-RDG, raspored od 2016\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText('1.129').length).toBeGreaterThan(0);
    expect(screen.getAllByText('945').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−1.129').length).toBe(2);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2016' } });

    expect(
      screen.getByText(/Razdoblje od 01\.01\.2016\. do 31\.12\.2016\. Obrazac POD-RDG, raspored od 2016\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText('230').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−230').length).toBe(2);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2015' } });

    expect(
      screen.getByText(/Razdoblje od 01\.01\.2015\. do 31\.12\.2015\. Obrazac POD-RDG, raspored prije 2016\./),
    ).toBeInTheDocument();
    expect(screen.getByText('5. Ostali troškovi')).toBeInTheDocument();
    expect(screen.getAllByText('205').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−200').length).toBe(2);
  });

  it('shows no year control when the tenant has no generated form', () => {
    render(<PodRdgReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generiranog obrasca POD-RDG.')).toBeInTheDocument();
    expect(screen.queryByText('205')).not.toBeInTheDocument();
  });
});
