/** Country options for Partner MDM forms (ADR-0023). */
export type CountryOption = { code: string; label: string; group: 'HR' | 'EU' | 'NON_EU' };

export const PARTNER_COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'HR', label: 'Hrvatska', group: 'HR' },
  { code: 'AT', label: 'Austrija', group: 'EU' },
  { code: 'BE', label: 'Belgija', group: 'EU' },
  { code: 'BG', label: 'Bugarska', group: 'EU' },
  { code: 'CY', label: 'Cipar', group: 'EU' },
  { code: 'CZ', label: 'Češka', group: 'EU' },
  { code: 'DE', label: 'Njemačka', group: 'EU' },
  { code: 'DK', label: 'Danska', group: 'EU' },
  { code: 'EE', label: 'Estonija', group: 'EU' },
  { code: 'ES', label: 'Španjolska', group: 'EU' },
  { code: 'FI', label: 'Finska', group: 'EU' },
  { code: 'FR', label: 'Francuska', group: 'EU' },
  { code: 'GR', label: 'Grčka', group: 'EU' },
  { code: 'HU', label: 'Mađarska', group: 'EU' },
  { code: 'IE', label: 'Irska', group: 'EU' },
  { code: 'IT', label: 'Italija', group: 'EU' },
  { code: 'LT', label: 'Litva', group: 'EU' },
  { code: 'LU', label: 'Luksemburg', group: 'EU' },
  { code: 'LV', label: 'Latvija', group: 'EU' },
  { code: 'MT', label: 'Malta', group: 'EU' },
  { code: 'NL', label: 'Nizozemska', group: 'EU' },
  { code: 'PL', label: 'Poljska', group: 'EU' },
  { code: 'PT', label: 'Portugal', group: 'EU' },
  { code: 'RO', label: 'Rumunjska', group: 'EU' },
  { code: 'SE', label: 'Švedska', group: 'EU' },
  { code: 'SI', label: 'Slovenija', group: 'EU' },
  { code: 'SK', label: 'Slovačka', group: 'EU' },
  { code: 'BA', label: 'Bosna i Hercegovina', group: 'NON_EU' },
  { code: 'CH', label: 'Švicarska', group: 'NON_EU' },
  { code: 'GB', label: 'Ujedinjeno Kraljevstvo', group: 'NON_EU' },
  { code: 'ME', label: 'Crna Gora', group: 'NON_EU' },
  { code: 'RS', label: 'Srbija', group: 'NON_EU' },
  { code: 'US', label: 'Sjedinjene Američke Države', group: 'NON_EU' },
];

export function jurisdictionFromCountryCode(code: string): 'HR' | 'EU' | 'NON_EU' {
  if (code === 'HR') return 'HR';
  const option = PARTNER_COUNTRY_OPTIONS.find((row) => row.code === code);
  if (option?.group === 'EU') return 'EU';
  return 'NON_EU';
}
