import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { Crown, MapPin, TrendingUp, Sparkles, Star } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const [activeTab, setActiveTab] = useState('buy');

  const tabs = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' },
    { id: 'plots', label: 'Plots' },
    { id: 'commercial', label: 'Commercial' },
  ];

  return (
    <section
      className="hero relative w-full bg-[#f8fafc] pb-8 sm:pb-12 md:pb-16 lg:pb-20 overflow-x-clip"
      role="region"
      aria-label="Hero search section"
    >
      {/* Background design elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[35%] sm:w-[40%] sm:h-[40%] rounded-full bg-[#023526]/5 blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[40%] sm:w-[50%] sm:h-[50%] rounded-full bg-[#c5a880]/5 blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.3] sm:opacity-[0.35] pointer-events-none"
        aria-hidden
      />

      <div className="max-w-[1350px] mx-auto px-[22px] w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 items-center">
        {/* Left Column: Headline and Search Console */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 md:space-y-8 text-left w-full max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#023526]/5 border border-[#023526]/10 text-[10px] sm:text-xs font-semibold text-[#023526] uppercase tracking-wider animate-[charSlideIn_0.5s_ease-out]">
            <Sparkles size={12} className="text-[#c5a880] sm:w-[13px] sm:h-[13px]" />
            Elite Real Estate Collection
          </div>

          {/* Headline */}
          <div className="space-y-2.5 sm:space-y-3">
            <h1 className="text-[1.85rem] leading-[1.12] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight">
              Find Your Next{' '}
              <span className="bg-gradient-to-r from-[#023526] via-[#047857] to-[#c5a880] bg-clip-text text-transparent block mt-1 sm:mt-1.5">
                Luxury Residence
              </span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl">
              Explore handpicked verified residential properties, premium villa plots, and
              high-yield commercial developments across India&apos;s top metros.
            </p>
          </div>

          {/* Search Console Card */}
          <div className="bg-white border border-slate-200/80 rounded-md sm:rounded-xl shadow-[0_12px_30px_rgba(2,53,38,0.06)] overflow-visible animate-[heroFadeUp_0.8s_ease-out_0.15s_both]">
            <div className="hero-search-tabs relative border-b border-slate-100 bg-slate-50/60">
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide px-3 sm:px-4 py-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-[#023526] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-4">
              <SearchBar variant="hero" />
            </div>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-5 border-t border-slate-200/50">
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-none">
                12K+
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5 sm:mt-2 leading-snug">
                Verified Listings
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-none">
                98%
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5 sm:mt-2 leading-snug">
                Client Satisfaction
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-none">
                24/7
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5 sm:mt-2 leading-snug">
                Expert Support
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Luxury Showcase — compact on mobile */}
        <div className="lg:col-span-5 relative w-full max-w-[min(100%,340px)] sm:max-w-md mx-auto lg:max-w-none flex items-center justify-center mt-1 sm:mt-2 lg:mt-0">
          <div className="relative w-full aspect-[16/10] sm:aspect-[5/4] lg:aspect-[4/5] max-h-[220px] sm:max-h-[320px] lg:max-h-none">
            {/* Main Visual Card */}
            <div className="relative w-full h-full rounded-xl sm:rounded-[20px] lg:rounded-[24px] overflow-hidden border border-slate-200/80 shadow-[0_16px_40px_rgba(0,0,0,0.08)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group">
              <img
                src="/banners/luxury_villa_hero.png"
                alt="Elite Luxury Villa Facade"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[12s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg bg-[#023526]/90 backdrop-blur-sm border border-emerald-500/20 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                  <Crown size={10} className="text-[#c5a880] sm:w-[11px] sm:h-[11px]" /> Verified
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 space-y-1 text-left">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10.5px] font-bold uppercase tracking-widest text-[#c5a880]">
                  <MapPin size={10} className="shrink-0 sm:w-[11px] sm:h-[11px]" /> Jubilee Hills
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight line-clamp-2">
                  Signature Modern Sunset Villa
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-1">
                  <span className="text-[10px] sm:text-xs font-light text-slate-300">
                    5 BHK · 7,200 sq.ft.
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white">₹12.5 Cr</span>
                </div>
              </div>
            </div>

            {/* Floating overlays — desktop/tablet only */}
            <div className="hidden md:flex absolute bottom-[8%] left-0 z-20 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-xl p-3.5 shadow-lg items-center gap-3 max-w-[200px] hover:-translate-y-1 transition duration-300 hero-float-card">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#023526] to-[#047857] flex items-center justify-center text-white shrink-0">
                <TrendingUp size={16} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Market Rate
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">+14.2% YoY</p>
              </div>
            </div>

            <div className="hidden md:block absolute top-[10%] right-0 z-20 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl p-3.5 shadow-lg max-w-[200px] space-y-1.5 hover:-translate-y-1 transition duration-300 hero-float-card-delay">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={10} fill="#c5a880" color="#c5a880" />
                ))}
              </div>
              <p className="text-[10px] italic text-slate-600 leading-relaxed font-light text-left line-clamp-3">
                &quot;Outstanding selection and rigorous verification process.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
