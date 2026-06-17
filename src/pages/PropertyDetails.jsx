import { useAuthStore, openLoginModal, getMe } from '../store/authStore';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Loader from '../components/Loader/Loader';
import { slugOrId } from '../utils/slugOrId';
import {
  formatDevelopmentRatio,
  getDevelopmentShare,
  isLandForDevelopmentType,
} from '../utils/developmentShare';
import { usePropertiesStore } from '../store/propertiesStore';
import { usePropertyDetails } from '../hooks/usePropertiesQuery';
import { formatCityName } from '../utils/formatCityName';
import {
  PinIco,
  AreaIco,
  SearchIco,
  ChevronL,
  IconCheckCircle,
  ArrowR,
  ChevronR,
} from '../data/icons';
import { Heart } from 'lucide-react';
import { getPropertyShareUrl, getImageUrl } from '../utils/share';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './PropertyDetails.css';

/** Public property details — brand-aligned layout tokens */
const PD_PAGE =
  'property-details-page min-h-screen bg-[#f8fafc] text-slate-800 pb-20 lg:pb-12 font-sans antialiased text-[15px] md:text-base';
const PD_HEADER =
  'flex flex-col sm:flex-row sm:items-center justify-between bg-white px-5 py-4 my-3 rounded-md border border-slate-100 shadow-sm gap-4';
const PD_PANEL = 'bg-white rounded-md border border-slate-100 shadow-sm';
const PD_SECTION =
  'text-base font-semibold text-slate-900 tracking-tight pb-2.5 mb-4 border-b border-slate-100 flex items-center gap-2';
const PD_SECTION_ACCENT = 'w-[3px] h-4 bg-gold rounded-full shrink-0';
const PD_BTN_GHOST =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 text-sm font-semibold transition-all cursor-pointer shrink-0';
const PD_BADGE =
  'px-2.5 py-0.5 rounded-sm text-xs font-semibold uppercase tracking-wider border';
const PD_BADGE_PRIMARY = `${PD_BADGE} bg-primary/10 text-primary border-primary/15`;
const PD_BADGE_GOLD = `${PD_BADGE} bg-gold-50 text-gold-700 border-gold-200/60`;
const PD_SPEC_ROW =
  'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 border-b border-slate-50 last:border-0 text-sm';
const PD_HIGHLIGHT_ICON =
  'w-6 h-6 shrink-0 rounded-sm bg-primary/8 border border-primary/10 text-primary flex items-center justify-center [&_svg]:w-3.5 [&_svg]:h-3.5';

const AmenityIcon = ({ name }) => {
  const t = name.toLowerCase();

  // Residential / Living
  if (t.includes('gym') || t.includes('fitness'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.4 14.4 9.6 9.6" />
        <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
        <path d="m21.5 21.5-1.4-1.4" />
        <path d="M3.9 3.9 2.5 2.5" />
        <path d="M6.404 2.768a2 2 0 1 1 2.829 2.829l1.768-1.767a2 2 0 1 1 2.828 2.829L7.465 13.023a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.829-2.829z" />
      </svg>
    );
  if (t.includes('pool') || t.includes('swim'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 6c.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6" />
        <path d="M2 12c.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6" />
        <path d="M2 18c.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6.6 0 1.2-.2 1.7-.6.9-.8 2.5-.8 3.4 0 .5.4 1.1.6 1.7.6" />
      </svg>
    );
  if (t.includes('parking') || t.includes('car'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="3" width="22" height="13" rx="2" ry="2" />
        <path d="M7 21h0" />
        <path d="M17 21h0" />
        <path d="M12 16v5" />
      </svg>
    );
  if (t.includes('washroom') || t.includes('bath'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 4 8 6" />
        <path d="M17 19v2" />
        <path d="M2 12h20" />
        <path d="M7 19v2" />
        <path d="M9 5 7.6 3.6a2 2 0 0 0-2.8 2.8" />
        <path d="M4 12v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      </svg>
    );
  if (t.includes('bed'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
      </svg>
    );
  if (t.includes('kitchen'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    );
  if (t.includes('livving') || t.includes('living') || t.includes('sofa'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5c0 1.1-.9 2-2 2" />
        <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
      </svg>
    );

  // Land / Commercial Specific
  if (t.includes('water'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7Z" />
      </svg>
    );
  if (t.includes('secur') || t.includes('cctv') || t.includes('guard'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  if (t.includes('power') || t.includes('electric') || t.includes('backup'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
      </svg>
    );
  if (t.includes('boundary') || t.includes('fenc') || t.includes('wall'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12h18" />
        <path d="M3 18h18" />
        <path d="M3 6h18" />
        <path d="M5 3v18" />
        <path d="M19 3v18" />
      </svg>
    );
  if (t.includes('road') || t.includes('access'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="8" x="2" y="8" rx="2" />
        <path d="M17 12h.01" />
        <path d="M12 12h.01" />
        <path d="M7 12h.01" />
      </svg>
    );
  if (t.includes('garden') || t.includes('park') || t.includes('greenery'))
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19c-4 0-7 3-7 3" />
        <path d="M12 19c4 0 7 3 7 3" />
      </svg>
    );

  // Default Fallback
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m22 4-10 10.01-3-3" />
    </svg>
  );
};

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.528 5.845L.057 23.428a.5.5 0 0 0 .609.61l5.657-1.484A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.732.979.996-3.648-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.566 6.566 2.182 12 2.182S21.818 6.566 21.818 12 17.434 21.818 12 21.818z" />
  </svg>
);

const whatsAppContactBtnClass =
  'rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] border border-[#25D366]/25 text-[#25D366] hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95';

const formatAddressDisplay = (value) => {
  if (!value) return '';
  return String(value)
    .split(',')
    .map((segment) => formatCityName(segment.trim()))
    .filter(Boolean)
    .join(', ');
};

const formatPropertyAddressLine = (property) => {
  const parts = [property?.address?.addressLine1, property?.address?.city].filter(Boolean);
  if (parts.length) return parts.map(formatAddressDisplay).join(', ');
  const fallback = property?.loc || property?.location?.locality;
  return fallback ? formatAddressDisplay(fallback) : '';
};

const openWhatsAppChat = (phone, message) => {
  if (!phone) return;
  window.open(
    `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
    '_blank'
  );
};

const YOUTUBE_ID_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|user\/\S+|live\/))([\w-]{11})/;

const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  return url.match(YOUTUBE_ID_RE)?.[1] || null;
};

/** Gallery: poster + YouTube video (if any) + photos. Uploaded MP4 is not shown in the gallery. */
const buildPropertyMediaItems = (property) => {
  const media = property?.media || {};
  const photos = (media.photos || property?.images || []).filter(Boolean);
  const items = [];
  const seenUrls = new Set();

  const addImage = (url) => {
    if (!url) return;
    const resolvedUrl = getImageUrl(url);
    if (seenUrls.has(resolvedUrl)) return;
    seenUrls.add(resolvedUrl);
    items.push({ type: 'image', url: resolvedUrl });
  };

  const poster = property?.poster || media.poster || property?.coverPhoto || property?.img;
  if (poster) addImage(poster);

  const youtubeId = extractYouTubeId(media.youtubevideo);
  if (youtubeId) {
    items.push({
      type: 'video',
      url: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      videoId: youtubeId,
    });
  }

  photos.forEach((url) => addImage(url));

  return items;
};

const buildSiteVisitWhatsAppMessage = (property, user) => {
  const title = property?.title || property?.projectName || 'Property';
  const location = formatPropertyAddressLine(property) || property?.city || '—';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const userName = user?.name || 'User';
  const userContact = user?.mobile || user?.email || '—';

  return `Hi, I would like to schedule a site visit through Yukthi Properties.

Property: ${title}
Location: ${location}
Listing: ${url}

My details:
Name: ${userName}
Contact: ${userContact}

I am interested in visiting this property. Please share available dates and timings for a site visit.

Thank you.`;
};

const normalizeDocUrls = (value) => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
};

const isPdfUrl = (url) => /\.pdf(\?|#|$)/i.test(url || '') || /\/raw\/upload\//i.test(url || '');

const DocFileIcon = ({ size = 10 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const DOC_VIEW_BTN_CLASS =
  'px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary text-xs font-semibold rounded-sm transition-all shadow-sm shrink-0 flex items-center gap-1 cursor-pointer';

const DOC_ICON_BTN_CLASS =
  'w-7 h-7 rounded-full bg-white border flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer';

const getListingTypeMeta = (property) => {
  const raw = String(property?.listingType || '').toLowerCase();
  if (raw.includes('featured')) {
    return {
      label: 'Featured Listing',
      className: 'bg-primary/10 text-primary border border-primary/20',
      foldClassName: 'border-t-primary-dark',
    };
  }
  return {
    label: 'Premium Listing',
    className: 'bg-gold-50 text-gold-700 border border-gold-200/60',
    foldClassName: 'border-t-gold-600',
  };
};

const LISTING_RIBBON_BASE =
  'relative inline-flex items-center rounded-bl-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider shadow-[0_6px_18px_rgba(15,23,42,0.16)]';

const PropertyDetailsEdgeRibbon = ({ listingTypeMeta }) => (
  <span className={`${LISTING_RIBBON_BASE} ${listingTypeMeta.className}`}>
    {listingTypeMeta.label}
    <span
      aria-hidden="true"
      className={`absolute right-0 top-full h-0 w-0 border-l-[7px] border-t-[7px] border-l-transparent ${listingTypeMeta.foldClassName}`}
    />
  </span>
);

const BURST_CSS = `
  @keyframes hbp0{to{transform:translate(-36px,-64px) scale(0);opacity:0}}
  @keyframes hbp1{to{transform:translate(0,-76px) scale(0);opacity:0}}
  @keyframes hbp2{to{transform:translate(36px,-64px) scale(0);opacity:0}}
  @keyframes hbp3{to{transform:translate(56px,-18px) scale(0);opacity:0}}
  @keyframes hbp4{to{transform:translate(36px,30px) scale(0);opacity:0}}
  @keyframes hbp5{to{transform:translate(-36px,30px) scale(0);opacity:0}}
  @keyframes hbp6{to{transform:translate(-56px,-18px) scale(0);opacity:0}}
  @keyframes hbp7{to{transform:translate(-14px,-88px) scale(0.4);opacity:0}}
  .hb-p{position:absolute;font-size:13px;animation-duration:0.75s;animation-fill-mode:forwards;animation-timing-function:ease-out;pointer-events:none;}
`;

const HeartBurst = ({ x, y, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [onDone]);

  return createPortal(
    <>
      <style>{BURST_CSS}</style>
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
};

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [docPreview, setDocPreview] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const enquiryRef = useRef(null);

  // Wishlist Pop states
  const [burst, setBurst] = useState(null); // {x, y} | null
  const [pulsing, setPulsing] = useState(false);

  const scrollToEnquiry = () => {
    enquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const wishlist = usePropertiesStore((s) => s.wishlist);
  const toggleWishlist = usePropertiesStore((s) => s.toggleWishlist);
  const shareProperty = usePropertiesStore((s) => s.shareProperty);
  const recordShare = usePropertiesStore((s) => s.recordShare);
  const mergeShareCountsFromProperties = usePropertiesStore(
    (s) => s.mergeShareCountsFromProperties
  );

  const { data: property, isLoading: loading, error: queryError } = usePropertyDetails(id);
  const error = queryError?.message || null;

  const propertyMongoId = property?._id || property?.id;
  const shareUrl = property ? getPropertyShareUrl(property) : '';

  const handleWishlist = (e) => {
    e.stopPropagation();
    const currentUserId =
      user?._id ||
      user?.id ||
      JSON.parse(localStorage.getItem('user'))?._id ||
      JSON.parse(localStorage.getItem('user'))?.id;

    if (!propertyMongoId) return;

    if (currentUserId) {
      toggleWishlist(propertyMongoId, currentUserId);

      const r = e.currentTarget.getBoundingClientRect();
      setBurst({ x: r.left + r.width / 2 - 7, y: r.top + r.height / 2 - 7 });
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    } else {
      openLoginModal('Please login to save properties to your wishlist.');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (property) mergeShareCountsFromProperties([property]);
  }, [property, mergeShareCountsFromProperties]);

  // Canonical slug in URL without React Router navigation (avoids double API fetch)
  useEffect(() => {
    if (!property?.slug) return;
    const segment = slugOrId(property);
    if (segment && id !== segment) {
      window.history.replaceState(null, '', `/property/${segment}`);
    }
  }, [property, id]);

  const openDocPreview = (title, urls, index = 0) => {
    const list = normalizeDocUrls(urls);
    if (!list.length) return;
    setDocPreview({
      title,
      urls: list,
      index: Math.min(Math.max(index, 0), list.length - 1),
    });
  };

  const closeDocPreview = () => setDocPreview(null);

  useEffect(() => {
    if (!docPreview) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeDocPreview();
      if (docPreview.urls.length > 1 && e.key === 'ArrowLeft') {
        setDocPreview((prev) =>
          prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : null
        );
      }
      if (docPreview.urls.length > 1 && e.key === 'ArrowRight') {
        setDocPreview((prev) =>
          prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : null
        );
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [docPreview]);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [property?._id]);

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(!!window.google);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google) {
      const interval = setInterval(() => {
        if (window.google) {
          setGoogleMapsLoaded(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (
      googleMapsLoaded &&
      property?.address?.location?.coordinates?.length > 0 &&
      mapRef.current
    ) {
      const lat = property.address.location.coordinates[1];
      const lng = property.address.location.coordinates[0];
      const center = { lat, lng };

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 15,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        });

        // Main property marker
        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          title: property.title,
        });

        const infowindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family: 'DM Sans', system-ui, sans-serif; color: #0f172a; padding: 2px;"><strong>${property.title}</strong></div>`,
        });

        marker.addListener('click', () => {
          infowindow.open({
            anchor: marker,
            map,
          });
        });

        // Add location advantages if present
        if (property.locationAdvantages) {
          property.locationAdvantages.forEach((adv) => {
            if (adv.lat && adv.lng) {
              const advMarker = new window.google.maps.Marker({
                position: { lat: adv.lat, lng: adv.lng },
                map: map,
                title: adv.name,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                },
              });

              const advInfoWindow = new window.google.maps.InfoWindow({
                content: `<div style="font-family: 'DM Sans', system-ui, sans-serif; color: #0f172a; padding: 2px;"><strong>${adv.name}</strong></div>`,
              });

              advMarker.addListener('click', () => {
                advInfoWindow.open({
                  anchor: advMarker,
                  map,
                });
              });
            }
          });
        }
      } catch (err) {
        console.error('Error rendering Google Map:', err);
      }
    }
  }, [googleMapsLoaded, property]);

  const relatedProperties = useMemo(() => [], []);

  if (loading) return <Loader fullScreen text="Opening premium property details..." />;
  if (error || !property)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <div className="text-rose-500 font-semibold">
          {error ? `Error: ${error}` : 'Property not found'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-primary text-white rounded-md font-semibold"
        >
          Go Back
        </button>
      </div>
    );

  const listingOwner =
    property.userId && typeof property.userId === 'object'
      ? {
          name: property.userId.name || 'Property Owner',
          email: property.userId.email,
          mobile: property.userId.mobile,
          type: property.userId.type,
          avatar: property.userId.avatar,
        }
      : null;

  const listingOwnerTypeLabel = listingOwner?.type
    ? `${listingOwner.type.charAt(0).toUpperCase()}${listingOwner.type.slice(1)}`
    : null;

  const propertyContactPhone =
    listingOwner?.mobile ||
    property.salesDept?.contactNumber ||
    property.documents?.legalAdvisor?.contactNumber ||
    property.lawyerDetails?.mobile;

  const brochureUrl = property?.media?.brochure || null;

  const isAuthenticated = isLoggedIn || Boolean(localStorage.getItem('token'));

  const handleWhatsAppContact = (phone, message) => {
    if (!isAuthenticated) {
      openLoginModal('Please login to contact us on WhatsApp.');
      return;
    }
    openWhatsAppChat(phone, message);
  };

  const handleScheduleSiteVisit = () => {
    handleWhatsAppContact(
      propertyContactPhone || '919876543210',
      buildSiteVisitWhatsAppMessage(property, user)
    );
  };

  const isWished = wishlist.includes(property._id);
  const allMedia = buildPropertyMediaItems(property);
  const activeMedia = allMedia[activeMediaIndex] ?? allMedia[0] ?? null;

  const propertyTypeName =
    typeof property.propertyType === 'object' ? property.propertyType?.name : property.propertyType;
  const listingTypeMeta = getListingTypeMeta(property);
  const type = (propertyTypeName || '').toLowerCase();
  const isLand = type.includes('plot') || type.includes('land') || type.includes('farm');
  const isCommercial =
    type.includes('commercial') || type.includes('office') || type.includes('retail');
  const isFlat = type.includes('flat') || type.includes('apartment') || type.includes('penthouse');
  const isVilla =
    type.includes('villa') || type.includes('independent house') || type.includes('bungalow');

  const specs = property.specifications || {};
  const isLandForDevelopment = isLandForDevelopmentType(propertyTypeName);
  const developmentShare = isLandForDevelopment ? getDevelopmentShare(property) : null;

  const formatTotalArea = () => {
    const total = specs.totalArea || property.size || property.area;
    if (total != null && total !== '') {
      const unit = specs.totalAreaUnit || specs.plotAreaUnit || (isLand ? 'Sq.yd' : 'Sft');
      return `${total} ${unit}`.trim();
    }
    return null;
  };

  const totalAreaDisplay = formatTotalArea();

  const getBedroomLabel = () => {
    const bhk =
      specs.bhkConfig ||
      property.bhk ||
      (property.title ? parseInt(property.title.match(/(\d+)\s*BHK/i)?.[1] || 0) : 0);
    return bhk ? `${bhk} BHK` : null;
  };

  const getBathroomLabel = () => property.baths || specs.bathrooms || null;

  const propertyStatusLabel = property?.financials?.propertyStatus || property?.propertyStatus;

  const getFacingLabel = () =>
    specs.facing || property.direction || (isLand ? 'East' : isCommercial ? 'Main Road' : null);

  const getOwnershipLabel = () =>
    property.ownership || specs.ownership || (isLand || isCommercial ? 'Freehold' : null);

  const getDimensionsLabel = () => {
    const len = specs.dimensions?.length || specs.plotLength || '';
    const wid = specs.dimensions?.width || specs.plotWidth || '';
    if (!len || !wid) return null;
    const unit = specs.dimensions?.unit || 'FT';
    return `${len} x ${wid} ${unit}`.trim();
  };

  const statusHighlight = propertyStatusLabel
    ? [{ icon: <SearchIco />, label: 'Status', value: propertyStatusLabel }]
    : [];

  // Quick highlights — status, facing, dimensions (type, furnishing, washrooms → Technical Specifications)
  const getHighlights = () => {
    const facing = getFacingLabel();
    const facingHighlight = facing ? [{ icon: <SearchIco />, label: 'Facing', value: facing }] : [];

    if (isLand) {
      // if (developmentShare) {
      //   const ratioHighlights = [];
      //   if (developmentShare.builder != null) {
      //     ratioHighlights.push({
      //       icon: <SearchIco />,
      //       label: 'Builder ratio',
      //       value: formatDevelopmentRatio(developmentShare.builder),
      //     });
      //   }
      //   if (developmentShare.owner != null) {
      //     ratioHighlights.push({
      //       icon: <SearchIco />,
      //       label: 'Owner ratio',
      //       value: formatDevelopmentRatio(developmentShare.owner),
      //     });
      //   }
      //   if (ratioHighlights.length > 0) {
      //     return [...ratioHighlights, ...statusHighlight];
      //   }
      // }

      const len = specs.dimensions?.length || specs.plotLength || '';
      const wid = specs.dimensions?.width || specs.plotWidth || '';
      const dimStr = len && wid ? `${len} x ${wid}` : 'Check Specs';

      return [{ icon: <AreaIco />, label: 'Dimensions', value: dimStr }, ...statusHighlight];
    }

    return [...facingHighlight, ...statusHighlight];
  };

  const formatCurrency = (amount) => {
    if (amount == null || amount === '') return null;
    const n = Number(amount);
    if (Number.isNaN(n)) return null;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const formatAreaWithUnit = (area, unit) => {
    if (area == null || area === '') return null;
    return `${area}${unit ? ` ${unit}` : ''}`.trim();
  };

  const getTotalPriceDisplay = () => {
    if (property.price) {
      return property.price.includes('₹') ? property.price : `₹${property.price}`;
    }
    return formatCurrency(property.financials?.totalPrice);
  };

  const getFinancialSpecifications = () => [
    { label: 'Total Price', value: getTotalPriceDisplay() },
    { label: 'Price per Sft', value: formatCurrency(property.financials?.pricePerSft) },
    { label: 'Price per Acre', value: formatCurrency(property.financials?.pricePerAcre) },
    { label: 'Price per Gunta', value: formatCurrency(property.financials?.pricePerGunta) },
    { label: 'Price per Sq.Yard', value: formatCurrency(property.financials?.pricePerSqYard) },
    {
      label: 'Rate per Sq.Ft',
      value: property.pricing?.pricePerSqft ? formatCurrency(property.pricing.pricePerSqft) : null,
    },
    { label: 'GST Status', value: property.financials?.gstStatus },
    { label: 'Stamp Duty & Registration', value: property.financials?.stampDuty },
    {
      label: 'Agent Fee',
      value:
        property.financials?.agentFee &&
        property.financials.agentFee !== 'Not Applicable' &&
        property.financials.agentFee !== 'N/A'
          ? property.financials.agentFee
          : null,
    },
  ];

  const dedupeSpecRows = (rows) => {
    const seen = new Set();
    return rows.filter((row) => {
      if (row.value == null || row.value === '' || row.value === 'N/A') return false;
      if (seen.has(row.label)) return false;
      seen.add(row.label);
      return true;
    });
  };

  const getTechnicalSpecifications = () => {
    const areaUnit = specs.totalAreaUnit || specs.plotAreaUnit || (isLand ? 'Sq.yd' : 'Sft');

    const common = [
      { label: 'Project / Society Name', value: property?.projectName },
      { label: 'Property Type', value: propertyTypeName },
      { label: 'Dimensions (L x W)', value: getDimensionsLabel() },
      { label: 'Total Area', value: formatAreaWithUnit(specs.totalArea, areaUnit) },
      { label: 'Built-up Area', value: formatAreaWithUnit(specs.builtUpArea, areaUnit) },
      { label: 'Plot Area', value: formatAreaWithUnit(specs.plotArea, areaUnit) },
      { label: 'Facing Direction', value: getFacingLabel() },
      { label: 'Ownership', value: getOwnershipLabel() },
      { label: 'Property Status', value: propertyStatusLabel },
      { label: 'Vastu Compliant', value: specs.vastuCompliant },
      {
        label: 'Commercial Type',
        value: specs.commercialType || (isCommercial ? propertyTypeName : null),
      },
      { label: 'Washrooms', value: specs.washrooms },
      { label: 'Furnishing', value: property?.furnishingStatus || specs.furnishing },
    ];

    const typeSpecific = isLand
      ? [
          { label: 'Road Width', value: specs.roadWidth ? `${specs.roadWidth} FT` : null },
          { label: 'Boundary Wall', value: specs.boundaryWall },
          ...(developmentShare
            ? [
                {
                  label: 'Builder ratio',
                  value: formatDevelopmentRatio(developmentShare.builder),
                },
                {
                  label: 'Owner ratio',
                  value: formatDevelopmentRatio(developmentShare.owner),
                },
              ]
            : []),
        ]
      : isCommercial
        ? [{ label: 'Total Floors', value: specs.numberOfFloors }]
        : [
            { label: 'Bedrooms', value: getBedroomLabel() },
            { label: 'Bathrooms', value: getBathroomLabel() },
            { label: 'BHK Configuration', value: specs.bhkConfig },
            { label: 'Total Floors', value: specs.numberOfFloors },
          ];

    return dedupeSpecRows([...common, ...typeSpecific, ...getFinancialSpecifications()]);
  };

  const highlights = getHighlights();
  const technicalSpecifications = getTechnicalSpecifications();

  const renderDesktopGallery = () => {
    const len = allMedia.length;
    if (len === 0) return null;

    // 1 Image: Full-width container
    if (len === 1) {
      return (
        <div
          className="h-[440px] w-full relative cursor-pointer overflow-hidden rounded-md"
          onClick={() => setActiveMediaIndex(0)}
        >
          <img src={allMedia[0].url} alt={property.title} className="w-full h-full object-cover" />
          {allMedia[0].type === 'video' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl text-primary">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 2 Images: 50/50 side by side layout
    if (len === 2) {
      return (
        <div className="grid grid-cols-2 gap-2.5 h-[440px] w-full rounded-md overflow-hidden">
          {allMedia.map((m, idx) => (
            <div
              key={idx}
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => setActiveMediaIndex(idx)}
            >
              <img
                src={m.url}
                alt={`Gallery ${idx}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {m.type === 'video' && (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-md text-primary">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // 3 Images: 1 large left, 2 stacked right
    if (len === 3) {
      return (
        <div className="grid grid-cols-3 gap-2.5 h-[440px] w-full rounded-md overflow-hidden">
          <div
            className="col-span-2 relative cursor-pointer overflow-hidden group"
            onClick={() => setActiveMediaIndex(0)}
          >
            <img
              src={allMedia[0].url}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {allMedia[0].type === 'video' && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl text-primary">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-2.5">
            {allMedia.slice(1, 3).map((m, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer overflow-hidden group"
                onClick={() => setActiveMediaIndex(idx + 1)}
              >
                <img
                  src={m.url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {m.type === 'video' && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-md text-primary">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4 Images: 1 large left (col-span-2), 1 middle column with 2 stacked, 1 right column full-height
    if (len === 4) {
      return (
        <div className="grid grid-cols-4 gap-2.5 h-[440px] w-full rounded-md overflow-hidden">
          <div
            className="col-span-2 relative cursor-pointer overflow-hidden group"
            onClick={() => setActiveMediaIndex(0)}
          >
            <img
              src={allMedia[0].url}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {allMedia[0].type === 'video' && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl text-primary">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-2.5">
            {allMedia.slice(1, 3).map((m, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer overflow-hidden group"
                onClick={() => setActiveMediaIndex(idx + 1)}
              >
                <img
                  src={m.url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {m.type === 'video' && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-md text-primary">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            className="col-span-1 relative cursor-pointer overflow-hidden group"
            onClick={() => setActiveMediaIndex(3)}
          >
            <img
              src={allMedia[3].url}
              alt="Gallery 4"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {allMedia[3].type === 'video' && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-md text-primary">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 5 or more images: Standard Airbnb mosaic (1 large, 4 small 2x2 grid)
    return (
      <div className="grid grid-cols-4 grid-rows-2 gap-2.5 h-[440px] w-full rounded-md overflow-hidden relative">
        <div
          className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group"
          onClick={() => setActiveMediaIndex(0)}
        >
          <img
            src={allMedia[0].url}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {allMedia[0].type === 'video' && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl text-primary">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
        {allMedia.slice(1, 5).map((m, idx) => {
          const isLast = idx === 3 && len > 5;
          return (
            <div
              key={idx}
              className="relative cursor-pointer overflow-hidden group col-span-1 row-span-1"
              onClick={() => setActiveMediaIndex(idx + 1)}
            >
              <img
                src={m.url}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {m.type === 'video' && (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-md text-primary">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
              {isLast && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white font-semibold text-sm">
                  +{len - 4} Photos
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={PD_PAGE}>
      {burst && <HeartBurst x={burst.x} y={burst.y} onDone={() => setBurst(null)} />}
      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(1); }
          30% { transform: scale(1.4) rotate(8deg); }
          60% { transform: scale(0.9) rotate(-4deg); }
          100% { transform: scale(1); }
        }
        .animate-heart-pulse {
          animation: heartPulse 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      {/* ─── CONTAINER FOR CONTENT ─── */}
      <div className="max-w-[1536px] mx-auto px-6">
        {/* ─── ACTION BAR: Back / Title / Share / Wishlist ─── */}
        <div className={PD_HEADER}>
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" className={PD_BTN_GHOST} onClick={() => navigate(-1)}>
              <ChevronL className="w-3 h-3" />
              <span>Back</span>
            </button>
            <span className="hidden sm:block w-px h-4 bg-slate-200 shrink-0" />
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider leading-none mb-0.5">
                {property.city || 'Property'}
              </span>
              <span className="text-sm font-semibold text-slate-900 truncate max-w-[260px] md:max-w-[420px] leading-snug">
                {property.title || property.projectName}
              </span>
            </div>
          </div>

          {/* Right: Share + Wishlist */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Share button + dropdown */}
            <div className="relative">
              <button
                className={PD_BTN_GHOST}
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await shareProperty(property, setCopied);
                    } catch (_) {
                      /* dismissed */
                    }
                  } else {
                    setShowShareMenu((v) => !v);
                  }
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span>Share</span>
              </button>

              {/* Desktop Share Dropdown */}
              {showShareMenu && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white rounded-md border border-slate-100 shadow-xl p-3 w-56 flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-2 pb-1 border-b border-slate-100 mb-1">
                      Share via
                    </p>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent((property.title || property.projectName) + ' — ' + shareUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                      onClick={() => {
                        recordShare(propertyMongoId);
                        setShowShareMenu(false);
                      }}
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.528 5.845L.057 23.428a.5.5 0 0 0 .609.61l5.657-1.484A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.732.979.996-3.648-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.566 6.566 2.182 12 2.182S21.818 6.566 21.818 12 17.434 21.818 12 21.818z" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-[#25D366]">
                        WhatsApp
                      </span>
                    </a>

                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                      onClick={() => {
                        recordShare(propertyMongoId);
                        setShowShareMenu(false);
                      }}
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#1877F2]/10 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-[#1877F2]">
                        Facebook
                      </span>
                    </a>

                    {/* X / Twitter */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(property.title || property.projectName)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                      onClick={() => {
                        recordShare(propertyMongoId);
                        setShowShareMenu(false);
                      }}
                    >
                      <span className="w-7 h-7 rounded-lg bg-slate-900/10 flex items-center justify-center shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#0f172a">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                        X (Twitter)
                      </span>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                      onClick={() => {
                        recordShare(propertyMongoId);
                        setShowShareMenu(false);
                      }}
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-[#0A66C2]">
                        LinkedIn
                      </span>
                    </a>

                    {/* Copy Link */}
                    <button
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group w-full text-left"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        recordShare(propertyMongoId);
                        setCopied(true);
                        setShowShareMenu(false);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${copied ? 'bg-emerald-100' : 'bg-slate-100'}`}
                      >
                        {copied ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#64748b"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        )}
                      </span>
                      <span
                        className={`text-sm font-semibold transition-colors ${copied ? 'text-emerald-600' : 'text-slate-700 group-hover:text-slate-900'}`}
                      >
                        {copied ? 'Link Copied!' : 'Copy Link'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Wishlist / Save button */}
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-semibold transition-all text-sm cursor-pointer ${
                wishlist.includes(property._id)
                  ? 'bg-rose-50 border-rose-300 text-rose-500'
                  : `${PD_BTN_GHOST} hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50`
              }`}
              onClick={handleWishlist}
            >
              <Heart
                size={14}
                strokeWidth={2.25}
                className={`shrink-0 transition-all ${isWished ? 'fill-current' : ''} ${pulsing ? 'animate-heart-pulse' : ''}`}
              />
              <span>Favourite</span>
            </button>
          </div>
        </div>

        {/* ─── TOP SECTION: INTERACTIVE GALLERY & QUICK DETAILS SIDE-BY-SIDE ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Gallery Media Viewer (Poster + Vertical Thumbnails Column) */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-3 h-[280px] md:h-[450px]">
            {/* Left: Desktop Vertical Thumbnail List */}
            {allMedia.length >= 1 && (
              <div className="hidden md:flex flex-col gap-2 w-20 shrink-0 overflow-y-auto max-h-full no-scrollbar pr-1">
                {allMedia.map((m, idx) => {
                  const isActive = activeMediaIndex === idx;
                  return (
                    <button
                      key={`${m.type}-${m.videoId || m.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`w-full aspect-[4/3] rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer relative group/thumb ${
                        isActive ? 'scale-[0.93] shadow-md' : 'hover:scale-[0.97]'
                      }`}
                    >
                      <img
                        src={m.url}
                        alt={`Thumb ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      {m.type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      {/* Active Border Overlay to prevent image cover */}
                      <div
                        className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-200 border-2 ${
                          isActive
                            ? 'border-primary opacity-100'
                            : 'border-slate-200/40 opacity-0 group-hover/thumb:opacity-50'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Right/Main: Active Media Viewer (Poster) */}
            <div className="flex-1 h-full rounded-md overflow-hidden bg-slate-950 relative border border-slate-100 shadow-sm">
              {/* <div className="absolute right-0 top-0 z-[4]">
                <PropertyDetailsEdgeRibbon listingTypeMeta={listingTypeMeta} />
              </div> */}

              {/* Mobile Horizontal Scroll Gallery */}
              <div
                className="flex md:hidden overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full h-full"
                onScroll={(e) => {
                  const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
                  if (index !== activeMediaIndex && index >= 0 && index < allMedia.length) {
                    setActiveMediaIndex(index);
                  }
                }}
              >
                {allMedia.map((m, idx) => (
                  <div
                    key={idx}
                    className="w-full h-full shrink-0 snap-start relative bg-slate-950"
                  >
                    {m.type === 'video' && m.videoId ? (
                      <iframe
                        className="w-full h-full border-none"
                        src={`https://www.youtube.com/embed/${m.videoId}?autoplay=0&mute=1`}
                        title="Property video tour"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt={`${property.title} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Active Media Viewer */}
              <div className="hidden md:block w-full h-full">
                {activeMedia?.type === 'video' && activeMedia.videoId ? (
                  <iframe
                    className="w-full h-full border-none"
                    src={`https://www.youtube.com/embed/${activeMedia.videoId}?autoplay=1&mute=1`}
                    title="Property video tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={
                      activeMedia?.url ||
                      getImageUrl(property.poster || property.coverPhoto || property.img)
                    }
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Floating Total Badge */}
              {allMedia.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-white tracking-wider z-[4]">
                  {activeMediaIndex + 1} / {allMedia.length}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Details Panel (Name, Badges, Cost, Highlights, CTA) */}
          <div className={`relative lg:col-span-4 ${PD_PANEL} p-5 flex flex-col justify-between h-fit lg:h-[450px]`}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {propertyTypeName && (
                    <span className={PD_BADGE_PRIMARY}>{propertyTypeName}</span>
                  )}
                  {/* <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${property.badge === 'New' ? 'bg-gold-50 text-primary-dark' : 'bg-slate-100 text-slate-700'}`}>
                    {property.badge || 'Verified Listing'}
                  </span> */}
                  {property.completionPercentage !== undefined && (
                    <span className="px-2.5 py-0.5 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {property.completionPercentage}% Verified
                    </span>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
                  {property.title || property.projectName}
                </h1>
                <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                  <PinIco className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{formatPropertyAddressLine(property)}</span>
                </div>
              </div>

              {/* Pricing & Financial Details */}
              <div className="bg-slate-50/80 p-3.5 rounded-md border border-slate-100 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2 mb-2">
                  <span className="text-slate-500 text-sm font-semibold">Total Price</span>
                  <strong className="text-slate-900 font-semibold text-xl">
                    {property.price
                      ? property.price.includes('₹')
                        ? property.price
                        : `₹${property.price}`
                      : property.financials?.totalPrice
                        ? `₹${property.financials.totalPrice.toLocaleString()}`
                        : 'N/A'}
                  </strong>
                </div>

                <div className="space-y-1.5">
                  {totalAreaDisplay && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Area</span>
                      <span className="text-slate-800 font-semibold">{totalAreaDisplay}</span>
                    </div>
                  )}
                  {property.pricing?.pricePerSqft && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Rate per Sq.Ft</span>
                      <span className="text-slate-800 font-semibold">
                        ₹{property.pricing.pricePerSqft.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {property.financials?.pricePerSft && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Price per Sft</span>
                      <span className="text-slate-800 font-semibold">
                        ₹{property.financials?.pricePerSft?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {property.financials?.pricePerAcre && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Price per Acre</span>
                      <span className="text-slate-800 font-semibold">
                        ₹{property.financials?.pricePerAcre?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {property.financials?.pricePerSqYard && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Price per Sq.Yard</span>
                      <span className="text-slate-800 font-semibold">
                        ₹{property.financials?.pricePerSqYard?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Highlights list */}
              <div className="grid grid-cols-2 gap-1.5">
                {highlights.slice(0, 4).map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-slate-100/80 rounded-md"
                  >
                    <div className={PD_HIGHLIGHT_ICON}>
                      {h.icon}
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <span className="text-xs text-slate-500 font-medium block truncate">
                        {h.label}
                      </span>
                      <strong className="text-xs text-slate-900 font-semibold truncate block">
                        {h.value}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              {(property.financials?.gstStatus || property.financials?.stampDuty) && (
                <div className="space-y-1.5 pt-0.5">
                  {property.financials?.gstStatus && (
                    <div className="flex justify-between items-center text-sm px-0.5">
                      <span className="text-slate-500">GST Status</span>
                      <span className="text-slate-800 font-semibold">
                        {property.financials.gstStatus}
                      </span>
                    </div>
                  )}
                  {property.financials?.stampDuty && (
                    <div className="flex justify-between items-center text-sm px-0.5">
                      <span className="text-slate-500">Stamp Duty & Reg.</span>
                      <span className="text-slate-800 font-semibold">
                        {property.financials.stampDuty}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {brochureUrl && (
          <section className="mb-6 rounded-md border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-gold-50/40 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 rounded-md bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                  <DocFileIcon size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 m-0">Project Brochure</h3>
                  <p className="text-sm text-slate-500 font-medium m-0 mt-1">
                    Floor plans, pricing, and full project details — PDF document from the seller.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openDocPreview('Project Brochure', brochureUrl)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm"
                >
                  <DocFileIcon size={14} />
                  Preview Brochure
                </button>
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-primary hover:text-primary transition-colors no-underline"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ─── TWO-COLUMN MAIN CONTENT GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ──────────────── LEFT COLUMN (Property Features) ──────────────── */}
          <div className="lg:col-span-8 space-y-5">
            {/* ─── INFO CARD: OVERVIEW ─── */}
            <section className={`${PD_PANEL} p-5`}>
              <h3 className={PD_SECTION}>
                <span className={PD_SECTION_ACCENT} />
                Overview
              </h3>
              <p className="leading-relaxed text-slate-500 text-sm font-medium">
                {isLand ? (
                  <>
                    Explore this premium{' '}
                    <strong className="text-slate-800 font-semibold">
                      {property.propertyType?.name}
                    </strong>{' '}
                    located in the strategically connected area of{' '}
                    <strong className="text-slate-800 font-semibold">
                      {property.location?.locality || property.loc}
                    </strong>
                    . Perfect for investment or building your dream project, this land offers
                    excellent potential. Positioned near{' '}
                    <strong className="text-slate-800 font-semibold">
                      {property.location?.landmark || 'major hubs'}
                    </strong>
                    , it ensures unmatched connectivity and growth opportunities.
                    {property.direction && ` The plot is ${property.direction} facing.`}
                  </>
                ) : (
                  <>
                    Experience luxury living in this premium{' '}
                    <strong className="text-slate-800 font-semibold">
                      {property.propertyType?.name}
                    </strong>{' '}
                    located in the heart of{' '}
                    <strong className="text-slate-800 font-semibold">
                      {property.location?.locality || property.loc}
                    </strong>
                    .
                    {property.furnishingStatus === 'Fully Furnished' &&
                      ' This home comes with bespoke interiors and high-end furniture, ready for immediate occupation.'}
                    Positioned strategically near{' '}
                    <strong className="text-slate-800 font-semibold">
                      {property.location?.landmark || 'major hubs'}
                    </strong>
                    , it offers unmatched connectivity and a serene environment.
                    {property.direction &&
                      ` The property is ${property.direction} facing, ensuring optimal natural light and ventilation.`}
                  </>
                )}
              </p>
            </section>

            {developmentShare && (
              <section className={`${PD_PANEL} p-5 border-gold-100`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Development share
                </p>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight mb-2">
                  Builder &amp; owner revenue split
                </h3>
                <p className="text-sm text-slate-500 font-medium mb-4">
                  Revenue-sharing arrangement between builder and land owner for this development
                  plot.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <div className="rounded-md border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Builder ratio
                    </span>
                    <strong className="text-2xl font-bold text-slate-900 tabular-nums">
                      {formatDevelopmentRatio(developmentShare.builder) ?? '—'}
                    </strong>
                  </div>
                  <div className="rounded-md border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Owner ratio
                    </span>
                    <strong className="text-2xl font-bold text-slate-900 tabular-nums">
                      {formatDevelopmentRatio(developmentShare.owner) ?? '—'}
                    </strong>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 inline-flex px-3 py-1 rounded-full">
                  Total: {developmentShare.total}%
                </p>
              </section>
            )}

            {/* ─── INFO CARD: TECHNICAL SPECIFICATIONS ─── */}
            <section className={`${PD_PANEL} p-5`}>
              <h3 className={PD_SECTION}>
                <span className={PD_SECTION_ACCENT} />
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {technicalSpecifications.map((item, idx) => (
                  <div key={idx} className={PD_SPEC_ROW}>
                    <span className="text-slate-500 font-medium">{item.label}</span>
                    <span className="text-slate-900 font-semibold text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── INFO CARD: AMENITIES & FEATURES ─── */}
            {property?.amenities?.length > 0 && (
              <section className={`${PD_PANEL} p-5`}>
                <h3 className={PD_SECTION}>
                  <span className={PD_SECTION_ACCENT} />
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(property.amenities || []).map((a) => (
                    <div
                      key={a}
                      className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 py-2 rounded-md hover:border-primary/20 transition-all group"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-sm bg-white text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                        <AmenityIcon name={a} />
                      </span>
                      <span className="capitalize font-semibold text-slate-700 text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── INFO CARD: VERIFIED DOCUMENTS & LEGAL ADVISORY ─── */}
            {property.documents && (
              <section className={`${PD_PANEL} overflow-hidden`}>
                <div className="px-5 pt-5 pb-3 bg-slate-50/60 border-b border-slate-100 flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 tracking-tight m-0">
                      Verified Documents
                    </h3>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-1">
                      Official approvals and certificates
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                    <span className="inline-flex w-3.5 h-3.5 [&_svg]:w-full [&_svg]:h-full">
                      <IconCheckCircle />
                    </span>
                    Verified
                  </span>
                </div>

                <div className="p-5 space-y-5">
                  {property.projectApprovedBy && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/80">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide m-0 mb-0.5">
                          Project approved by
                        </p>
                        <p className="text-sm font-semibold text-slate-800 leading-snug m-0">
                          {property.projectApprovedBy}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-medium text-slate-700 uppercase tracking-wide m-0 mb-3">
                      Official approval documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {property.documents?.rera?.number && (
                        <div className="group flex items-center justify-between gap-2 pl-3 pr-2.5 py-3 bg-white border border-slate-100 rounded-xl shadow-sm border-l-[3px] border-l-emerald-500 hover:border-emerald-200/80 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-emerald-600 m-0 mb-0.5">
                              RERA registration
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate m-0">
                              {property.documents.rera.number}
                            </p>
                            {property.documents.rera.expiry && (
                              <p className="text-xs text-slate-500 m-0 mt-0.5">
                                Exp.{' '}
                                {new Date(property.documents.rera.expiry).toLocaleDateString(
                                  'en-IN',
                                  { month: 'short', day: 'numeric', year: 'numeric' }
                                )}
                              </p>
                            )}
                          </div>
                          {property.documents.rera.certificate && (
                            <button
                              type="button"
                              onClick={() =>
                                openDocPreview(
                                  'RERA Certificate',
                                  property.documents.rera.certificate
                                )
                              }
                              className={DOC_VIEW_BTN_CLASS}
                            >
                              <DocFileIcon />
                              <span>
                                View
                                {normalizeDocUrls(property.documents.rera.certificate).length > 1
                                  ? ` (${normalizeDocUrls(property.documents.rera.certificate).length})`
                                  : ''}
                              </span>
                            </button>
                          )}
                        </div>
                      )}

                      {property.documents.hmdaApproval?.number && (
                        <div className="group flex items-center justify-between gap-2 pl-3 pr-2.5 py-3 bg-white border border-slate-100 rounded-xl shadow-sm border-l-[3px] border-l-blue-500 hover:border-blue-200/80 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-blue-600 m-0 mb-0.5">
                              HMDA approval
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate m-0">
                              {property.documents.hmdaApproval.number}
                            </p>
                          </div>
                          {property.documents.hmdaApproval.doc && (
                            <button
                              type="button"
                              onClick={() =>
                                openDocPreview('HMDA Approval', property.documents.hmdaApproval.doc)
                              }
                              className={DOC_VIEW_BTN_CLASS}
                            >
                              <DocFileIcon />
                              <span>View</span>
                            </button>
                          )}
                        </div>
                      )}

                      {(property.documents.layoutPermission?.number ||
                        property.documents.layoutPermission?.doc) && (
                        <div className="group flex items-center justify-between gap-2 pl-3 pr-2.5 py-3 bg-white border border-slate-100 rounded-xl shadow-sm border-l-[3px] border-l-slate-400 hover:border-slate-200 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500 m-0 mb-0.5">
                              Layout permission
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate m-0">
                              {property.documents.layoutPermission?.number || 'On file'}
                            </p>
                          </div>
                          {property.documents.layoutPermission?.doc && (
                            <button
                              type="button"
                              onClick={() =>
                                openDocPreview(
                                  'Layout Permission',
                                  property.documents.layoutPermission.doc
                                )
                              }
                              className={DOC_VIEW_BTN_CLASS}
                            >
                              <DocFileIcon />
                              <span>View</span>
                            </button>
                          )}
                        </div>
                      )}

                      {(property.documents.buildingPermission?.number ||
                        property.documents.buildingPermission?.doc) && (
                        <div className="group flex items-center justify-between gap-2 pl-3 pr-2.5 py-3 bg-white border border-slate-100 rounded-xl shadow-sm border-l-[3px] border-l-slate-400 hover:border-slate-200 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500 m-0 mb-0.5">
                              Building permission
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate m-0">
                              {property.documents.buildingPermission?.number || 'On file'}
                            </p>
                          </div>
                          {property.documents.buildingPermission?.doc && (
                            <button
                              type="button"
                              onClick={() =>
                                openDocPreview(
                                  'Building Permission',
                                  property.documents.buildingPermission.doc
                                )
                              }
                              className={DOC_VIEW_BTN_CLASS}
                            >
                              <DocFileIcon />
                              <span>View</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ─── INFO CARD: VIDEO TOUR ─── */}
            {/* {videoId && (
              <section className="bg-white p-5 rounded-md border border-slate-100 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight mb-3 border-b border-slate-100 pb-2">Video Tour</h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Tour"
                    className="w-full h-full border-none"
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            )} */}
          </div>

          {/* ──────────────── RIGHT COLUMN (Sticky Sidebar for Cost Details & Support) ──────────────── */}
          <div className="lg:col-span-4 space-y-5">
            <div className="lg:sticky lg:top-[100px] space-y-5">
              {/* Listed by — property poster */}
              {listingOwner && (
                <div className={`${PD_PANEL} p-5`}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm ${PD_BADGE_PRIMARY}`}>
                      <span className="inline-flex w-3.5 h-3.5 [&_svg]:w-full [&_svg]:h-full">
                        <IconCheckCircle />
                      </span>
                      Listed by
                    </span>
                    {property.status === 'verified' && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        Verified listing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {listingOwner.avatar ? (
                        <img
                          src={listingOwner.avatar}
                          alt={listingOwner.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30 shrink-0 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg shrink-0 ring-2 ring-primary/20">
                          {listingOwner.name[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold text-slate-900 truncate leading-tight">
                          {listingOwner.name}
                        </h4>
                        {listingOwnerTypeLabel && (
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide block mt-0.5">
                            {listingOwnerTypeLabel}
                          </span>
                        )}
                        <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                          Posted this property
                        </p>
                      </div>
                    </div>
                    {listingOwner.mobile && (
                      <button
                        type="button"
                        className={`w-10 h-10 shrink-0 ${whatsAppContactBtnClass}`}
                        aria-label={`Contact ${listingOwner.name} on WhatsApp`}
                        onClick={() =>
                          handleWhatsAppContact(
                            listingOwner.mobile,
                            `Hi ${listingOwner.name}, I'm interested in "${property.title || property.projectName}". Please share more details.`
                          )
                        }
                      >
                        <WhatsAppIcon size={18} />
                      </button>
                    )}
                  </div>

                  {/* <div className="mt-3 pt-3 border-t border-gold-200/60 space-y-1.5 text-sm">
                    {listingOwner.mobile && (
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-medium">Mobile</span>
                        <a
                          href={`tel:${listingOwner.mobile.replace(/\s/g, '')}`}
                          className="font-semibold text-slate-800 hover:text-primary transition-colors"
                        >
                          {listingOwner.mobile}
                        </a>
                      </div>
                    )}
                    {listingOwner.email && (
                      <div className="flex justify-between gap-2 min-w-0">
                        <span className="text-slate-500 font-medium shrink-0">Email</span>
                        <a
                          href={`mailto:${listingOwner.email}`}
                          className="font-semibold text-slate-800 hover:text-primary transition-colors truncate text-right"
                        >
                          {listingOwner.email}
                        </a>
                      </div>
                    )}
                  </div> */}
                </div>
              )}
              {/* Assurance summary + sales / loan contacts */}
              <div className={`${PD_PANEL} p-5 space-y-4`}>
                <div>
                  <h4 className={PD_SECTION}>
                    <span className={PD_SECTION_ACCENT} />
                    Assurance & Support
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 m-0">
                    Trust overview and team contacts
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                  {property.status === 'verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                      <span className="inline-flex w-3.5 h-3.5 [&_svg]:w-full [&_svg]:h-full">
                        <IconCheckCircle />
                      </span>
                      Verified
                    </span>
                  )}
                  {property.completionPercentage !== undefined &&
                    property.completionPercentage !== null && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                        {property.completionPercentage}% complete
                      </span>
                    )}
                  {property.documents?.rera?.number && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50/80 text-emerald-800 border border-emerald-100 text-xs font-semibold truncate max-w-full">
                      RERA: {property.documents.rera.number}
                    </span>
                  )}
                  {property.documents?.hmdaApproval?.number && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100 text-xs font-semibold truncate max-w-full">
                      HMDA: {property.documents.hmdaApproval.number}
                    </span>
                  )}
                </div>

                {(property.salesDept || property.loanDept) && (
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <h5 className="text-xs font-medium text-slate-700 uppercase tracking-wide m-0 pt-4">
                      Contact support team
                    </h5>

                    {property.salesDept && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
                            {property.salesDept.fullName[0]}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-sm font-semibold text-slate-800 truncate leading-tight">
                              {property.salesDept.fullName}
                            </h5>
                            <span className="text-xs text-slate-600 font-medium uppercase tracking-wide block mt-0.5">
                              Sales Department
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`w-9 h-9 ${whatsAppContactBtnClass}`}
                          aria-label="Contact sales specialist on WhatsApp"
                          onClick={() =>
                            handleWhatsAppContact(
                              property.salesDept.contactNumber,
                              `Hi, I want sales information regarding ${property.title}.`
                            )
                          }
                        >
                          <WhatsAppIcon size={16} />
                        </button>
                      </div>
                    )}

                    {/* Loan Assistance Specialist */}
                    {property.loanDept && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm shrink-0">
                            {property.loanDept.fullName[0]}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-sm font-semibold text-slate-800 truncate leading-tight">
                              {property.loanDept.fullName}
                            </h5>
                            <span className="text-xs text-slate-600 font-medium uppercase tracking-wide block mt-0.5">
                              Loan Department
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`w-9 h-9 ${whatsAppContactBtnClass}`}
                          aria-label="Contact loan consultant on WhatsApp"
                          onClick={() =>
                            handleWhatsAppContact(
                              property.loanDept.contactNumber,
                              `Hi, I want loan details regarding ${property.title}.`
                            )
                          }
                        >
                          <WhatsAppIcon size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Legal adviser — sidebar contact */}
              {property.documents?.legalAdvisor?.fullName && (
                <div className={`${PD_PANEL} p-4 space-y-3`}>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Legal adviser
                  </h4>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0"
                        aria-hidden
                      >
                        {property.documents.legalAdvisor.fullName[0]?.toUpperCase() || 'L'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 capitalize truncate leading-tight m-0">
                          {property.documents.legalAdvisor.fullName}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-0.5">
                          <span className="inline-flex w-3.5 h-3.5 [&_svg]:w-full [&_svg]:h-full">
                            <IconCheckCircle />
                          </span>
                          Verified legal adviser
                        </span>
                      </div>
                    </div>
                    {property.documents.legalAdvisor.contactNumber && (
                      <button
                        type="button"
                        className={`w-9 h-9 shrink-0 ${whatsAppContactBtnClass}`}
                        aria-label={`Contact ${property.documents.legalAdvisor.fullName} on WhatsApp`}
                        onClick={() =>
                          handleWhatsAppContact(
                            property.documents.legalAdvisor.contactNumber,
                            `Hi, I want legal advice regarding ${property.title || property.projectName}.`
                          )
                        }
                      >
                        <WhatsAppIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ─── INFO CARD: LOCATION MAP & CONNECTIVITY ─── */}
              {property?.address?.location?.coordinates?.length > 0 && (
                <section className={`${PD_PANEL} p-5 space-y-4`}>
                  <h3 className={PD_SECTION}>
                    <span className={PD_SECTION_ACCENT} />
                    Location & Connectivity
                  </h3>
                  <div className="w-full h-[220px] rounded-xl overflow-hidden border border-slate-100 relative z-1 shadow-sm">
                    {property?.address?.location?.coordinates?.length > 0 && googleMapsLoaded ? (
                      <div ref={mapRef} className="h-full w-full" />
                    ) : (
                      <iframe
                        title="Property Location"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address?.googleMapUrl || property.address?.addressLine1 || property.loc)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        className="w-full h-full border-none"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>
                  {property.locationAdvantages && property.locationAdvantages.length > 0 && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/50">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2.5">
                        Nearby Connectivity
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {property.locationAdvantages.map((adv, idx) => {
                          const name = typeof adv === 'string' ? adv : adv.name;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm text-sm font-semibold text-slate-600"
                            >
                              <span className="text-primary shrink-0">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="10"
                                  height="10"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                >
                                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                              </span>
                              <span>{name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>

        {/* ─── RELATED PROPERTIES SECTION ─── */}
        {relatedProperties.length > 0 && (
          <section className="mt-8 pt-6 border-t border-slate-100 pb-16 lg:pb-0">
            <div className="flex flex-col mb-6 gap-1">
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                Curated for You
              </span>
              <h3 className="text-2xl font-semibold text-slate-800 m-0 tracking-tight">
                Properties You May Also Like
              </h3>
              <p className="text-slate-400 text-base font-medium">
                Handpicked listings from{' '}
                <span className="text-slate-700 font-semibold">{property.city}</span> based on your
                interests.
              </p>
            </div>

            <div className="relative mx-[-10px]">
              {/* Floating Navigation Buttons */}
              <button className="rel-prev-btn absolute left-[-22px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 transition-all hover:bg-primary hover:text-white hover:border-primary disabled:opacity-0 disabled:pointer-events-none z-30 shadow-md cursor-pointer">
                <ChevronL className="w-4 h-4" />
              </button>
              <button className="rel-next-btn absolute right-[-22px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 transition-all hover:bg-primary hover:text-white hover:border-primary disabled:opacity-0 disabled:pointer-events-none z-30 shadow-md cursor-pointer">
                <ChevronR className="w-4 h-4" />
              </button>

              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={16}
                slidesPerView={1.2}
                autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                navigation={{
                  prevEl: '.rel-prev-btn',
                  nextEl: '.rel-next-btn',
                }}
                breakpoints={{
                  640: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 5 },
                }}
                className="!p-1"
              >
                {relatedProperties.map((p) => (
                  <SwiperSlide key={p.id}>
                    <PropertyCard property={p} variant="vertical" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-white hover:border-primary hover:text-primary hover:shadow-sm transition-all group cursor-pointer"
                onClick={() => navigate(`/city/${property.city}`)}
              >
                <span>View All in {property.city}</span>
                <ArrowR className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Document preview modal */}
      {docPreview &&
        (() => {
          const currentUrl = docPreview.urls[docPreview.index];
          const showPdf = isPdfUrl(currentUrl);
          const hasMultiple = docPreview.urls.length > 1;
          return (
            <div
              className="fixed inset-0 z-[10002] flex items-center justify-center p-3 sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="doc-preview-title"
            >
              <button
                type="button"
                className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"
                onClick={closeDocPreview}
                aria-label="Close document preview"
              />
              <div className="relative z-10 flex w-full max-w-5xl max-h-[92vh] flex-col overflow-hidden rounded-md bg-white shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <h3
                      id="doc-preview-title"
                      className="text-base font-semibold text-slate-900 truncate m-0"
                    >
                      {docPreview.title}
                    </h3>
                    {hasMultiple && (
                      <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                        Document {docPreview.index + 1} of {docPreview.urls.length}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={closeDocPreview}
                    className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center shrink-0 cursor-pointer"
                    aria-label="Close"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-auto bg-slate-100 p-3 sm:p-5">
                  {showPdf ? (
                    <iframe
                      title={docPreview.title}
                      src={currentUrl}
                      className="w-full h-[min(72vh,680px)] rounded-xl border border-slate-200 bg-white"
                    />
                  ) : (
                    <img
                      src={currentUrl}
                      alt={docPreview.title}
                      className="max-w-full max-h-[72vh] mx-auto rounded-xl border border-slate-200 bg-white object-contain shadow-sm"
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 sm:px-5 bg-white">
                  {hasMultiple ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() =>
                          setDocPreview((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  index: (prev.index - 1 + prev.urls.length) % prev.urls.length,
                                }
                              : null
                          )
                        }
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() =>
                          setDocPreview((prev) =>
                            prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : null
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      {showPdf ? 'PDF preview' : 'Image preview'}
                    </span>
                  )}
                  {/* <a
                    href={currentUrl}
                    download
                    className="text-sm font-semibold text-primary hover:text-primary no-underline"
                  >
                    Download
                  </a> */}
                </div>
              </div>
            </div>
          );
        })()}

      {/* ─── MOBILE BOTTOM STICKY BAR ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 p-3 shadow-lg flex justify-between items-center">
        <div>
          <div className="text-slate-800 font-semibold text-base leading-none">
            {property.price}
          </div>
          {property.pricing?.pricePerSqft && (
            <div className="text-slate-400 font-medium text-xs mt-1">
              ₹{property.pricing.pricePerSqft.toLocaleString()}/sq.ft
            </div>
          )}
        </div>
        <button
          type="button"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer active:scale-95 transition-all"
          onClick={handleScheduleSiteVisit}
        >
          Book Site Visit
        </button>
      </div>
    </div>
  );
}
