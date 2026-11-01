import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { ObrazacTzReport } from './ObrazacTzReport';

describe('ObrazacTzReport', () => {
  it('offers only years that already have a filed form', () => {
    render(<ObrazacTzReport slug="finestar" />);

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
    expect(screen.getByRole('heading', { name: 'Obrazac TZ 1' })).toBeInTheDocument();
    expect(
      screen.getByText(/Obrazac TZ 1\. Obračun od 01\.01\.2021\. do 31\.12\.2021\. FINE STAR d\.o\.o\./),
    ).toBeInTheDocument();
    expect(screen.getByText('0,01705')).toBeInTheDocument();
    expect(screen.getByText('NE')).toBeInTheDocument();
    expect(screen.getByText(/8c71a4a6-b562-4815-bf59-76223379c4f8/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 25\.03\.2022\. 13:11/)).toBeInTheDocument();
    expect(screen.getByText(/ispostava 3566/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2020' } });

    expect(
      screen.getByText(/Obrazac TZ 1\. Obračun od 01\.01\.2020\. do 31\.12\.2020\. FINE STAR d\.o\.o\./),
    ).toBeInTheDocument();
    expect(screen.getByText('3.275,44')).toBeInTheDocument();
    expect(screen.getAllByText('0,63').length).toBeGreaterThan(0);
    expect(screen.getByText(/a6b8a15c-d4e9-4301-8a93-ce79ab488e08/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 24\.05\.2021\. 13:38/)).toBeInTheDocument();
    expect(screen.getByText(/ispostava Susedgrad/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2019' } });

    expect(
      screen.getByText(/Obrazac TZ 1\. Obračun od 01\.01\.2019\. do 31\.12\.2019\. FINE STAR d\.o\.o\./),
    ).toBeInTheDocument();
    expect(screen.getByText('0,01938')).toBeInTheDocument();
    expect(screen.getByText('NE')).toBeInTheDocument();
    expect(screen.getByText(/57a17a22-7092-4b1a-9c13-0be4ed16e033/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 06\.05\.2020\. 09:21/)).toBeInTheDocument();
    expect(
      screen.getByText('Iznos pod rednim brojem 13. može biti nula samo ako je 31.12. prestanak obveze.'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2018' } });

    expect(screen.getByRole('heading', { name: 'Obrazac TZ' })).toBeInTheDocument();
    expect(
      screen.getByText(/Obrazac TZ\. Obračun od 01\.01\.2018\. do 31\.12\.2018\. FINE STAR d\.o\.o\./),
    ).toBeInTheDocument();
    expect(screen.getByText('0,01938')).toBeInTheDocument();
    expect(screen.getByText(/3c94b4c1-b6b8-49af-9bff-9f795783d71e/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 25\.03\.2019\. 08:30/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2017' } });

    expect(screen.getByText(/Obavijest Porezne uprave od 26\.02\.2018\./)).toBeInTheDocument();
    expect(screen.getByText(/iznosi 0,00 kn/)).toBeInTheDocument();
    expect(screen.queryByText('0,0204')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2016' } });

    expect(
      screen.getByText(/Obračun od 01\.01\.2016\. do 31\.12\.2016\. FINE STAR d\.o\.o\./),
    ).toBeInTheDocument();
    expect(screen.getByText('0,0204')).toBeInTheDocument();
    expect(screen.getByText(/7f869746-59a5-4c7e-8570-bd5816ea01eb/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 22\.03\.2017\. 14:34/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2015' } });

    expect(
      screen.getByText(/Obračun od 01\.01\.2015\. do 31\.12\.2015\. FINE STAR d\.o\.o\./),
    ).toBeInTheDocument();
    expect(screen.getByText('0,0240')).toBeInTheDocument();
    expect(screen.getAllByText('0,00').length).toBe(6);
    expect(screen.getByText(/f6187da6-3238-41d2-a088-831978562066/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 12\.04\.2016\. 13:38/)).toBeInTheDocument();
    expect(
      screen.getByText('Iznos pod rednim brojem 7. može biti nula samo ako je 31.12. prestanak obveze.'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2014' } });

    expect(screen.getByText('5,19')).toBeInTheDocument();
    expect(screen.getByText('0,01')).toBeInTheDocument();
    expect(screen.getByText(/319262dc-aff4-425a-aaa2-c04afcbaa9ef/)).toBeInTheDocument();
  });

  it('shows no year control when the tenant has no filed form', () => {
    render(<ObrazacTzReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generiranog obrasca TZ.')).toBeInTheDocument();
    expect(screen.queryByText('5,19')).not.toBeInTheDocument();
  });
});
