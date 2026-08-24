'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, fetchMe } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { DOCUMENTS_OPERATIVE_HREFS } from '@/lib/documentListQuery';
import { tenantApiOrigin } from '@/lib/documents';
import { fetchFixedAssets } from '@/lib/assets';
import {
  canWriteFinance,
  createOfficialDocument,
  fetchOfficialDocumentPostingProfiles,
  type OfficialDocumentPostingProfileDto,
} from '@/lib/finance';
import { fetchPartners } from '@/lib/partners';

type Props = {
  slug: string;
};

export function OfficialDocumentCreate({ slug }: Props) {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [token, setToken] = useState('');
  const [issuers, setIssuers] = useState<Array<{ id: number; name: string }>>([]);
  const [assets, setAssets] = useState<Array<{ id: number; name: string }>>([]);
  const [profiles, setProfiles] = useState<OfficialDocumentPostingProfileDto[]>([]);
  const [profileId, setProfileId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function suggestedProfileId(selectedAssetId: string): string {
    if (!selectedAssetId) return '';
    const ppmv = profiles.find((row) => row.code === 'ppmv_vehicle_acquisition');
    return ppmv ? String(ppmv.id) : '';
  }

  useEffect(() => {
    const access = getAccessToken();
    if (!access) {
      router.replace('/');
      return;
    }
    let cancelled = false;
    fetchMe(access)
      .then(async (me) => {
        const found = me.tenants.find((row) => row.slug === slug);
        if (!found) throw new ApiError('Tvrtka nije pronađena.', 404);
        if (!canWriteFinance(found.role)) throw new ApiError('Nemate pravo unosa.', 403);
        const apiOrigin = tenantApiOrigin(found.admin_url);
        const [partners, fixedAssets, catalog] = await Promise.all([
          fetchPartners(apiOrigin, access, { page_size: 100, status: 'active' }),
          fetchFixedAssets(apiOrigin, access, { page: 1 }),
          fetchOfficialDocumentPostingProfiles(apiOrigin, access),
        ]);
        if (cancelled) return;
        setOrigin(apiOrigin);
        setToken(access);
        setIssuers(partners.results.map((row) => ({ id: row.id, name: row.name })));
        setAssets(fixedAssets.results.map((row) => ({ id: row.id, name: row.name })));
        setProfiles(catalog.filter((row) => row.allowed_kinds.includes('tax_decision')));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Obrazac nije učitan.');
      });
    return () => {
      cancelled = true;
    };
  }, [router, slug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!origin || !token) return;
    const form = new FormData(event.currentTarget);
    form.set('register', 'true');
    if (!String(form.get('related_fixed_asset_id') || '')) {
      form.delete('related_fixed_asset_id');
    }
    if (!String(form.get('posting_profile_id') || '')) {
      form.delete('posting_profile_id');
    }
    setBusy(true);
    setError('');
    try {
      const created = await createOfficialDocument(origin, token, form);
      router.push(`/t/${slug}/dokumenti/sluzbeni/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registracija nije uspjela.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="docs-shell incoming-detail">
      <nav className="incoming-detail-crumb" aria-label="Navigacija">
        <Link href={DOCUMENTS_OPERATIVE_HREFS.incoming(slug)}>Ulazni</Link>
        <span aria-hidden="true"> / </span>
        <span>Novi službeni dokument</span>
      </nav>
      <h1 className="docs-heading">Registriraj službeni dokument</h1>
      {error ? <div className="error">{error}</div> : null}
      <form className="docs-filters" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Izdavatelj
          <select name="issuer_id" required>
            <option value="">Odaberi partnera</option>
            {issuers.map((issuer) => (
              <option key={issuer.id} value={issuer.id}>
                {issuer.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Broj dokumenta
          <input name="document_number" required />
        </label>
        <label>
          Datum
          <input name="issue_date" type="date" required />
        </label>
        <label>
          Dospijeće
          <input name="due_date" type="date" />
        </label>
        <label>
          Iznos
          <input name="amount" required inputMode="decimal" />
        </label>
        <label>
          Referenca
          <input name="reference" />
        </label>
        <label>
          Napomene
          <textarea name="notes" rows={3} />
        </label>
        <label>
          Povezana imovina
          <select
            name="related_fixed_asset_id"
            onChange={(event) => {
              const next = event.target.value;
              if (!profileId) {
                setProfileId(suggestedProfileId(next));
              }
            }}
          >
            <option value="">Bez kartice</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Profil knjiženja
          <select
            name="posting_profile_id"
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
          >
            <option value="">Kasnije prije Knjiži</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          PDF
          <input name="file" type="file" accept="application/pdf" required />
        </label>
        <input type="hidden" name="official_kind" value="tax_decision" />
        <button type="submit" className="btn btn-primary" disabled={busy || !origin}>
          {busy ? 'Registriram…' : 'Registriraj'}
        </button>
      </form>
    </div>
  );
}
