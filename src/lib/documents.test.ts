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

  it('sends only incoming or outgoing as direction', () => {
    expect(buildDocumentQuery({ direction: 'incoming' }).get('direction')).toBe('incoming');
    expect(buildDocumentQuery({ direction: 'outgoing' }).get('direction')).toBe('outgoing');
    expect(buildDocumentQuery({}).get('direction')).toBeNull();
  });

  it('reads the tenant API origin from the admin URL', () => {
    expect(tenantApiOrigin('https://finestar-stage.racunai.hr/admin/')).toBe(
      'https://finestar-stage.racunai.hr',
    );
  });
});
