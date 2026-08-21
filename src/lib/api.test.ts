import { describe, expect, it } from 'vitest';

import { parseError } from './api';

function responseFrom(
  body: BodyInit | null,
  init: { status: number; headers?: HeadersInit },
): Response {
  return new Response(body, {
    status: init.status,
    headers: init.headers,
  });
}

describe('parseError', () => {
  it('returns JSON detail when present', async () => {
    const response = responseFrom(JSON.stringify({ detail: 'Nije pronađeno.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(await parseError(response)).toBe('Nije pronađeno.');
  });

  it('joins non_field_errors', async () => {
    const response = responseFrom(
      JSON.stringify({ non_field_errors: ['Prvo.', 'Drugo.'] }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
    expect(await parseError(response)).toBe('Prvo. Drugo.');
  });

  it('joins first array field when detail is missing', async () => {
    const response = responseFrom(JSON.stringify({ amount: ['Prevelik.'] }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(await parseError(response)).toBe('Prevelik.');
  });

  it('does not surface HTML 404 bodies', async () => {
    const response = responseFrom('<!doctype html><h1>Not Found</h1>', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
    expect(await parseError(response)).toBe('Zahtjev nije uspio (HTTP 404).');
  });

  it('does not surface proxy 502 bodies', async () => {
    const response = responseFrom('Bad Gateway', {
      status: 502,
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(await parseError(response)).toBe('Zahtjev nije uspio (HTTP 502).');
  });

  it('handles invalid JSON with HTTP status fallback', async () => {
    const response = responseFrom('{not-json', {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(await parseError(response)).toBe('Zahtjev nije uspio (HTTP 500).');
  });

  it('appends request id header when present', async () => {
    const response = responseFrom('<html>boom</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html', 'cf-ray': 'abc-123' },
    });
    expect(await parseError(response)).toBe('Zahtjev nije uspio (HTTP 502). Ref: abc-123');
  });

  it('returns fallback for empty JSON object', async () => {
    const response = responseFrom('{}', {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(await parseError(response)).toBe('Zahtjev nije uspio (HTTP 400).');
  });
});
