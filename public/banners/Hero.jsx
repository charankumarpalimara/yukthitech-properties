import SearchBar from '../SearchBar/SearchBar';
import './Hero.css'; // Minimal: keyframes + height media queries only

/** Font Awesome hand-point-down (index down, other fingers curled). */
function PointDownFingerIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 384 512"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M32 480c0 17.7 14.3 32 32 32s32-14.3 32-32V272H32V480zM224 320c0 17.7 14.3 32 32 32s32-14.3 32-32V256c0-17.7-14.3-32-32-32s-32 14.3-32 32v64zm-64 64c17.7 0 32-14.3 32-32V304c0-17.7-14.3-32-32-32s-32 14.3-32 32v48c0 17.7 14.3 32 32 32zm160-96c0 17.7 14.3 32 32 32s32-14.3 32-32V224c0-17.7-14.3-32-32-32s-32 14.3-32 32v64zm-96-88l.6 0c9.4-5.4 20.3-8.6 32-8.6c13.2 0 25.4 4 35.6 10.8c8.7-24.9 32.5-42.8 60.4-42.8c11.7 0 22.6 3.1 32 8.6V160C384 71.6 312.4 0 224 0H162.3C119.8 0 79.1 16.9 49.1 46.9L37.5 58.5C13.5 82.5 0 115.1 0 149v27c0 35.3 28.7 64 64 64h88c22.1 0 40-17.9 40-40s-17.9-40-40-40H96c-8.8 0-16-7.2-16-16s7.2-16 16-16h56c39.8 0 72 32.2 72 72z" />
    </svg>
  );
}

/** Public assets — encodeURI required because filenames contain spaces */
const HERO_BG_URL = encodeURI('/banners/clean_background_1248x832 copy.webp');
const HERO_FAMILY_URL = encodeURI('/family_1248x832_smaller_left (1) copy.webp');

const scrollToPromoBanners = () => {
  const promoStrip = document.querySelector('.home-promo-strip');
  if (promoStrip) {
    promoStrip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: Math.max(heroBottom - 8, 0), behavior: 'smooth' });
  }
};

export default function Hero() {
  const topAmberText = 'Legit, Hassle-free & Trusted';
  const bottomText = 'Property Listings';

  return (
    <section className="hero relative w-full flex-1 min-h-0 max-sm:min-h-0 md:min-h-[350px] flex items-center justify-end overflow-hidden max-sm:overflow-hidden lg:overflow-visible bg-[#f8fafc] z-[10] pt-[72px] max-sm:pt-[56px]">

      {/* Background image layer */}
      <div
        className="hero-bg-layer absolute inset-0 bg-cover bg-center z-[1]"
        style={{ backgroundImage: `url("/banners/clean_background_1248x832-1.webp")` }}
      />

      {/* Family overlay image — bottom-left */}
      <img
        src={HERO_FAMILY_URL}
        alt="Family Searching"
        className="hero-family-overlay absolute left-0 bottom-0 h-[90%] max-w-[48%] object-contain object-left-bottom z-[5] pointer-events-none transition-all duration-500 max-lg:h-[40%] max-lg:left-[2%] max-lg:bottom-[5%] max-lg:max-w-[55%] max-lg:opacity-15 max-md:h-[35%] max-md:opacity-10"
      />

      {/* Hero content — right-pinned on desktop, centered on tablet/mobile */}
      <div className="hero-content absolute right-6 lg:right-10 top-[55%] [transform:translateY(-50%)_perspective(1800px)] z-[20] w-[58%] max-w-[900px] text-center px-4 lg:px-[30px] transition-all duration-500 max-lg:relative max-lg:right-auto max-lg:top-auto max-lg:[transform:none] max-lg:w-[90%] max-lg:max-w-[640px] max-lg:mx-auto max-lg:px-5 max-lg:mt-5 max-md:w-[94%] max-md:px-3 max-[480px]:w-[96%] max-[480px]:px-2">

        {/* Title block */}
        <div className="mb-10 w-full flex flex-col items-end max-lg:items-center max-lg:mb-6 max-[480px]:mb-5">
          <div className="relative">
            {/* Animated text placed in normal flow */}
            <h1 className="relative text-[clamp(1.5rem,2.8vw,2.35rem)] font-semibold text-[#0f172a] leading-[1.12] tracking-[-0.02em] max-lg:text-[1.65rem] max-lg:text-white max-md:text-[1.45rem] max-[480px]:text-[1.3rem]">
              <span
                className="hero-title-line block text-left max-lg:text-center animate-[heroLineIn_0.55s_ease-out_forwards] opacity-0"
                style={{ animationDelay: '0ms' }}
              >
                Find <span className="text-amber-500">{topAmberText}</span>
              </span>
              <span
                className="hero-title-line block text-right max-lg:text-center animate-[heroLineIn_0.55s_ease-out_forwards] opacity-0"
                style={{ animationDelay: '180ms' }}
              >
                {bottomText}
              </span>
            </h1>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-[620px] ml-auto mr-0 max-lg:mx-auto max-lg:max-w-full relative z-[10] animate-[heroFadeUp_0.8s_ease-out_0.2s_both] rounded-2xl">
          <SearchBar />
        </div>

        {/* Scroll hint — below search, right; ring + finger points to promo banners */}
        <div className="flex justify-end mt-16 max-lg:mt-14 translate-y-12 max-lg:translate-y-10 max-lg:justify-center animate-[heroFadeUp_0.8s_ease-out_0.45s_both]">
          <button
            type="button"
            onClick={scrollToPromoBanners}
            aria-label="View promotional banners below"
            className="group relative flex h-[4.25rem] w-[4.25rem] items-center justify-center max-md:h-14 max-md:w-14 focus-visible:outline-none motion-reduce:transition-none"
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-40 motion-reduce:animate-none"
              aria-hidden
            />
            <span
              className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500 bg-white text-amber-600 shadow-[0_4px_14px_rgba(15,23,42,0.12),0_8px_20px_rgba(245,158,11,0.25)] transition-all duration-250 ease-out group-hover:-translate-y-0.5 group-hover:border-amber-600 group-hover:bg-amber-500 group-hover:text-slate-900 group-hover:shadow-[0_8px_22px_rgba(245,158,11,0.45),0_12px_28px_rgba(15,23,42,0.12)] group-focus-visible:ring-2 group-focus-visible:ring-amber-400 group-focus-visible:ring-offset-2 group-active:scale-[0.97] max-md:h-12 max-md:w-12"
            >
              <PointDownFingerIcon className="h-10 w-[1.65rem] shrink-0 translate-y-0.5 animate-bounce motion-reduce:animate-none max-md:h-9 max-md:w-6" />
            </span>
          </button>
        </div>
      </div>

    </section>
  );
}
