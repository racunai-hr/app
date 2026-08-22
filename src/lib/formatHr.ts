const amountFormat = new Intl.NumberFormat('hr-HR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ZAGREB = 'Europe/Zagreb';
const DISPLAY_EMPTY = '—';

/** Zero-padded day/month/year in Europe/Zagreb (presentation only). */
const zagrebDateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZAGREB,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const zagrebTimeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZAGREB,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function parseAmount(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatHrAmount(value: string | number | null | undefined): string {
  const n = parseAmount(value);
  if (n == null) return value == null || value === '' ? '—' : String(value);
  return amountFormat
    .formatToParts(n)
    .map((part) => {
      if (part.type === 'group') return '.';
      if (part.type === 'decimal') return ',';
      return part.value;
    })
    .join('');
}

export function formatHrMoney(value: string | number | null | undefined, currency: string): string {
  if (value == null || value === '') return `— ${currency}`.trim();
  return `${formatHrAmount(value)} ${currency}`;
}

function isValidCalendarYmd(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day
  );
}

function toInstant(value: string | Date | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function zagrebYmd(date: Date): { day: string; month: string; year: string } | null {
  const parts = Object.fromEntries(
    zagrebDateFormat.formatToParts(date).map((part) => [part.type, part.value]),
  );
  if (!parts.day || !parts.month || !parts.year) return null;
  return { day: parts.day, month: parts.month, year: parts.year };
}

/**
 * Business calendar date: YYYY-MM-DD → dd.mm.yyyy.
 * No timezone conversion — never use new Date('YYYY-MM-DD').
 */
export function formatHrInputDate(value: string | null | undefined): string {
  if (value == null || value === '') return DISPLAY_EMPTY;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return DISPLAY_EMPTY;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidCalendarYmd(year, month, day)) return DISPLAY_EMPTY;
  return `${match[3]}.${match[2]}.${match[1]}.`;
}

/** User-facing date from Date / ISO timestamp → dd.mm.yyyy. (Europe/Zagreb). */
export function formatHrDate(value: string | Date | null | undefined): string {
  const date = toInstant(value);
  if (!date) return DISPLAY_EMPTY;
  const ymd = zagrebYmd(date);
  if (!ymd) return DISPLAY_EMPTY;
  return `${ymd.day}.${ymd.month}.${ymd.year}.`;
}

/** User-facing timestamp → dd.mm.yyyy. HH:mm (Europe/Zagreb). */
export function formatHrDateTime(value: string | Date | null | undefined): string {
  const date = toInstant(value);
  if (!date) return DISPLAY_EMPTY;
  const ymd = zagrebYmd(date);
  if (!ymd) return DISPLAY_EMPTY;
  const time = zagrebTimeFormat.format(date);
  return `${ymd.day}.${ymd.month}.${ymd.year}. ${time}`;
}

export function parseHrInputDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const match = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?$/.exec(trimmed);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function hrMonthTitle(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat('hr-HR', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthIndex, 1),
  );
}

export function hrWeekdayShort(): string[] {
  const monday = new Date(2026, 7, 3);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat('hr-HR', { weekday: 'short' }).format(day);
  });
}

export function calendarCells(year: number, monthIndex: number): Array<{ iso: string; day: number; inMonth: boolean }> {
  const first = new Date(year, monthIndex, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, monthIndex, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      iso: toIsoDate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
    };
  });
}
