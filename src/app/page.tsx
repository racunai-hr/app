'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { Logo } from '@/components/Logo';
import { resetTurnstile, TurnstileWidget } from '@/components/TurnstileWidget';
import { login } from '@/lib/api';
import { isLoggedIn, setTokens } from '@/lib/auth';

const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Potvrdite CAPTCHA provjeru.');
      return;
    }

    setLoading(true);

    try {
      const tokens = await login(username.trim(), password, turnstileToken || undefined);
      setTokens(tokens.access, tokens.refresh);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prijava nije uspjela.');
      setTurnstileToken('');
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  }

  const submitDisabled = loading || (TURNSTILE_ENABLED && !turnstileToken);

  return (
    <main className="page">
      <div className="card">
        <div className="brand">
          <Logo size={80} showText />
          <p>Računovodstvena SaaS platforma</p>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Korisničko ime</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Lozinka</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {TURNSTILE_ENABLED && (
            <div className="form-group turnstile-group">
              <TurnstileWidget onToken={setTurnstileToken} onExpire={handleTurnstileExpire} />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitDisabled}>
            {loading ? 'Prijava…' : 'Prijava'}
          </button>
        </form>
      </div>
    </main>
  );
}
