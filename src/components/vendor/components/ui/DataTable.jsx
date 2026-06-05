import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No records found',
  emptyIcon: EmptyIcon,
  onRowClick,
  className = '',
}) {
  return (
    <div className={`overflow-x-auto custom-scrollbar relative ${className}`}>
      {/* Smooth Loading Overlay for updates */}
      {loading && data?.length > 0 && (
        <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300 rounded-b-xl">
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-xl shadow-primary/10 border border-slate-100 flex items-center gap-3 animate-fade-in-up">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-md font-medium text-slate-500 pr-1">Updating view...</span>
          </div>
        </div>
      )}

      <table className="data-table w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={col.className || ''}
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={`divide-y divide-slate-50 transition-opacity duration-300 ${loading && data?.length > 0 ? 'opacity-40 pointer-events-none' : ''}`}
        >
          {loading && (!data || data.length === 0) ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-20 text-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40 mx-auto mb-4" />
                <span className="text-md font-medium text-slate-500">Loading Data...</span>
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center">
                {EmptyIcon && <EmptyIcon size={40} className="mx-auto mb-3 text-slate-200" />}
                <p className="text-md font-medium text-slate-500">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row._id || row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-slate-50/70 transition-all group ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={col.className || ''}>
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
