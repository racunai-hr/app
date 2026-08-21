const amountFormat = new Intl.NumberFormat('hr-HR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormat = new Intl.DateTimeFormat('hr-HR', {
  timeZone: 'Europe/Zagreb',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat('hr-HR', {
  timeZone: 'Europe/Zagreb',
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

export function formatHrSnapshot(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const parts = Object.fromEntries(dateFormat.formatToParts(date).map((part) => [part.type, part.value]));
  const day = String(Number(parts.day));
  const month = String(Number(parts.month));
  return `${day}. ${month}. ${parts.year}. u ${timeFormat.format(date)}`;
}

export function formatHrInputDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  return `${match[3]}.${match[2]}.${match[1]}.`;
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
