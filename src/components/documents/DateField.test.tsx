import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DateField } from './DateField';

describe('DateField', () => {
  it('shows a Croatian calendar with Monday-first week and local actions', () => {
    render(<DateField name="date_from" label="Od datuma" defaultValue="2026-08-19" />);
    expect(screen.getByLabelText('Od datuma')).toHaveValue('19.08.2026.');
    fireEvent.click(screen.getByLabelText('Kalendar Od datuma'));
    const dialog = screen.getByRole('dialog', { name: 'Kalendar Od datuma' });
    expect(dialog).toBeInTheDocument();
    expect(dialog.parentElement).toBe(document.body);
    expect(screen.getByLabelText('Od datuma').closest('.date-field')).toHaveClass('is-open');
    expect(screen.getByText(/kolovoz/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Očisti' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Danas' })).toBeInTheDocument();
    const weekdays = document.querySelectorAll('.date-cal-dow');
    expect(weekdays[0].textContent?.toLowerCase()).toMatch(/^pon/);
  });

  it('writes ISO into the hidden form field', () => {
    const { container } = render(<DateField name="date_from" label="Od datuma" />);
    const visible = screen.getByLabelText('Od datuma');
    fireEvent.change(visible, { target: { value: '19.8.2026' } });
    fireEvent.blur(visible);
    expect(container.querySelector('input[name="date_from"]')).toHaveValue('2026-08-19');
    expect(visible).toHaveValue('19.08.2026.');
  });
});
