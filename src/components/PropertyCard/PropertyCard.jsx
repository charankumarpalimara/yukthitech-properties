import { useAuthStore, openLoginModal } from '../../store/authStore';
import { useState, memo, useEffect, createContext, useContext } from 'react';
import './PropertyCard.css';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { usePropertiesStore } from '../../store/propertiesStore';
import { PinIco } from '../../data/icons';
import {
  buildPropertyCardSrcSet,
  PROPERTY_CARD_SIZES,
  resolvePropertyCardImage,
} from '../../utils/imageSizes';
import { resolvePropertyImage } from '../../utils/share';
import { slugOrId } from '../../utils/slugOrId';
import { resolvePropertyPrice } from './PropertyHoverPreview';
import {
  getPropertyYoutubeId,
  getPropertyYoutubeVideoUrl,
  isYouTubeShortUrl,
  youtubeCardIframeStyle,
  youtubeEmbedUrl,
} from '../../utils/youtube';
import { usePropertyCardCarouselPause } from './PropertyCardCarouselPauseContext';
import { getCompletionPercentage, shouldShowCompletionBadge } from '../../utils/propertyCompletion';
import { ShieldCheck, Heart, Forward, CircleCheck } from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
// 1. HEART BURST PARTICLE EFFECT
// ══════════════════════════════════════════════════════════════════════════════

const HeartBurst = memo(function HeartBurst({ x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [onDone]);

  return createPortal(
    <>
      <div style={{ position: 'fixed', top: y, left: x, pointerEvents: 'none', zIndex: 10000 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="hb-p"
            style={{ animationName: `hbp${i}`, animationDelay: `${i * 25}ms` }}
          >
            ❤️
          </div>
        ))}
      </div>
    </>,
    document.body
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. PROPERTY CARD SHELL WRAPPER
// ══════════════════════════════════════════════════════════════════════════════

const isCardActionTarget = (target) =>
  target instanceof Element && Boolean(target.closest('[data-card-action]'));

const PropertyCardHoverContext = createContext(false);

const PropertyCardShell = memo(function PropertyCardShell({
  children,
  className,
  onClick,
  onMouseEnterExtra,
  onMouseLeaveExtra,
  ...rest
}) {
  const setCarouselPaused = usePropertyCardCarouselPause();
  const [cardHovered, setCardHovered] = useState(false);

  const handleMouseEnter = (e) => {
    setCardHovered(true);
    if (!isCardActionTarget(e.target)) setCarouselPaused?.(true);
    onMouseEnterExtra?.(e);
  };

  const handleMouseLeave = (e) => {
    const next = e.relatedTarget;
    if (next && e.currentTarget.contains(next)) return;
    setCardHovered(false);
    onMouseLeaveExtra?.(e);
    setCarouselPaused?.(false);
  };

  useEffect(() => () => setCarouselPaused?.(false), [setCarouselPaused]);

  return (
    <PropertyCardHoverContext.Provider value={cardHovered}>
      <div
        className={className}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        {children}
      </div>
    </PropertyCardHoverContext.Provider>
  );
});

/** Card image: poster by default; on hover play YouTube or zoom image */
const PropertyCardMedia = memo(function PropertyCardMedia({
  property,
  imageSrc,
  imageSrcSet,
  imageSizes,
  alt,
  className = '',
  previewVideoOnHover = true,
  children,
}) {
  const cardHovered = useContext(PropertyCardHoverContext);
  const youtubeId = previewVideoOnHover ? getPropertyYoutubeId(property) : null;
  const videoUrl = previewVideoOnHover ? getPropertyYoutubeVideoUrl(property) : null;
  const isShort = isYouTubeShortUrl(videoUrl);
  const hasVideo = Boolean(youtubeId);
  const embedSrc =
    hasVideo && cardHovered ? youtubeEmbedUrl(youtubeId, { chromeless: true }) : null;

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${className}`.trim()}>
      <img
        src={imageSrc}
        srcSet={imageSrcSet}
        sizes={imageSizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`relative z-0 h-full w-full object-cover object-center origin-center transition-transform duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${cardHovered && !hasVideo ? 'scale-[1.06]' : 'scale-100'
          } ${hasVideo && cardHovered ? 'scale-[1.02]' : ''}`}
      />

      {hasVideo && cardHovered && embedSrc && (
        <div className="absolute inset-0 z-[2] overflow-hidden bg-neutral-900 animate-[cardMediaIn_0.45s_ease-out_both]">
          <iframe
            title={`${alt} video preview`}
            src={embedSrc}
            className="pointer-events-none h-full w-full border-0"
            style={youtubeCardIframeStyle(isShort)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      <div
        className={`pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/35 via-black/5 to-transparent transition-opacity duration-500 ease-out ${cardHovered ? 'opacity-100' : 'opacity-0'
          }`}
        aria-hidden="true"
      />

      {children}
    </div>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. MAIN PROPERTYCARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

/** Shared listing card typography (home feed + properties grid). */
const listingCardTypography = () => ({
  price: 'text-xl font-bold text-slate-900 tracking-tight leading-tight antialiased',
  title: 'text-[15px] font-semibold text-slate-800 leading-snug line-clamp-2 antialiased',
  loc: 'text-[13px] text-slate-500 flex items-center gap-1.5 font-medium leading-snug antialiased',
});

const CARD_BODY = 'px-4 py-4 flex-1 flex flex-col gap-1.5 min-h-0 font-sans';

const getVerificationStyle = (pct) => {
  if (pct >= 90) {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      text: 'text-emerald-700',
      iconColor: '#059669', // emerald-600
      label: 'Verified',
    };
  }
  if (pct >= 70) {
    return {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
      text: 'text-blue-700',
      iconColor: '#2563eb', // blue-600
      label: 'Verified',
    };
  }
  if (pct >= 50) {
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      text: 'text-amber-700',
      iconColor: '#d97706', // amber-600
      label: 'Medium Trust',
    };
  }
  return {
    bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
    text: 'text-rose-700',
    iconColor: '#e11d48', // rose-600
    label: 'Basic',
  };
};

const ICON_BTN =
  'flex h-7 w-7 items-center justify-center rounded-full border-0 bg-white/95 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.14)] transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95';

const CardActionBar = memo(function CardActionBar({ isWished, pulsing, copied, onWish, onShare }) {
  return (
    <div data-card-action className="absolute bottom-2.5 right-2.5 z-[5] flex flex-col gap-1">
      <button
        type="button"
        onClick={onWish}
        aria-label={isWished ? 'Remove from saved' : 'Save property'}
        aria-pressed={isWished}
        className={`${ICON_BTN} relative text-slate-600 hover:text-rose-500 ${isWished ? 'text-rose-500' : ''
          }`}
      >
        {pulsing && (
          <span className="pointer-events-none absolute inset-0 rounded-full border border-rose-400/50 animate-ping" />
        )}
        <Heart
          size={14}
          strokeWidth={2}
          className={`relative z-[1] transition-all duration-200 ${isWished ? 'fill-rose-500 text-rose-500' : ''
            } ${pulsing ? 'scale-110' : ''}`}
        />
      </button>

      <button
        type="button"
        onClick={onShare}
        aria-label={copied ? 'Link copied' : 'Share property'}
        className={`${ICON_BTN} ${copied ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'}`}
      >
        {copied ? (
          <CircleCheck size={14} strokeWidth={2.25} />
        ) : (
          <Forward size={14} strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
});

function PropertyCard({ property, variant = 'vertical', typography = 'default' }) {
  const isHomeCard = typography === 'home';
  const typo = listingCardTypography();

  const navigate = useNavigate();
  const propertyId = property.id || property._id;
  const isWished = usePropertiesStore((state) => (state.wishlist || []).includes(propertyId));
  const toggleWishlist = usePropertiesStore((state) => state.toggleWishlist);
  const shareProperty = usePropertiesStore((state) => state.shareProperty);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [copied, setCopied] = useState(false);

  // Heart burst & pulse states
  const [burst, setBurst] = useState(null); // {x, y} | null
  const [pulsing, setPulsing] = useState(false);

  const price = resolvePropertyPrice(property);
  const rawLoc =
    property.loc ||
    (typeof property.address === 'string'
      ? property.address
      : property.address?.addressLine1 || property.address?.city) ||
    'Nearby';

  const loc = typeof rawLoc === 'string' ? rawLoc : 'Nearby';
  const displayLoc = loc.split(',')[0] || loc;
  const dist = property?.distance;
  const distanceKm =
    dist != null && dist !== '' && !Number.isNaN(Number(dist)) ? Number(dist) : null;
  const completionPct = getCompletionPercentage(property);
  const showCompletionBadge = shouldShowCompletionBadge(property);
  const locationLine =
    distanceKm != null ? `${distanceKm.toFixed(1)} km away · ${displayLoc}` : displayLoc;

  const handleShare = (e) => {
    e.stopPropagation();
    shareProperty(property, setCopied);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const isAuthenticated = isLoggedIn || !!token;
    const userId = user?._id || user?.id || JSON.parse(localStorage.getItem('user'))?._id;

    if (isAuthenticated && userId) {
      toggleWishlist(propertyId, userId);
      // Heart burst from button center
      const r = e.currentTarget.getBoundingClientRect();
      setBurst({ x: r.left + r.width / 2 - 7, y: r.top + r.height / 2 - 7 });
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    } else {
      openLoginModal('Please login to save properties to your wishlist.');
    }
  };

  const handleClick = () => navigate(`/property/${slugOrId(property)}`);
  const preloadDetails = () => import('../../pages/PropertyDetails');
  const imageSrc = isHomeCard
    ? resolvePropertyCardImage(property, resolvePropertyImage(property))
    : resolvePropertyImage(property);
  const imageSrcSet = isHomeCard ? buildPropertyCardSrcSet(property) : undefined;
  const imageSizes = isHomeCard ? PROPERTY_CARD_SIZES : undefined;
  const displayTitle = property.title || property.projectName || 'Property';

  // land | horizontal | list | listv2 | localities | variation2 | variation3 → vertical only
  void variant;

  // VERTICAL CARD
  return (
    <>
      {burst && <HeartBurst x={burst.x} y={burst.y} onDone={() => setBurst(null)} />}
      <PropertyCardShell
        className="group/card font-sans flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-gold-400/25 hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] hover:ring-1 hover:ring-gold-400/20"
        onClick={handleClick}
        onMouseEnterExtra={preloadDetails}
      >
        <PropertyCardMedia
          property={property}
          imageSrc={imageSrc}
          imageSrcSet={imageSrcSet}
          imageSizes={imageSizes}
          alt={displayTitle}
          previewVideoOnHover={!isHomeCard}
          className="relative h-[180px] shrink-0 sm:h-[190px] max-sm:h-[140px]"
        >
          {/* ── Completion badge — top-left of image ── */}
          {showCompletionBadge && (() => {
            const style = getVerificationStyle(completionPct);
            const pillColors = {
              emerald: 'bg-emerald-500/90 text-white',
              blue: 'bg-blue-500/90 text-white',
              amber: 'bg-amber-500/90 text-white',
              rose: 'bg-rose-500/90 text-white',
            };
            const pillColor =
              completionPct >= 90 ? pillColors.emerald :
                completionPct >= 70 ? pillColors.blue :
                  completionPct >= 50 ? pillColors.amber :
                    pillColors.rose;
            return (
              <div
                className={`absolute top-2.5 left-2.5 z-[6] inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm shadow-md ${pillColor}`}
                aria-label={`${completionPct}% verified`}
              >
                {/* Tick circle icon */}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" className="shrink-0">
                  <circle cx="5.5" cy="5.5" r="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="rgba(255,255,255,0.25)" />
                  <polyline points="3,5.5 5,7.5 8.5,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{completionPct}%</span>
              </div>
            );
          })()}

          <CardActionBar
            isWished={isWished}
            pulsing={pulsing}
            copied={copied}
            onWish={handleWish}
            onShare={handleShare}
          />
        </PropertyCardMedia>

        <div className={CARD_BODY}>
          <div
            className={`${typo.price} transition-colors duration-300 group-hover/card:text-slate-950`}
          >
            {price}
          </div>
          <h3
            className={`${typo.title} m-0 capitalize transition-colors duration-300 group-hover/card:text-slate-900`}
            title={displayTitle}
          >
            {displayTitle}
          </h3>
          <div className={`${typo.loc} mt-auto pt-1`}>
            <PinIco className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="line-clamp-1">{locationLine}</span>
          </div>
        </div>
      </PropertyCardShell>
    </>
  );
}

export default memo(PropertyCard);
