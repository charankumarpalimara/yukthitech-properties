import { ArrowRight, Building2, Crown, MapPin, Sparkles } from 'lucide-react';

const ICONS = {
  sparkles: Sparkles,
  map: MapPin,
  building: Building2,
  crown: Crown,
};

function BannerImage({ banner, className = '' }) {
  const web = banner.image;
  const mobile = banner.imageMobile || web;
  if (!web) return null;

  return (
    <picture className={className}>
      {mobile && mobile !== web ? (
        <source media="(max-width: 639px)" srcSet={mobile} />
      ) : null}
      <img
        src={web}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}

function BannerTag({ children }) {
  return (
    <span className="inline-block rounded-full border border-gold/30 bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
      {children}
    </span>
  );
}

function BannerCta({ children, variant = 'light' }) {
  const styles =
    variant === 'gold'
      ? 'bg-gold text-primary hover:bg-gold-200'
      : 'bg-white text-primary hover:bg-gold-50';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-colors ${styles}`}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

function SplitRightLayout({ banner, Icon }) {
  return (
    <div className="grid min-h-[148px] overflow-hidden rounded-xl border border-primary/10 bg-primary sm:min-h-[168px] sm:rounded-2xl lg:grid-cols-[1fr_42%]">
      <div className="relative z-10 flex flex-col justify-center gap-3 p-5 sm:p-6 lg:p-8">
        <BannerTag>{banner.tag}</BannerTag>
        <div>
          <p className="m-0 text-lg font-extrabold leading-snug text-white sm:text-xl">{banner.title}</p>
          <p className="m-0 mt-1.5 text-xs leading-relaxed text-white/70 sm:text-sm">{banner.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div>
            <span className="block text-base font-extrabold text-gold sm:text-lg">{banner.highlight}</span>
            {banner.highlightSub ? (
              <span className="text-[11px] font-medium text-white/50">{banner.highlightSub}</span>
            ) : null}
          </div>
          <BannerCta>{banner.cta}</BannerCta>
        </div>
      </div>
      <div className="relative min-h-[120px] overflow-hidden sm:min-h-0">
        <BannerImage banner={banner} className="block h-full min-h-[120px] w-full sm:min-h-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary via-primary/20 to-transparent lg:from-primary/80" />
        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm sm:left-5 sm:top-5">
          <Icon className="h-5 w-5 text-gold" strokeWidth={2} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function OverlayLayout({ banner, Icon }) {
  return (
    <div className="relative min-h-[160px] overflow-hidden rounded-xl border border-primary/15 sm:min-h-[180px] sm:rounded-2xl">
      <BannerImage banner={banner} className="absolute inset-0 block h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#011f16]/95 via-primary/75 to-primary/25" />
      <div className="relative z-10 flex h-full min-h-[160px] flex-col justify-between gap-4 p-5 sm:min-h-[180px] sm:flex-row sm:items-center sm:p-7">
        <div className="max-w-xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
              <Icon className="h-4 w-4 text-emerald-300" strokeWidth={2} aria-hidden />
            </span>
            <BannerTag>{banner.tag}</BannerTag>
          </div>
          <p className="m-0 text-lg font-extrabold leading-snug text-white sm:text-xl">{banner.title}</p>
          <p className="m-0 mt-2 text-xs leading-relaxed text-white/75 sm:text-sm">{banner.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-row items-center gap-4 sm:flex-col sm:items-end sm:text-right">
          <div>
            <span className="block text-lg font-extrabold text-emerald-200">{banner.highlight}</span>
            {banner.highlightSub ? (
              <span className="text-[11px] font-medium text-white/50">{banner.highlightSub}</span>
            ) : null}
          </div>
          <BannerCta variant="light">{banner.cta}</BannerCta>
        </div>
      </div>
    </div>
  );
}

function SplitLeftLayout({ banner, Icon }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gold/20 bg-[#011f16] shadow-[0_16px_40px_-20px_rgba(2,53,38,0.45)] sm:rounded-2xl">
      <div className="grid min-h-[148px] lg:grid-cols-[38%_1fr]">
        <div className="relative min-h-[140px] overflow-hidden lg:min-h-full">
          <BannerImage banner={banner} className="block h-full min-h-[140px] w-full lg:min-h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#011f16]/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#011f16]/40" />
        </div>
        <div className="flex flex-col justify-center gap-3 border-t border-gold/15 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:pl-8">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gold" strokeWidth={2} aria-hidden />
            <BannerTag>{banner.tag}</BannerTag>
          </div>
          <p className="m-0 text-lg font-extrabold leading-snug text-white sm:text-xl">{banner.title}</p>
          <p className="m-0 text-xs leading-relaxed text-white/65 sm:text-sm">{banner.subtitle}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div>
              <span className="block text-base font-extrabold text-gold">{banner.highlight}</span>
              {banner.highlightSub ? (
                <span className="text-[11px] text-white/45">{banner.highlightSub}</span>
              ) : null}
            </div>
            <BannerCta variant="gold">{banner.cta}</BannerCta>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactLayout({ banner, Icon }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <div className="relative h-[120px] shrink-0 overflow-hidden sm:h-auto sm:w-[200px] lg:w-[240px]">
          <BannerImage banner={banner} className="block h-full w-full" />
          <div className="absolute inset-0 bg-primary/20" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{banner.tag}</span>
          </div>
          <p className="m-0 text-base font-extrabold leading-snug text-slate-900 sm:text-lg">{banner.title}</p>
          <p className="m-0 text-xs leading-relaxed text-slate-500 sm:text-sm">{banner.subtitle}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div>
              <span className="text-sm font-extrabold text-primary">{banner.highlight}</span>
              {banner.highlightSub ? (
                <span className="ml-2 text-[11px] text-slate-400">{banner.highlightSub}</span>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
              {banner.cta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const LAYOUTS = {
  'split-right': SplitRightLayout,
  overlay: OverlayLayout,
  'split-left': SplitLeftLayout,
  compact: CompactLayout,
};

export default function CodedBannerArt({ banner }) {
  const Icon = ICONS[banner.icon] || Sparkles;
  const Layout = LAYOUTS[banner.layout] || SplitRightLayout;
  return <Layout banner={banner} Icon={Icon} />;
}
