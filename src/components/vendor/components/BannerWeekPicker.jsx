import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, ArrowRight, X } from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function resolveRangeEnd(weekStartISO, weekEndISO, weeksNeeded = 1) {
  const start = toLocalDate(weekStartISO);
  if (!start) return null;
  if (weeksNeeded > 1) {
    return addDays(new Date(start), weeksNeeded * 7 - 1);
  }
  const parsedEnd = weekEndISO ? toLocalDate(weekEndISO) : null;
  if (parsedEnd && parsedEnd.getTime() !== start.getTime()) {
    return parsedEnd;
  }
  return addDays(new Date(start), 6);
}

export function formatBannerSlotRange(weekStartISO, weekEndISO, weeksNeeded = 1) {
  const start = toLocalDate(weekStartISO);
  const end = resolveRangeEnd(weekStartISO, weekEndISO, weeksNeeded);
  const opts = { weekday: 'short', day: 'numeric', month: 'short' };
  const endOpts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  return {
    startLabel: start.toLocaleDateString('en-US', opts),
    endLabel: end.toLocaleDateString('en-US', endOpts),
    shortLabel: `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    crossesMonth: start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear(),
  };
}

function buildSlotDays(weekStartISO, weekEndISO, weeksNeeded = 1) {
  const start = toLocalDate(weekStartISO);
  const end = resolveRangeEnd(weekStartISO, weekEndISO, weeksNeeded);
  const totalDays = weeksNeeded * 7;
  const days = [];
  for (let i = 0; i < totalDays; i++) {
    days.push(addDays(start, i));
  }
  const crossesMonth =
    weeksNeeded === 1
      ? weekSpansMultipleMonths(weekStartISO, weekEndISO)
      : start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear();
  return { days, start, end, crossesMonth };
}

export function findWeekInList(weeks, weekOrStart) {
  if (!weekOrStart || !weeks?.length) return null;
  return weeks.find((w) => isSameWeek(w, weekOrStart));
}

export function WeekRangePreview({ week, weeksNeeded = 1, compact = false }) {
  if (!week) return null;
  const { days, start, end, crossesMonth } = buildSlotDays(
    week.weekStart,
    week.weekEnd,
    weeksNeeded
  );
  const startFmt = start.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const endFmt = end.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className={`rounded-lg border ${
        compact
          ? 'border-slate-200 bg-white p-2'
          : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white p-2.5'
      }`}
    >
      {!compact && (
        <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800 mb-2">
          Your banner week {weeksNeeded > 1 ? `(${weeksNeeded} weeks)` : ''}
        </p>
      )}

      <div className="flex items-stretch gap-1.5">
        <div className="flex-1 min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Start</p>
          <p className="text-xs font-bold text-slate-900 truncate">{startFmt}</p>
        </div>
        <div className="flex items-center justify-center text-amber-600 shrink-0">
          <ArrowRight size={14} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">End</p>
          <p className="text-xs font-bold text-slate-900 truncate">{endFmt}</p>
        </div>
      </div>

      <div className="flex gap-0.5 mt-1.5 overflow-x-auto pb-0.5">
        {days.map((day, i) => {
          const isStart = i === 0;
          const isEnd = i === days.length - 1;
          const prev = days[i - 1];
          const showMonth =
            crossesMonth && (isStart || isEnd || (prev && day.getMonth() !== prev.getMonth()));
          return (
            <div
              key={day.toISOString()}
              className={`flex-1 min-w-[28px] text-center rounded py-1 px-0.5 ${
                isStart || isEnd
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-100/90 text-amber-950'
              }`}
            >
              <p className="text-[8px] font-semibold opacity-90">{WEEKDAYS[i % 7]}</p>
              <p className="text-sm font-bold leading-tight">{day.getDate()}</p>
              {showMonth && (
                <p
                  className={`text-[8px] font-medium leading-tight ${isStart || isEnd ? 'text-amber-50' : 'text-amber-800'}`}
                >
                  {day.toLocaleDateString('en-US', { month: 'short' })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {crossesMonth && !compact && (
        <p className="text-[10px] text-amber-800 mt-2 font-medium">
          This slot runs across two months — all dates are shown above. You do not need to change
          the calendar month.
        </p>
      )}
    </div>
  );
}

/** Avoid UTC shift when parsing API ISO / YYYY-MM-DD keys */
function toLocalDate(date) {
  if (!date) return null;
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, mo, d] = date.split('-').map(Number);
      return new Date(y, mo - 1, d);
    }
    if (date.includes('T')) {
      const parsed = new Date(date);
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
    const part = date.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
      const [y, mo, d] = part.split('-').map(Number);
      return new Date(y, mo - 1, d);
    }
  }
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Canonical week id — always prefer API weekStartKey */
function getWeekKey(weekOrStart) {
  if (!weekOrStart) return null;
  if (typeof weekOrStart === 'string') {
    return weekOrStart.length === 10 && weekOrStart.includes('-')
      ? weekOrStart
      : weekKeyFromDate(weekOrStart);
  }
  return weekOrStart.weekStartKey || weekKeyFromDate(weekOrStart.weekStart);
}

function isSameWeek(a, b) {
  const keyA = getWeekKey(a);
  const keyB = getWeekKey(b);
  return !!keyA && keyA === keyB;
}

function getMondayStart(date) {
  const d = toLocalDate(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function weekSpansMultipleMonths(weekStart, weekEnd) {
  const ws = toLocalDate(weekStart);
  const we = toLocalDate(weekEnd);
  return ws.getMonth() !== we.getMonth() || ws.getFullYear() !== we.getFullYear();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function weekKeyFromDate(date) {
  const m = getMondayStart(date);
  const y = m.getFullYear();
  const mo = String(m.getMonth() + 1).padStart(2, '0');
  const da = String(m.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

function formatWeekRange(weekStartISO, weekEndISO) {
  const start = toLocalDate(weekStartISO);
  const end = toLocalDate(weekEndISO);
  const opts = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

function dayCellStyles({ inMonth, week, isAdjacentMonth, isInPendingRange, isInConfirmedRange }) {
  if (!week && !inMonth) return 'text-slate-300 bg-white cursor-default';
  if (!week && inMonth) return 'bg-white text-slate-400 cursor-default';

  const adjacent = isAdjacentMonth ? 'ring-1 ring-inset ring-slate-300/60 bg-white/60' : '';

  if (isInPendingRange) {
    return `bg-amber-500 text-white font-bold ring-2 ring-amber-400 ${adjacent}`;
  }
  if (isInConfirmedRange) {
    return `bg-amber-100 text-amber-900 font-semibold ring-1 ring-amber-300 ${adjacent}`;
  }
  if (!week.bookable) {
    if (week.status === 'full') {
      return `bg-red-50 text-red-400 cursor-not-allowed ${adjacent}`;
    }
    return `bg-slate-100 text-slate-400 cursor-not-allowed ${adjacent}`;
  }
  switch (week.status) {
    case 'limited':
    case 'very_limited':
      return `bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer ${adjacent}`;
    default:
      return `bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer ${adjacent}`;
  }
}

function limitLabel(week) {
  if (!week) return null;
  return `${week.remaining}/${week.capacity}`;
}

export default function BannerWeekPicker({
  open,
  onClose,
  onConfirm,
  weeks = [],
  weeksNeeded = 1,
  maxUsersPerSlot = 5,
  loading = false,
  error = null,
  onRetry,
  calendarMonth,
  onMonthChange,
  selectedWeekStart,
  confirming = false,
}) {
  const panelRef = useRef(null);
  const [pendingWeek, setPendingWeek] = useState(null);

  useEffect(() => {
    if (open) {
      const match = selectedWeekStart ? weeks.find((w) => isSameWeek(w, selectedWeekStart)) : null;
      setPendingWeek(match || null);
    }
  }, [open, selectedWeekStart, weeks]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !confirming) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, confirming]);

  const weekMap = useMemo(() => {
    const map = {};
    weeks.forEach((w) => {
      const key = w.weekStartKey || weekKeyFromDate(toLocalDate(w.weekStart));
      map[key] = w;
    });
    return map;
  }, [weeks]);

  const pendingKey = pendingWeek ? getWeekKey(pendingWeek) : null;
  const confirmedKey = selectedWeekStart ? getWeekKey(selectedWeekStart) : null;

  const calendarRows = useMemo(() => {
    if (!calendarMonth) return [];
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const gridStart = getMondayStart(new Date(year, month, 1));
    const rows = [];
    for (let row = 0; row < 6; row++) {
      const cells = [];
      for (let col = 0; col < 7; col++) {
        const date = addDays(gridStart, row * 7 + col);
        const key = weekKeyFromDate(date);
        const week = weekMap[key] || null;
        const inMonth = date.getMonth() === month;
        cells.push({
          date,
          inMonth,
          isAdjacentMonth: !inMonth,
          week,
          weekKey: key,
          col,
        });
      }
      const week = cells[0]?.week || null;
      rows.push({
        cells,
        week,
        spansMonths: week ? weekSpansMultipleMonths(week.weekStart, week.weekEnd) : false,
      });
    }
    return rows;
  }, [calendarMonth, weekMap]);

  const pickWeek = (week) => {
    if (!week?.bookable || confirming) return;
    setPendingWeek(week);
  };

  const handleConfirmClick = () => {
    if (pendingWeek?.bookable) onConfirm?.(pendingWeek);
  };

  if (!open) return null;

  const monthLabel = calendarMonth?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !confirming) onClose?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="w-full max-w-[min(100%,28rem)] rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Weekly slot calendar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 px-2.5 py-1.5 border-b border-slate-100 bg-slate-50">
          <p className="text-[11px] font-semibold text-slate-700 leading-tight pr-1">
            Pick a week (Mon–Sun) · max {maxUsersPerSlot}/week
            {weeksNeeded > 1 ? ` · ${weeksNeeded} wks` : ''}
          </p>
          <button
            type="button"
            onClick={() => !confirming && onClose?.()}
            disabled={confirming}
            className="shrink-0 p-0.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 disabled:opacity-40"
            aria-label="Close calendar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between px-1.5 py-1 bg-primary from-slate-800 to-slate-900 text-white">
          <button
            type="button"
            onClick={() => onMonthChange?.(-1)}
            disabled={loading || confirming}
            className="p-1 rounded-md hover:bg-white/10 disabled:opacity-40"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] font-bold">{monthLabel}</span>
          <button
            type="button"
            onClick={() => onMonthChange?.(1)}
            disabled={loading || confirming}
            className="p-1 rounded-md hover:bg-white/10 disabled:opacity-40"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="max-h-[min(280px,42vh)] overflow-y-auto p-2 relative">
          {confirming && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Loading slots…
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-4">
              <p className="text-xs text-red-600 mb-2">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="text-sm font-semibold text-primary inline-flex items-center gap-1"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-7 gap-px mb-0.5">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[9px] font-bold text-slate-500 py-0">
                    {d}
                  </div>
                ))}
              </div>

              <p className="text-[13px] font-semibold text-slate-900 mb-1 leading-snug">
                Tap a week row. Range details appear below after you pick.
              </p>

              <div className="space-y-0.5 mb-1.5">
                {calendarRows.map((row, rowIdx) => {
                  const rowWeek = row.week;
                  const rowKey = row.cells[0]?.weekKey;
                  const lim = rowWeek ? limitLabel(rowWeek) : null;
                  const isRowPending = !!pendingKey && rowKey === pendingKey;
                  const isRowConfirmed = !!confirmedKey && rowKey === confirmedKey;
                  const canPickRow = !!rowWeek?.bookable && !confirming;

                  return (
                    <div
                      key={`row-${rowIdx}-${rowKey}`}
                      role="button"
                      tabIndex={canPickRow ? 0 : -1}
                      aria-disabled={!canPickRow}
                      aria-pressed={isRowPending}
                      onClick={() => rowWeek && pickWeek(rowWeek)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && canPickRow) {
                          e.preventDefault();
                          pickWeek(rowWeek);
                        }
                      }}
                      title={
                        rowWeek
                          ? `${formatWeekRange(rowWeek.weekStart, rowWeek.weekEnd)} · ${lim}`
                          : undefined
                      }
                      className={`grid grid-cols-7 gap-px rounded-md overflow-hidden border transition-shadow ${
                        isRowPending
                          ? 'border-amber-500 ring-1 ring-amber-400/60'
                          : isRowConfirmed
                            ? 'border-emerald-400 ring-1 ring-emerald-300'
                            : row.spansMonths
                              ? 'border-amber-200/80'
                              : 'border-slate-200/80'
                      } ${rowWeek ? 'bg-slate-100/80' : 'bg-slate-50/50'} ${
                        canPickRow ? 'cursor-pointer hover:border-amber-300' : 'cursor-default'
                      }`}
                    >
                      {row.cells.map((cell) => (
                        <div
                          key={cell.date.toISOString()}
                          className={`
                          min-h-[34px] py-0.5 px-0 flex flex-col items-center justify-center gap-0 pointer-events-none
                          ${dayCellStyles({
                            inMonth: cell.inMonth,
                            week: cell.week,
                            isAdjacentMonth: cell.isAdjacentMonth,
                            isInPendingRange: isRowPending,
                            isInConfirmedRange: isRowConfirmed && !isRowPending,
                          })}
                        `}
                        >
                          <span
                            className={`leading-none tabular-nums ${
                              cell.inMonth
                                ? 'text-base font-bold'
                                : 'text-xs font-semibold text-slate-500'
                            }`}
                          >
                            {cell.date.getDate()}
                          </span>
                          {cell.week && lim && (
                            <span
                              className={`text-[7px] font-bold leading-none px-0.5 rounded tabular-nums ${
                                cell.week.bookable ? 'bg-black/10' : 'opacity-80'
                              } ${cell.isAdjacentMonth ? 'opacity-90' : ''}`}
                            >
                              {lim}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-100 px-2 py-1.5 bg-slate-50 space-y-1.5">
          <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-600">
            <span>
              <span className="inline-block w-2 h-2 rounded bg-emerald-200 mr-1" />
              Available
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded bg-amber-200 mr-1" />
              Limited
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded bg-red-100 mr-1" />
              Full
            </span>
          </div>

          {pendingWeek && <WeekRangePreview week={pendingWeek} weeksNeeded={weeksNeeded} compact />}
          {pendingWeek && (
            <p className="text-[11px] text-slate-700">
              <span className="font-bold tabular-nums text-amber-800">
                {pendingWeek.remaining}/{pendingWeek.capacity}
              </span>{' '}
              slots left this week
            </p>
          )}

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onClose}
              disabled={confirming}
              className="flex-1 rounded-md border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={!pendingWeek?.bookable || confirming}
              className="flex-1 rounded-md bg-primary py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? 'Checking…' : 'Confirm week'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
