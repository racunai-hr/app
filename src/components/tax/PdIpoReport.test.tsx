import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { PdIpoReport } from './PdIpoReport';

describe('PdIpoReport', () => {
  it('shows the 2018 related-party loan and the receipt', () => {
    render(<PdIpoReport slug="finestar" />);

    expect(screen.getByLabelText('Godina')).toBeInTheDocument();
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '2021',
      '2020',
      '2019',
      '2018',
      '2017',
      '2016',
    ]);
    expect(screen.getByText(/Šupina Poljica j.d.o.o., OIB 91381354893/)).toBeInTheDocument();
    expect(screen.getAllByText(/Toni Šupe, OIB 63281973348/).length).toBe(2);
    expect(screen.getAllByText('185.600,00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5.150,46').length).toBeGreaterThan(0);
    expect(screen.getByText('189.000,00')).toBeInTheDocument();
    expect(screen.getAllByText('3.807,53').length).toBeGreaterThan(0);
    expect(screen.getByText(/db457038-6b58-46e7-a776-b4df18e7f5e0/)).toBeInTheDocument();
    expect(screen.queryByText(/Zaprimljeno/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2020' } });

    expect(screen.getByText(/Marina Banović, OIB 53531930627/)).toBeInTheDocument();
    expect(screen.getAllByText('17.736,25').length).toBeGreaterThan(0);
    expect(screen.getByText('3.275,44')).toBeInTheDocument();
    expect(screen.getByText(/0,00 %/)).toBeInTheDocument();
    expect(screen.getByText(/97a0fd51-f5c3-42a5-8271-316dacc7a73e/)).toBeInTheDocument();
    expect(screen.getByText(/Potpis Bernard Ulični, 24\.05\.2021\. 13:36/)).toBeInTheDocument();
    expect(screen.queryByText(/Zaprimljeno/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Uspješno obrađen/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2019' } });

    expect(screen.getByText('17.736,25')).toBeInTheDocument();
    expect(screen.getByText('354,73')).toBeInTheDocument();
    expect(screen.getByText('2.920,71')).toBeInTheDocument();
    expect(screen.getByText(/2,00 %/)).toBeInTheDocument();
    expect(screen.getByText(/be271c71-f4a1-4478-86a8-188256c5226e/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 06\.05\.2020\. 09:21/)).toBeInTheDocument();
    expect(screen.getByText(/Uspješno obrađen 06\.05\.2020\. 22:00/)).toBeInTheDocument();
    expect(screen.getByText(/udjeli u kapitalu ili glasačkom pravu/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2018' } });

    expect(screen.getByText(/Martina Banović, OIB 53531930627/)).toBeInTheDocument();
    expect(screen.getByText('18.196,25')).toBeInTheDocument();
    expect(screen.getByText('17.966,25')).toBeInTheDocument();
    expect(screen.getByText('538,99')).toBeInTheDocument();
    expect(screen.getByText('2.565,98')).toBeInTheDocument();
    expect(screen.getByText(/3,00 %/)).toBeInTheDocument();
    expect(screen.getByText(/8e80ddfd-c074-4fd7-be66-25b43e439c72/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 25\.03\.2019\. 08:34/)).toBeInTheDocument();
    expect(screen.getByText(/Uspješno obrađen 25\.03\.2019\. 22:01/)).toBeInTheDocument();
    expect(screen.getByText(/član društva/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2017' } });

    expect(screen.getByText('19.570,00')).toBeInTheDocument();
    expect(screen.getByText('545,89')).toBeInTheDocument();
    expect(screen.getByText('2.026,99')).toBeInTheDocument();
    expect(screen.getByText(/član uprave/)).toBeInTheDocument();
    expect(screen.getByText(/46edd356-9919-4016-b433-ee32eebb4944/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 25\.04\.2018\. 11:12/)).toBeInTheDocument();
    expect(screen.getByText(/Uspješno obrađen 25\.04\.2018\. 22:03/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Godina'), { target: { value: '2016' } });

    expect(screen.getByText(/Nikola Banović, OIB 03626641565/)).toBeInTheDocument();
    expect(screen.getByText('19.800,00')).toBeInTheDocument();
    expect(screen.getByText('894,00')).toBeInTheDocument();
    expect(screen.getByText('587,10')).toBeInTheDocument();
    expect(screen.getByText('1.481,10')).toBeInTheDocument();
    expect(screen.getByText(/udjeli u kapitalu ili glasačkom pravu/)).toBeInTheDocument();
    expect(screen.getByText(/e5af7652-a3ea-460d-a567-85eae3973c1b/)).toBeInTheDocument();
    expect(screen.getByText(/Zaprimljeno 24\.10\.2017\. 14:05/)).toBeInTheDocument();
    expect(screen.getByText(/Uspješno obrađen 24\.10\.2017\. 22:01/)).toBeInTheDocument();
  });

  it('shows no year control when the tenant has no filed form', () => {
    render(<PdIpoReport slug="other" />);

    expect(screen.queryByLabelText('Godina')).not.toBeInTheDocument();
    expect(screen.getByText('Nema generiranog obrasca PD-IPO.')).toBeInTheDocument();
    expect(screen.queryByText('Martina Banović')).not.toBeInTheDocument();
  });
});
