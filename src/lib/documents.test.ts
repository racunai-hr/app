import { describe, expect, it } from 'vitest';

import { buildDocumentQuery, tenantApiOrigin } from './documents';

describe('documents client', () => {
  it('omits direction and page for export-style queries', () => {
    const params = buildDocumentQuery(
      {
        direction: '',
        view: 'attention',
        search: 'acme',
        page: 3,
        page_size: 20,
      },
      { includePage: false },
    );
    expect(params.get('direction')).toBeNull();
    expect(params.get('page')).toBeNull();
    expect(params.get('view')).toBe('attention');
    expect(params.get('search')).toBe('acme');
  });

  it('sends cost_center and fixed_asset filters', () => {
    expect(buildDocumentQuery({ cost_center: 18 }).get('cost_center')).toBe('18');
    expect(buildDocumentQuery({ fixed_asset: 4 }).get('fixed_asset')).toBe('4');
    expect(buildDocumentQuery({}).get('cost_center')).toBeNull();
    expect(buildDocumentQuery({}).get('fixed_asset')).toBeNull();
  });

  it('sends only incoming or outgoing as direction', () => {
    expect(buildDocumentQuery({ direction: 'incoming' }).get('direction')).toBe('incoming');
    expect(buildDocumentQuery({ direction: 'outgoing' }).get('direction')).toBe('outgoing');
    expect(buildDocumentQuery({ direction: 'incoming,official' }).get('direction')).toBe(
      'incoming,official',
    );
    expect(buildDocumentQuery({}).get('direction')).toBeNull();
  });

  it('reads the tenant API origin from the admin URL', () => {
    const previous = process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE;
    delete process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE;
    expect(tenantApiOrigin('https://finestar-stage.racunai.hr/admin/')).toBe(
      'https://finestar-stage.racunai.hr',
    );
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE;
    } else {
      process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE = previous;
    }
  });

  it('honours API origin override for local WSL', () => {
    const previous = process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE;
    process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE = 'http://localhost:8000';
    expect(tenantApiOrigin('https://finestar-stage.racunai.hr/admin/')).toBe('http://localhost:8000');
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE;
    } else {
      process.env.NEXT_PUBLIC_API_ORIGIN_OVERRIDE = previous;
    }
  });
});
