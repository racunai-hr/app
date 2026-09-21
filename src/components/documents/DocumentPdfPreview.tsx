'use client';

import { useEffect, useState } from 'react';

export type DocumentPreviewKind = 'pdf' | 'image';

type Props = {
  load: () => Promise<Blob>;
  title?: string;
  kind?: DocumentPreviewKind;
};

export function DocumentPdfPreview({ load, title = 'PDF', kind = 'pdf' }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let revoked = '';
    let cancelled = false;
    setError('');
    load()
      .then((blob) => {
        if (cancelled) return;
        const next = URL.createObjectURL(blob);
        revoked = next;
        setUrl(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : kind === 'image'
                ? 'Slika nije učitana.'
                : 'PDF nije učitan.',
          );
        }
      });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [load, kind]);

  if (error) return <p className="error">{error}</p>;
  if (!url) return <p className="muted-inline">Učitavam {title}…</p>;
  if (kind === 'image') {
    return <img src={url} alt={title} className="docs-pdf-preview docs-pdf-preview-image" />;
  }
  return (
    <object data={url} type="application/pdf" className="docs-pdf-preview" aria-label={title}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Otvori {title}
      </a>
    </object>
  );
}
