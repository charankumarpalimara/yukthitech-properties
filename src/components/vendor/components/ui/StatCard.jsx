import {
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Building2,
  IndianRupee,
  BarChart3,
  MessageCircle,
  UserCog,
} from 'lucide-react';

const iconMap = {
  users: Users,
  star: Star,
  building: Building2,
  rupee: IndianRupee,
  chart: BarChart3,
  message: MessageCircle,
  staff: UserCog,
  'trending-up': TrendingUp,
};

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-100' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-100' },
  purple: { bg: 'bg-violet-50', icon: 'text-violet-500', border: 'border-violet-100' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-500', border: 'border-rose-100' },
};

export default function StatCard({ label, value, change, trend, icon }) {
  const Icon = iconMap[icon] || BarChart3;
  const isUp = trend === 'up';

  return (
    <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-gold/30 transition-all duration-300 group">
      {/* Brand accent top border bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-gold to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-slate-500 tracking-tight">{label}</p>
        <div
          className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/25"
        >
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-900 tabular-nums leading-none tracking-tight">{value}</p>
          <div className="flex items-center gap-2 mt-3.5">
            {change && (
              <span
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${isUp ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-rose-50 text-rose-600 border-rose-200/60'}`}
              >
                {isUp ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                {change}
              </span>
            )}
            <span className="text-xs font-medium text-slate-400">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
