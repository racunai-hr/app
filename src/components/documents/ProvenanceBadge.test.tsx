import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProvenanceBadge } from './ProvenanceBadge';

describe('ProvenanceBadge', () => {
  it('renders an unknown badge for null values', () => {
    render(
      <ProvenanceBadge field={{ value: null, reason: 'not_provable', source: 'subledger' }} />,
    );
    const badge = screen.getByText('nije dokazivo');
    expect(badge).toHaveAttribute('data-tone', 'unknown');
    expect(badge.className).not.toContain('badge-success');
  });

  it('renders a success badge only when the value is known', () => {
    render(<ProvenanceBadge field={{ value: 'paid', reason: null, source: 'subledger' }} />);
    const badge = screen.getByText('Plaćen');
    expect(badge).toHaveAttribute('data-tone', 'success');
  });
});
