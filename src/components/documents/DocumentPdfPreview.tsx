'use client';

import { useEffect, useState } from 'react';

type Props = {
  load: () => Promise<Blob>;
  title?: string;
};

export function DocumentPdfPreview({ load, title = 'PDF' }: Props) {
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
        if (!cancelled) setError(err instanceof Error ? err.message : 'PDF nije učitan.');
      });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [load]);

  if (error) return <p className="error">{error}</p>;
  if (!url) return <p className="muted-inline">Učitavam {title}…</p>;
  return (
    <object data={url} type="application/pdf" className="docs-pdf-preview" aria-label={title}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Otvori {title}
      </a>
    </object>
  );
}
