import type { components } from './openapi/generated';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.racunai.hr';
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'racunai.hr';

export { API_URL, PLATFORM_DOMAIN };

export type TenantInfo = components['schemas']['AuthMeTenant'];
export type UserInfo = components['schemas']['AuthMeUser'] & {
  /** Present only after the backend adds the Django-staff gate. Strictly opt-in. */
  can_access_django_admin?: boolean;
};
export type MeResponse = Omit<components['schemas']['AuthMeResponse'], 'user'> & {
  user: UserInfo;
};
export type TokenResponse = components['schemas']['TokenPairResponse'];

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data.detail) return String(data.detail);
    if (data.non_field_errors?.length) return data.non_field_errors.join(' ');
    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) {
      return data[firstKey].join(' ');
    }
  } catch {
    /* non-JSON body — do not surface HTML/proxy text */
  }
  const requestId = response.headers.get('x-request-id') || response.headers.get('cf-ray');
  const base = `Zahtjev nije uspio (HTTP ${response.status}).`;
  return requestId ? `${base} Ref: ${requestId}` : base;
}

export async function login(
  username: string,
  password: string,
  turnstileToken?: string,
): Promise<TokenResponse> {
  const body: Record<string, string> = { username, password };
  if (turnstileToken) {
    body.turnstile_token = turnstileToken;
  }

  const response = await fetch(`${API_URL}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return response.json();
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const response = await fetch(`${API_URL}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return response.json();
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: 'Vlasnik',
    accountant: 'Računovođa',
    viewer: 'Pregled',
  };
  return labels[role] || role;
}
