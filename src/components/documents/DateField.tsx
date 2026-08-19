'use client';

import { useEffect, useRef, useState } from 'react';

import {
  calendarCells,
  formatHrInputDate,
  hrMonthTitle,
  hrWeekdayShort,
  parseHrInputDate,
  toIsoDate,
} from '@/lib/formatHr';

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
};

export function DateField({ name, label, defaultValue = '' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [iso, setIso] = useState(defaultValue);
  const [text, setText] = useState(defaultValue ? formatHrInputDate(defaultValue) : '');
  const [open, setOpen] = useState(false);
  const today = toIsoDate(new Date());
  const initial = iso ? new Date(`${iso}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function applyIso(next: string) {
    setIso(next);
    setText(next ? formatHrInputDate(next) : '');
    if (next) {
      const date = new Date(`${next}T00:00:00`);
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
    }
  }

  function commitText() {
    const parsed = parseHrInputDate(text);
    if (parsed == null) {
      setText(iso ? formatHrInputDate(iso) : '');
      return;
    }
    applyIso(parsed);
  }

  return (
    <div className="filter-field date-field" ref={rootRef}>
      <span>{label}</span>
      <div className="date-field-control">
        <input type="hidden" name={name} value={iso} />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={label}
          placeholder="dd.mm.gggg."
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={commitText}
          onFocus={() => setOpen(true)}
        />
        <button type="button" className="date-field-toggle" aria-label={`Kalendar ${label}`} onClick={() => setOpen((value) => !value)}>
          ▾
        </button>
      </div>
      {open && (
        <div className="date-cal" role="dialog" aria-label={`Kalendar ${label}`}>
          <div className="date-cal-nav">
            <button
              type="button"
              onClick={() => {
                const next = new Date(viewYear, viewMonth - 1, 1);
                setViewYear(next.getFullYear());
                setViewMonth(next.getMonth());
              }}
            >
              ‹
            </button>
            <strong>{hrMonthTitle(viewYear, viewMonth)}</strong>
            <button
              type="button"
              onClick={() => {
                const next = new Date(viewYear, viewMonth + 1, 1);
                setViewYear(next.getFullYear());
                setViewMonth(next.getMonth());
              }}
            >
              ›
            </button>
          </div>
          <div className="date-cal-grid">
            {hrWeekdayShort().map((day) => (
              <span key={day} className="date-cal-dow">
                {day}
              </span>
            ))}
            {calendarCells(viewYear, viewMonth).map((cell) => (
              <button
                key={cell.iso}
                type="button"
                className={[
                  'date-cal-day',
                  cell.inMonth ? '' : 'date-cal-muted',
                  cell.iso === iso ? 'date-cal-selected' : '',
                  cell.iso === today ? 'date-cal-today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  applyIso(cell.iso);
                  setOpen(false);
                }}
              >
                {cell.day}
              </button>
            ))}
          </div>
          <div className="date-cal-actions">
            <button
              type="button"
              onClick={() => {
                applyIso('');
                setOpen(false);
              }}
            >
              Očisti
            </button>
            <button
              type="button"
              onClick={() => {
                applyIso(today);
                setOpen(false);
              }}
            >
              Danas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
