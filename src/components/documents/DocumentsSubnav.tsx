'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  DOCUMENTS_OPERATIVE_PRESETS,
  DOCUMENTS_SUBNAV,
  documentListUrl,
  isDocumentsSubnavActive,
  isOperativeSubnavActive,
  parseDocumentListQuery,
  patchForDocumentsSubnav,
  patchForOperativeSubnav,
} from '@/lib/documentListQuery';

export { DOCUMENTS_OPERATIVE_PRESETS, DOCUMENTS_SUBNAV };

export function DocumentsSubnav({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const query = parseDocumentListQuery(searchParams);

  return (
    <div className="documents-subnav-stack">
      <nav className="tabs banking-subnav" aria-label="Dokumenti">
        {DOCUMENTS_SUBNAV.map((item) => {
          const href = documentListUrl(slug, 'dokumenti', patchForDocumentsSubnav(query, item.id));
          const current = isDocumentsSubnavActive(query, item.id);
          return (
            <Link key={item.id} href={href} className={current ? 'tab tab-active' : 'tab'}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav className="tabs banking-subnav documents-operative-subnav" aria-label="Operativni pregledi">
        {DOCUMENTS_OPERATIVE_PRESETS.map((item) => {
          const href = documentListUrl(slug, 'dokumenti', patchForOperativeSubnav(query, item.id));
          const current = isOperativeSubnavActive(query, item.id);
          return (
            <Link key={item.id} href={href} className={current ? 'tab tab-active' : 'tab'}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
