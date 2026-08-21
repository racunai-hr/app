export const MOCK_TOAST_MESSAGE = 'Mock funkcija — backend još nije povezan.';

export type AppNavId =
  | 'pregled'
  | 'dokumenti'
  | 'saldakonti'
  | 'glavna-knjiga'
  | 'partneri'
  | 'bankarstvo'
  | 'porezi'
  | 'izvjestaji'
  | 'postavke';

export type AppNavItem = {
  id: AppNavId;
  label: string;
  href: (slug: string) => string;
};

export const APP_NAV: AppNavItem[] = [
  { id: 'pregled', label: 'Pregled', href: () => '/dashboard' },
  { id: 'dokumenti', label: 'Dokumenti', href: (slug) => `/t/${slug}/dokumenti` },
  { id: 'saldakonti', label: 'Saldakonti', href: (slug) => `/t/${slug}/saldakonti` },
  { id: 'glavna-knjiga', label: 'Glavna knjiga', href: (slug) => `/t/${slug}/glavna-knjiga` },
  { id: 'partneri', label: 'Partneri', href: (slug) => `/t/${slug}/partneri` },
  { id: 'bankarstvo', label: 'Bankarstvo', href: (slug) => `/t/${slug}/bankarstvo` },
  { id: 'porezi', label: 'Porezi i obrasci', href: (slug) => `/t/${slug}/porezi` },
  { id: 'izvjestaji', label: 'Izvještaji', href: (slug) => `/t/${slug}/izvjestaji` },
  { id: 'postavke', label: 'Postavke tvrtke', href: (slug) => `/t/${slug}/postavke` },
];

export function isNavActive(pathname: string, item: AppNavItem, slug: string): boolean {
  if (item.id === 'pregled') return pathname === '/dashboard';
  const href = item.href(slug);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const MODULE_PLACEHOLDERS: Record<
  Exclude<AppNavId, 'pregled' | 'saldakonti' | 'bankarstvo' | 'glavna-knjiga'>,
  { title: string; description: string }
> = {
  dokumenti: {
    title: 'Dokumenti',
    description: 'Ulazni i izlazni dokumenti bit će spojeni na read-model u sljedećoj fazi.',
  },
  partneri: {
    title: 'Partneri',
    description: 'Kartice kupaca i dobavljača (MDM) s kontaktima, IBAN-ima, dokumentima i saldakontom.',
  },
  porezi: {
    title: 'Porezi i obrasci',
    description: 'PDV, JOPPD i ostali obrasci nisu spojeni na ovaj ekran.',
  },
  izvjestaji: {
    title: 'Izvještaji',
    description: 'Financijski izvještaji nisu izloženi u ovom sučelju.',
  },
  postavke: {
    title: 'Postavke tvrtke',
    description: 'Postavke tenanta ostaju u postojećem backend konfiguracijskom sloju.',
  },
};
