'use client';

import { useEffect } from 'react';

import {
  DocumentPdfPreview,
  type DocumentPreviewKind,
} from '@/components/documents/DocumentPdfPreview';

type Props = {
  title: string;
  load: () => Promise<Blob>;
  kind?: DocumentPreviewKind;
  downloading?: boolean;
  onDownload: () => void;
  onClose: () => void;
};

export function DocumentPdfPreviewDialog({
  title,
  load,
  kind = 'pdf',
  downloading = false,
  onDownload,
  onClose,
}: Props) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="docs-pdf-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="docs-pdf-dialog-title"
      onClick={onClose}
    >
      <div
        className="docs-pdf-dialog-panel"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="docs-pdf-dialog-head">
          <h2 id="docs-pdf-dialog-title">{title}</h2>
          <div className="docs-pdf-dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={downloading}
              onClick={onDownload}
            >
              {downloading ? 'Preuzimam…' : 'Preuzmi'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Zatvori
            </button>
          </div>
        </div>
        <div className="docs-pdf-dialog-body">
          <DocumentPdfPreview load={load} title={title} kind={kind} />
        </div>
      </div>
    </div>
  );
}
