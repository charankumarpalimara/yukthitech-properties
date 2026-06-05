import React from 'react';
import { useUserPanelStore } from '../../store/userPanelStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { upOverviewIconActive } from './userPanelStyles';

export default function Overview() {
  const activities = useUserPanelStore((s) => s.activities);
  const wishlist = usePropertiesStore((state) => state.wishlist || []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: '❤️',
            styleClass: upOverviewIconActive,
            num: wishlist.length,
            label: 'Saved',
          },
          { icon: '🏠', bg: 'bg-blue-50', color: 'text-blue-500', num: 12, label: 'Viewed' },
          { icon: '🔍', bg: 'bg-emerald-50', color: 'text-emerald-500', num: 4, label: 'Searches' },
          { icon: '📧', bg: 'bg-red-50', color: 'text-red-500', num: 2, label: 'Enquiries' },
        ].map((s) => (
          <div
            className="bg-white border border-slate-100 rounded-xl p-5 text-center transition-all duration-200 hover:border-slate-200 hover:bg-slate-50/50"
            key={s.label}
          >
            <div
              className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center mx-auto mb-3 text-xl ${s.styleClass || `${s.bg} ${s.color}`}`}
            >
              {s.icon}
            </div>
            <div className="text-[1.6rem] font-semibold text-slate-900 leading-none mb-1">
              {s.num}
            </div>
            <div className="text-[0.75rem] text-slate-500 font-semibold uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[16px] p-[28px_32px] mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <div className="text-[1.15rem] font-semibold text-slate-900 mb-1.5 tracking-tight">
          Recent Activity
        </div>
        <div className="text-[0.88rem] text-slate-500 mb-6">
          Your latest interactions and updates
        </div>
        <div className="flex flex-col gap-3">
          {activities.map((a, i) => (
            <div
              className="flex items-center gap-4 p-[12px_16px] rounded-xl bg-white border border-slate-100 transition-all duration-200 hover:bg-slate-50/50 hover:border-slate-200"
              key={i}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 bg-slate-50 text-slate-500">
                {a.icon}
              </div>
              <div className="flex-1">
                <strong className="text-[0.88rem] font-semibold text-slate-900 block mb-[2px]">
                  {a.text}
                </strong>
                <span className="text-[0.78rem] text-slate-400">{a.time}</span>
              </div>
              <div className="text-[0.75rem] font-medium text-slate-400 whitespace-nowrap">
                {a.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
