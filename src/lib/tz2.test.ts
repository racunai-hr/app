import { describe, expect, it } from 'vitest';

import { tz2Href, tz2SubmissionLabel } from './tz2';

describe('tz2Href', () => {
  it('scopes TZ 2 to the calendar year', () => {
    expect(tz2Href('carolina-plaza', 2026)).toBe('/t/carolina-plaza/porezi/tz2?year=2026');
  });
});

describe('tz2SubmissionLabel', () => {
  it('names the portal predaja and processed confirmation without calling it ispravak', () => {
    expect(tz2SubmissionLabel({ submission_no: 1 })).toBe('Predaja #1');
    expect(tz2SubmissionLabel({ submission_no: 2 })).toBe('Potvrda obrade #2');
    expect(tz2SubmissionLabel(null)).toBe('—');
  });
});
