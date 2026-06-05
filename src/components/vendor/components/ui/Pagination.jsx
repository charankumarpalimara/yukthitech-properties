import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (!totalItems) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  for (let i = left; i <= right; i++) pages.push(i);

  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1">
      <p className="text-xs font-semibold text-slate-500">
        Showing{' '}
        <span className="text-slate-800">
          {start}-{end}
        </span>{' '}
        of <span className="text-primary">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-0.5">
          {pages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-7 h-7 rounded-md text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                1
              </button>
              {pages[0] > 2 && (
                <span className="w-3 text-center text-slate-300 text-[10px]">..</span>
              )}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-7 h-7 px-1.5 rounded-sm text-xs font-semibold transition-all ${
                p === currentPage
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <span className="w-3 text-center text-slate-300 text-[10px]">..</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-7 h-7 rounded-md text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
