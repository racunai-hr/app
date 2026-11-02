import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { PodBilReport } from './PodBilReport';

describe('PodBilReport', () => {
  it('offers only years that already have a generated form', () => {
    render(<PodBilReport slug="finestar" />);

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
    ]);
    expect(screen.getByText(/Stanje na dan 31\.12\.2022\. Obrazac POD-BIL, raspored od 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('1.652.687').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.652.686').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−75.602').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−84.807').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2021' } });

    expect(screen.getByText(/Stanje na dan 31\.12\.2021\. Obrazac POD-BIL, raspored od 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('696.521').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9.205').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−8.775').length).toBeGreaterThan(0);
    expect(screen.getAllByText('21.544').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2020' } });

    expect(screen.getByText(/Stanje na dan 31\.12\.2020\. Obrazac POD-BIL, raspored od 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('664.768').length).toBeGreaterThan(0);
    expect(screen.getAllByText('686.024').length).toBeGreaterThan(0);
    expect(screen.getAllByText('17.980').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2019' } });

    expect(screen.getByText(/Stanje na dan 31\.12\.2019\. Obrazac POD-BIL, raspored od 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('20.902').length).toBeGreaterThan(0);
    expect(screen.getAllByText('17.981').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−460').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2018' } });

    expect(screen.getByText(/Stanje na dan 31\.12\.2018\. Obrazac POD-BIL, raspored od 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('20.777').length).toBeGreaterThan(0);
    expect(screen.getAllByText('18.211').length).toBeGreaterThan(0);
    expect(screen.getAllByText('17.966').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2017' } });

    expect(screen.getByText(/Stanje na dan 31\.12\.2017\. Obrazac POD-BIL, raspored od 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('20.468').length).toBeGreaterThan(0);
    expect(screen.getAllByText('18.196').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.129').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2016' } });

    expect(screen.getByText(/Stanje na dan 31\.12\.2016\. Obrazac POD-BIL, raspored od 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('21.051').length).toBeGreaterThan(0);
    expect(screen.getAllByText('19.570').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2015' } });

    expect(screen.getByText(/Stanje na dan 31\.12\.2015\. Obrazac POD-BIL, raspored prije 2016\./)).toBeInTheDocument();
    expect(screen.getAllByText('20.694').length).toBeGreaterThan(0);
    expect(screen.getByText('3. Goodwill')).toBeInTheDocument();
    expect(screen.getAllByText('20.100').length).toBeGreaterThan(0);
  });

  it('shows no year control when the tenant has no generated form', () => {
    render(<PodBilReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generiranog obrasca POD-BIL.')).toBeInTheDocument();
    expect(screen.queryByText('20.100')).not.toBeInTheDocument();
  });
});
