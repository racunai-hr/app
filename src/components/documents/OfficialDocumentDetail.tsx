'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, fetchMe } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { DOCUMENTS_OPERATIVE_HREFS } from '@/lib/documentListQuery';
import {
  downloadDocumentPdf,
  fetchDocument,
  fetchDocumentPdfBlob,
  tenantApiOrigin,
  type DocumentDetail,
} from '@/lib/documents';
import { formatHrInputDate, formatHrMoney } from '@/lib/formatHr';
import {
  canWriteFinance,
  cancelOfficialDocument,
  fetchOfficialDocumentPostingProfiles,
  linkOfficialDocumentJournal,
  newIdempotencyKey,
  postOfficialDocument,
  setOfficialDocumentPostingProfile,
  type OfficialDocumentPostingProfileDto,
} from '@/lib/finance';
import { provenanceText } from '@/lib/provenance';
import { OPERATIONAL_STATUS_LABELS, DOCUMENT_STATUS_LABELS, SUBLEDGER_LABELS } from '@/lib/documentLabels';
import { documentBankCloseHref, shouldShowBankCloseCta } from '@/lib/bankingReconcile';

import { DocumentPdfPreview } from './DocumentPdfPreview';

type Props = {
  slug: string;
  documentId: number;
};

export function OfficialDocumentDetail({ slug, documentId }: Props) {
  const router = useRouter();
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [journalId, setJournalId] = useState('');
  const [profiles, setProfiles] = useState<OfficialDocumentPostingProfileDto[]>([]);
  const [profileId, setProfileId] = useState('');
  const [role, setRole] = useState('');
  const [origin, setOrigin] = useState('');
  const [token, setToken] = useState('');

  const loadPdf = useCallback(() => {
    return fetchDocumentPdfBlob(origin, token, 'official', documentId);
  }, [origin, token, documentId]);

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
        const apiOrigin = tenantApiOrigin(found.admin_url);
        const [doc, catalog] = await Promise.all([
          fetchDocument(apiOrigin, access, 'official', documentId),
          fetchOfficialDocumentPostingProfiles(apiOrigin, access),
        ]);
        if (cancelled) return;
        setRole(found.role);
        setOrigin(apiOrigin);
        setToken(access);
        setDetail(doc);
        setProfiles(catalog);
        setProfileId(doc.posting_profile_id ? String(doc.posting_profile_id) : '');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          router.replace('/');
          return;
        }
        setError(err instanceof Error ? err.message : 'Dokument nije učitan.');
      });
    return () => {
      cancelled = true;
    };
  }, [documentId, router, slug]);

  async function handleCancel() {
    if (!origin || !token) return;
    setBusy('cancel');
    setError('');
    try {
      await cancelOfficialDocument(origin, token, documentId);
      setDetail(await fetchDocument(origin, token, 'official', documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Otkazivanje nije uspjelo.');
    } finally {
      setBusy('');
    }
  }

  async function handleSaveProfile() {
    if (!origin || !token) return;
    const id = Number(profileId);
    if (!Number.isFinite(id) || id <= 0) {
      setError('Odaberite profil knjiženja.');
      return;
    }
    setBusy('profile');
    setError('');
    try {
      await setOfficialDocumentPostingProfile(origin, token, documentId, id);
      const doc = await fetchDocument(origin, token, 'official', documentId);
      setDetail(doc);
      setProfileId(doc.posting_profile_id ? String(doc.posting_profile_id) : String(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil nije spremljen.');
    } finally {
      setBusy('');
    }
  }

  async function handlePost() {
    if (!origin || !token) return;
    setBusy('post');
    setError('');
    try {
      await postOfficialDocument(origin, token, documentId, newIdempotencyKey());
      const doc = await fetchDocument(origin, token, 'official', documentId);
      setDetail(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Knjiženje nije uspjelo.');
    } finally {
      setBusy('');
    }
  }

  async function handleLinkJournal(event: React.FormEvent) {
    event.preventDefault();
    if (!origin || !token) return;
    const id = Number(journalId);
    if (!Number.isFinite(id) || id <= 0) {
      setError('Unesite ID temeljnice.');
      return;
    }
    setBusy('link');
    setError('');
    try {
      await linkOfficialDocumentJournal(origin, token, documentId, id);
      setDetail(await fetchDocument(origin, token, 'official', documentId));
      setJournalId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Povezivanje temeljnice nije uspjelo.');
    } finally {
      setBusy('');
    }
  }

  const title = detail?.source_number || `Službeni dokument #${documentId}`;
  const writable = canWriteFinance(role);
  const status = String(detail?.document_status.value || '');
  const operational = String(detail?.operational_status.value || '');
  const profileLocked = Boolean(detail?.subledger.state.value);

  return (
    <div className="docs-shell incoming-detail">
      <nav className="incoming-detail-crumb" aria-label="Navigacija">
        <Link href={DOCUMENTS_OPERATIVE_HREFS.incoming(slug)}>Ulazni</Link>
        <span aria-hidden="true"> / </span>
        <span>{title}</span>
      </nav>
      <header className="incoming-detail-header">
        <div>
          <p className="docs-detail-kicker">Službeni ulazni dokument</p>
          <h1 className="docs-heading">{title}</h1>
          {detail?.partner_name ? <p className="incoming-detail-subtitle">{detail.partner_name}</p> : null}
        </div>
        <div className="incoming-detail-actions">
          {detail?.pdf_available ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void downloadDocumentPdf(origin, token, 'official', documentId)}
            >
              Preuzmi PDF
            </button>
          ) : null}
          {writable && status === 'registered' && operational !== 'paid' ? (
            <button type="button" className="btn btn-primary" disabled={busy === 'post'} onClick={() => void handlePost()}>
              {busy === 'post' ? 'Knjižim…' : 'Knjiži'}
            </button>
          ) : null}
          {detail && shouldShowBankCloseCta(detail) ? (
            <Link className="btn btn-primary" href={documentBankCloseHref(slug, detail)}>
              Zatvori bankom
            </Link>
          ) : null}
          {writable && status && status !== 'cancelled' ? (
            <button type="button" className="btn btn-secondary" disabled={busy === 'cancel'} onClick={() => void handleCancel()}>
              {busy === 'cancel' ? 'Otkaži…' : 'Otkaži'}
            </button>
          ) : null}
        </div>
      </header>
      {error ? <div className="error">{error}</div> : null}
      {!detail ? (
        <p className="muted-inline">Učitavam…</p>
      ) : (
        <>
          <section className="incoming-card">
            <h2>Podaci</h2>
            <dl className="docs-detail-list">
              <div>
                <dt>Status</dt>
                <dd>{DOCUMENT_STATUS_LABELS[status] || provenanceText(detail.document_status)}</dd>
              </div>
              <div>
                <dt>Operativno</dt>
                <dd>{OPERATIONAL_STATUS_LABELS[operational] || provenanceText(detail.operational_status)}</dd>
              </div>
              <div>
                <dt>Datum</dt>
                <dd>{formatHrInputDate(detail.document_date)}</dd>
              </div>
              <div>
                <dt>Dospijeće</dt>
                <dd>{formatHrInputDate(detail.due_date)}</dd>
              </div>
              <div>
                <dt>Iznos</dt>
                <dd>{formatHrMoney(detail.amounts.gross, detail.amounts.currency)}</dd>
              </div>
              <div>
                <dt>Profil</dt>
                <dd>{detail.posting_profile_name || '—'}</dd>
              </div>
              <div>
                <dt>Saldakonto</dt>
                <dd>
                  {detail.subledger.state.value
                    ? SUBLEDGER_LABELS[String(detail.subledger.state.value)] ||
                      provenanceText(detail.subledger.state)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt>Temeljnica</dt>
                <dd>{detail.posting.entry_number.value || '—'}</dd>
              </div>
              <div>
                <dt>Imovina</dt>
                <dd>
                  {detail.related_fixed_asset_id
                    ? `Kartica #${detail.related_fixed_asset_id}`
                    : '—'}
                </dd>
              </div>
            </dl>
            {detail.notes ? <p>{detail.notes}</p> : null}
          </section>
          {writable && status !== 'cancelled' && !profileLocked ? (
            <section className="incoming-card">
              <h2>Profil knjiženja</h2>
              <form
                className="docs-filters"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveProfile();
                }}
              >
                <label>
                  Profil
                  <select value={profileId} onChange={(event) => setProfileId(event.target.value)}>
                    <option value="">Odaberi profil</option>
                    {profiles
                      .filter((row) => !detail.official_kind || row.allowed_kinds.includes(detail.official_kind))
                      .map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button type="submit" className="btn btn-secondary" disabled={busy === 'profile'}>
                  {busy === 'profile' ? 'Spremam…' : 'Spremi profil'}
                </button>
              </form>
            </section>
          ) : null}
          {detail.pdf_available && origin && token ? (
            <section className="incoming-card">
              <h2>PDF</h2>
              <DocumentPdfPreview load={loadPdf} title={detail.source_number || 'PDF'} />
            </section>
          ) : null}
          {writable && status !== 'cancelled' && operational !== 'posted' && operational !== 'paid' ? (
            <section className="incoming-card">
              <h2>Poveži temeljnicu</h2>
              <form className="docs-filters" onSubmit={(event) => void handleLinkJournal(event)}>
                <label>
                  ID temeljnice
                  <input value={journalId} onChange={(event) => setJournalId(event.target.value)} />
                </label>
                <button type="submit" className="btn btn-primary" disabled={busy === 'link'}>
                  {busy === 'link' ? 'Povezujem…' : 'Poveži'}
                </button>
              </form>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
