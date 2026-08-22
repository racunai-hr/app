'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  DOCUMENTS_SUBNAV,
  documentListUrl,
  isDocumentsSubnavActive,
  parseDocumentListQuery,
  patchForDocumentsSubnav,
} from '@/lib/documentListQuery';

export { DOCUMENTS_SUBNAV };

export function DocumentsSubnav({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const query = parseDocumentListQuery(searchParams);

  return (
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
  );
}
