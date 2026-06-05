import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { PinIco, BedIco, BathIco, AreaIco } from '../../data/icons';
import { usePropertyPreviewDetails } from '../../hooks/usePropertiesQuery';
import { slugOrId } from '../../utils/slugOrId';
import { resolvePropertyImage } from '../../utils/share';
import { getCompletionPercentage } from '../../utils/propertyCompletion';

// ─── Formatting helpers ───────────────────────────────────────────────────────

export const formatPropertyPrice = (p) => {
  if (p == null || p === 0) return 'Price on Request';
  const n = Number(p);
  if (!Number.isFinite(n) || n === 0) return 'Price on Request';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')} Lac`;
  return `₹${n.toLocaleString('en-IN')}`;
};

/** Prefer Cr / Lac from raw API totals; keep pre-formatted list strings (e.g. "₹ 1.25 Cr"). */
export const resolvePropertyPrice = (property) => {
  const total = property?.financials?.totalPrice ?? property?.pricing?.totalPrice ?? null;

  if (total != null && total !== 0) return formatPropertyPrice(total);

  const p = property?.price;
  if (p == null || p === '' || p === 0) return 'Price on Request';
  if (typeof p === 'number') return formatPropertyPrice(p);

  const str = String(p).trim();
  if (/\bCr\b/i.test(str) || /\bLac\b/i.test(str) || /\bL\b/i.test(str)) return str;

  const digitsOnly = str.replace(/[₹,\s]/g, '');
  if (/^\d+(\.\d+)?$/.test(digitsOnly)) {
    return formatPropertyPrice(Number(digitsOnly));
  }

  return str;
};

export const formatBedsDisplay = (beds) => {
  if (beds == null || beds === '') return null;
  const s = String(beds).trim();
  if (!s) return null;
  if (s.toLowerCase().includes('bhk')) return s;
  if (/^\d+$/.test(s)) return `${s} BHK`;
  return s;
};

export const formatBathsDisplay = (baths) => {
  if (baths == null || baths === '') return null;
  const s = String(baths).trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return `${s} Bath`;
  return s;
};

export const formatSizeWithUnit = (size, unit) => {
  if (size == null || size === '') return null;
  const u = unit ? String(unit).trim() : '';
  return u ? `${size} ${u}` : String(size);
};

export const getFullAddress = (property) => {
  if (property.loc) return property.loc;
  const a = property.address;
  if (!a) return 'Location on request';
  if (typeof a === 'string') return a;
  const parts = [a.addressLine1, a.locality, a.city, a.state].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Location on request';
};

export const getPropertyStats = (property) => {
  const type = (property.propertyType?.name || property.propertyType || '')
    .toString()
    .toLowerCase();

  if (type.includes('plot') || type.includes('land')) {
    return [
      {
        label: 'Plot area',
        val:
          formatSizeWithUnit(property.size, property.financials?.priceUnit) || property.size || '—',
        icon: 'area',
      },
      { label: 'Facing', val: property.direction || property.facing || '—', icon: 'pin' },
    ];
  }

  if (type.includes('commercial') || type.includes('office') || type.includes('retail')) {
    return [
      {
        label: 'Built-up',
        val:
          formatSizeWithUnit(property.size, property.financials?.priceUnit) || property.size || '—',
        icon: 'area',
      },
      {
        label: 'Type',
        val: property.propertyType?.name || property.propertyType || 'Commercial',
        icon: null,
      },
    ];
  }

  const beds = formatBedsDisplay(property.beds || property.specifications?.bhkConfig);
  const baths = formatBathsDisplay(property.baths || property.specifications?.washrooms);
  const sizeVal = formatSizeWithUnit(
    property.size || property.specifications?.builtUpArea,
    property.financials?.priceUnit
  );

  const items = [];
  if (beds) items.push({ label: 'Configuration', val: beds, icon: 'bed' });
  if (baths) items.push({ label: 'Bathrooms', val: baths, icon: 'bath' });
  if (sizeVal) items.push({ label: 'Built-up area', val: sizeVal, icon: 'area' });
  return items;
};

const formatPurpose = (property) => {
  // Keep transaction purpose (rent/sale) separate from subscription listingType
  // to avoid duplicate badges like "Featured Listing" + "featured_listing".
  const p = property.purpose || property.financials?.listingType;
  if (!p) return null;
  const s = String(p).toLowerCase();
  // Ignore subscription listing placement values in purpose slot.
  if (s.includes('featured') || s.includes('premium')) return null;
  if (s.includes('rent')) return { label: 'For Rent', tone: 'sky' };
  if (s.includes('sell')) return { label: 'For Sale', tone: 'emerald' };
  return null;
};

export const getPropertyDisplayData = (property, formatPriceFn = resolvePropertyPrice) => {
  const fullAddress = getFullAddress(property);
  const displayLoc = fullAddress.split(',')[0]?.trim() || fullAddress;
  const dist = property?.distance;
  const distanceKm =
    dist != null && dist !== '' && !Number.isNaN(Number(dist)) ? Number(dist) : null;

  const priceUnit = property.financials?.priceUnit || property.pricing?.priceUnit || null;
  const totalPrice = property.financials?.totalPrice ?? property.pricing?.totalPrice;

  const pricePerSqft =
    property.pricing?.pricePerSqft ||
    property.financials?.pricePerSft ||
    property.financials?.pricePerSqft;

  const city = typeof property.address === 'object' ? property.address?.city : null;
  const specs = property.specifications || {};

  const amenities = Array.isArray(property.amenities) ? property.amenities.filter(Boolean) : [];

  const purpose = formatPurpose(property);

  const description =
    property.description || property.projectDescription || property.overview || null;

  const photoCount = property.media?.photos?.length ?? 0;
  const listedBy =
    property.userId && typeof property.userId === 'object'
      ? property.userId.name || property.userId.type
      : null;

  const completionPct = getCompletionPercentage(property);

  return {
    price: formatPriceFn(property),
    priceUnit,
    title: property.title || property.projectName || 'Property',
    fullAddress,
    city,
    displayLoc,
    locationLine:
      distanceKm != null ? `${distanceKm.toFixed(1)} km away · ${displayLoc}` : fullAddress,
    propertyTypeName: property.propertyType?.name || property.propertyType || null,
    status: property.status || property.financials?.propertyStatus || null,
    beds: formatBedsDisplay(property.beds || specs.bhkConfig),
    baths: formatBathsDisplay(property.baths || specs.washrooms),
    sizeLabel: formatSizeWithUnit(property.size || specs.builtUpArea, priceUnit),
    pricePerSqft: pricePerSqft ? Number(pricePerSqft) : null,
    furnishing: property.furnishingStatus || specs.furnishing || null,
    facing: property.direction || property.facing || specs.facing || null,
    possession:
      property.possessionStatus ||
      specs.possessionStatus ||
      property.financials?.possessionStatus ||
      null,
    developer: property.developerName || property.developer || null,
    rating: property.rating ?? property.averageRating ?? null,
    purpose,
    amenities,
    description,
    photoCount,
    listedBy,
    vastu:
      property.vastuCompliant === true
        ? 'Vastu compliant'
        : property.vastuCompliant === false
          ? 'Not vastu compliant'
          : null,
    carpetArea: formatSizeWithUnit(specs.carpetArea, priceUnit),
    superBuiltUp: formatSizeWithUnit(specs.superBuiltUpArea || specs.superBuiltupArea, priceUnit),
    floor: specs.floorNumber ?? specs.floor ?? null,
    propertyAge: specs.propertyAge ?? specs.ageOfProperty ?? null,
    gstStatus: property.financials?.gstStatus ?? null,
    stampDuty: property.financials?.stampDuty ?? null,
    completionPercentage: completionPct,
    showCompletionBadge: completionPct != null,
    stats: getPropertyStats(property),
    extraRows: buildExtraDetailRows(property),
  };
};

function buildExtraDetailRows(property) {
  const specs = property.specifications || {};
  const priceUnit = property.financials?.priceUnit || property.pricing?.priceUnit || null;
  const listedBy =
    property.userId && typeof property.userId === 'object'
      ? property.userId.name || property.userId.type
      : null;
  const vastu =
    property.vastuCompliant === true
      ? 'Vastu compliant'
      : property.vastuCompliant === false
        ? 'Not vastu compliant'
        : null;

  const rows = [];
  const push = (label, value) => {
    if (value != null && value !== '' && value !== '—' && value !== 'N/A') {
      rows.push({ label, value: String(value) });
    }
  };

  push('Carpet area', formatSizeWithUnit(specs.carpetArea, priceUnit));
  push(
    'Super built-up',
    formatSizeWithUnit(specs.superBuiltUpArea || specs.superBuiltupArea, priceUnit)
  );
  push('Floor', specs.floorNumber ?? specs.floor);
  push('Property age', specs.propertyAge ?? specs.ageOfProperty);
  push(
    'Possession',
    property.possessionStatus || specs.possessionStatus || property.financials?.possessionStatus
  );
  push('Furnishing', property.furnishingStatus || specs.furnishing);
  push('Facing', property.direction || property.facing || specs.facing);
  push('Vastu', vastu);
  push('GST', property.financials?.gstStatus);
  push('Stamp duty', property.financials?.stampDuty);
  push('Listed by', listedBy);
  push('Developer', property.developerName || property.developer);

  return rows;
}

export const StatIcon = ({ type, className = '' }) => {
  const cls = `w-4 h-4 text-amber-500 ${className}`.trim();
  if (type === 'bed') return <BedIco className={cls} strokeWidth={2.5} />;
  if (type === 'bath') return <BathIco className={cls} strokeWidth={2.5} />;
  if (type === 'area') return <AreaIco className={cls} strokeWidth={2.5} />;
  if (type === 'pin') return <PinIco className={cls} strokeWidth={2.5} />;
  return null;
};

// ─── Positioning (beside card — stable, not cursor-following) ─────────────────

const OPEN_DELAY = 300;
/** Short bridge when moving between card ↔ preview (same property) */
const CLOSE_BRIDGE_MS = 70;
const PANEL_W = 460;
const PANEL_H = 310;
const GAP = 16;
const VIEWPORT_PAD = 16;

const canUseHoverPreview = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const isPointInRect = (x, y, rect, padding = 0) => {
  if (!rect) return false;
  return (
    x >= rect.left - padding &&
    x <= rect.right + padding &&
    y >= rect.top - padding &&
    y <= rect.bottom + padding
  );
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function computePreviewPosition(cardEl) {
  if (!cardEl || typeof window === 'undefined') {
    return { top: VIEWPORT_PAD, left: VIEWPORT_PAD, placement: 'right', arrowOffset: 120 };
  }

  const rect = cardEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardCenterY = rect.top + rect.height / 2;

  const clampTop = (preferredTop) => clamp(preferredTop, VIEWPORT_PAD, vh - PANEL_H - VIEWPORT_PAD);

  const spaceRight = vw - rect.right - GAP;
  const spaceLeft = rect.left - GAP;
  const spaceBelow = vh - rect.bottom - GAP;
  const spaceAbove = rect.top - GAP;

  if (spaceRight >= PANEL_W) {
    const left = rect.right + GAP;
    const top = clampTop(cardCenterY - PANEL_H / 2);
    return {
      top,
      left,
      placement: 'right',
      arrowOffset: clamp(cardCenterY - top, 28, PANEL_H - 28),
    };
  }

  if (spaceLeft >= PANEL_W) {
    const left = rect.left - GAP - PANEL_W;
    const top = clampTop(cardCenterY - PANEL_H / 2);
    return {
      top,
      left,
      placement: 'left',
      arrowOffset: clamp(cardCenterY - top, 28, PANEL_H - 28),
    };
  }

  const left = clamp(rect.left, VIEWPORT_PAD, vw - PANEL_W - VIEWPORT_PAD);

  if (spaceBelow >= PANEL_H) {
    return {
      top: rect.bottom + GAP,
      left,
      placement: 'bottom',
      arrowOffset: clamp(rect.left + rect.width / 2 - left, 28, PANEL_W - 28),
    };
  }

  if (spaceAbove >= PANEL_H) {
    return {
      top: rect.top - GAP - PANEL_H,
      left,
      placement: 'top',
      arrowOffset: clamp(rect.left + rect.width / 2 - left, 28, PANEL_W - 28),
    };
  }

  const top = clampTop(spaceBelow >= spaceAbove ? rect.bottom + GAP : rect.top - GAP - PANEL_H);
  return {
    top,
    left,
    placement: spaceBelow >= spaceAbove ? 'bottom' : 'top',
    arrowOffset: clamp(rect.left + rect.width / 2 - left, 28, PANEL_W - 28),
  };
}

function getPreviewRect(position) {
  return {
    top: position.top,
    left: position.left,
    right: position.left + PANEL_W,
    bottom: position.top + PANEL_H,
    width: PANEL_W,
    height: PANEL_H,
  };
}

/** Ensures only one property hover preview is visible across all cards */
const previewSessions = new Map();

function closeAllPreviewsExcept(exceptId) {
  previewSessions.forEach((closeNow, id) => {
    if (id !== exceptId) closeNow();
  });
}

export function usePropertyHoverPreview(enabled = true) {
  const ownerIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `preview-${Math.random().toString(36).slice(2)}`
  );
  const ownerId = ownerIdRef.current;

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: 'right',
    arrowOffset: 120,
  });
  const cardRef = useRef(null);
  const previewRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const hoverCapable = useRef(canUseHoverPreview());

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const clearTimers = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
  }, [clearOpenTimer, clearCloseTimer]);

  const updatePosition = useCallback(() => {
    setPosition(computePreviewPosition(cardRef.current));
  }, []);

  const closeNow = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers]);

  const openPreview = useCallback(() => {
    if (!enabled || !hoverCapable.current) return;
    closeAllPreviewsExcept(ownerId);
    updatePosition();
    setOpen(true);
  }, [enabled, updatePosition, ownerId]);

  const scheduleOpen = useCallback(() => {
    if (!enabled || !hoverCapable.current) return;
    closeAllPreviewsExcept(ownerId);
    clearOpenTimer();
    clearCloseTimer();
    openTimerRef.current = setTimeout(openPreview, OPEN_DELAY);
  }, [enabled, openPreview, clearOpenTimer, clearCloseTimer, ownerId]);

  const scheduleClose = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, CLOSE_BRIDGE_MS);
  }, [clearOpenTimer, clearCloseTimer]);

  const cancelClose = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  /** Call when pointer enters a card — dismiss any other card's preview immediately */
  const claimHover = useCallback(() => {
    if (!enabled || !hoverCapable.current) return;
    closeAllPreviewsExcept(ownerId);
    clearCloseTimer();
    clearOpenTimer();
  }, [enabled, clearCloseTimer, clearOpenTimer, ownerId]);

  useEffect(() => {
    previewSessions.set(ownerId, closeNow);
    return () => {
      previewSessions.delete(ownerId);
      closeNow();
    };
  }, [ownerId, closeNow]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerMove = (e) => {
      const { clientX, clientY } = e;
      const cardRect = cardRef.current?.getBoundingClientRect();
      const previewRect = previewRef.current?.getBoundingClientRect();

      const onCard = isPointInRect(clientX, clientY, cardRect, 8);
      const onPreview = previewRect && isPointInRect(clientX, clientY, previewRect, 12);

      if (!onCard && !onPreview) {
        closeNow();
      } else {
        cancelClose();
      }
    };

    const onScrollOrResize = (e) => {
      const target = e?.target;
      if (target instanceof Node && previewRef.current?.contains(target)) return;
      closeNow();
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, closeNow, cancelClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeNow();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeNow]);

  return {
    open,
    position,
    cardRef,
    previewRef,
    scheduleOpen,
    scheduleClose,
    cancelClose,
    claimHover,
    closeNow,
  };
}

// ─── Preview UI ─────────────────────────────────────────────────────────────

const PURPOSE_STYLES = {
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
  sky: 'bg-sky-50 text-sky-800 ring-sky-200/80',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200/80',
};

const getListingTypeMeta = (listingType) => {
  // Preview badge must rely on explicit listingType only.
  const raw = String(listingType || '')
    .trim()
    .toLowerCase();
  const normalized = raw.replace(/\s+/g, '_');
  const isFeatured = normalized === 'featured_listing' || normalized === 'featured';

  if (isFeatured) {
    return {
      label: 'Featured Listing',
      className: 'bg-indigo-500/90 text-white ring-indigo-300/80',
    };
  }

  return {
    label: 'Premium Listing',
    className: 'bg-amber-400/95 text-slate-900 ring-amber-200/90',
  };
};

const DetailCell = memo(function DetailCell({ icon, label, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg bg-slate-50 px-2 py-2 ring-1 ring-slate-100">
      {icon ? <StatIcon type={icon} className="!h-3.5 !w-3.5" /> : null}
      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="w-full truncate text-center text-[11px] font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
});

const PreviewSkeleton = () => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
  </div>
);

const PropertyHoverPreview = memo(function PropertyHoverPreview({
  property,
  imageSrc,
  position,
  isOpen,
  previewRef,
  onMouseEnter,
  onMouseLeave,
}) {
  if (typeof document === 'undefined') return null;

  const navigate = useNavigate();
  const propertyId = slugOrId(property);
  const { data: fetched, isFetching } = usePropertyPreviewDetails(propertyId, isOpen);
  const previewListingType =
    property?.listingType ||
    property?.listingPlacement ||
    fetched?.listingType ||
    fetched?.listingPlacement ||
    'premium_listing';

  const mergedProperty = useMemo(() => {
    if (!fetched) return property;
    return {
      ...property,
      ...fetched,
      listingType: previewListingType,
    };
  }, [property, fetched, previewListingType]);

  const resolvedImage = resolvePropertyImage(mergedProperty, imageSrc);
  const data = getPropertyDisplayData(mergedProperty);
  const placement = position?.placement || 'right';
  const arrowOffset = position?.arrowOffset ?? 120;
  const pct = data.completionPercentage ?? 0;
  const showLoading = isFetching && !fetched;
  const listingTypeMeta = getListingTypeMeta(previewListingType);
  const statusLabel = data.status ? String(data.status) : '';
  const isVerifiedStatus = statusLabel.toLowerCase().includes('verified');

  const arrow =
    placement === 'right' ? (
      <div
        className="absolute -left-[7px] h-3 w-3 rotate-45 border-b border-l border-slate-200/90 bg-white shadow-[-2px_2px_6px_rgba(15,23,42,0.06)]"
        style={{ top: arrowOffset - 6 }}
        aria-hidden
      />
    ) : placement === 'left' ? (
      <div
        className="absolute -right-[7px] h-3 w-3 rotate-[225deg] border-b border-l border-slate-200/90 bg-white shadow-[2px_2px_6px_rgba(15,23,42,0.06)]"
        style={{ top: arrowOffset - 6 }}
        aria-hidden
      />
    ) : placement === 'bottom' ? (
      <div
        className="absolute -top-[7px] h-3 w-3 rotate-45 border-l border-t border-slate-200/90 bg-white shadow-[-2px_-2px_6px_rgba(15,23,42,0.06)]"
        style={{ left: arrowOffset - 6 }}
        aria-hidden
      />
    ) : (
      <div
        className="absolute -bottom-[7px] h-3 w-3 rotate-[225deg] border-l border-t border-slate-200/90 bg-white shadow-[2px_2px_6px_rgba(15,23,42,0.06)]"
        style={{ left: arrowOffset - 6 }}
        aria-hidden
      />
    );

  const handleNavigateToDetails = (e) => {
    // Prevent the hover card click from bubbling to parent cards/lists.
    e.preventDefault();
    e.stopPropagation();
    if (!propertyId) return;
    navigate(`/property/${encodeURIComponent(propertyId)}`);
  };

  return createPortal(
    <div
      ref={previewRef}
      className="property-hover-preview-root pointer-events-auto fixed z-[9990]"
      style={{
        top: position.top,
        left: position.left,
        width: PANEL_W,
        animation: 'propertyPreviewIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="presentation"
    >
      <style>{`
        @keyframes propertyPreviewIn {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {arrow}

      <article
        className="relative flex h-[310px] w-full flex-row cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.04)]"
        role="button"
        tabIndex={0}
        aria-label="View property details"
        onClick={handleNavigateToDetails}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleNavigateToDetails(e);
        }}
      >
        {showLoading && <PreviewSkeleton />}

        {/* Left — image */}
        <div className="relative w-[38%] shrink-0 overflow-hidden border-r border-slate-100 bg-slate-100">
          <img src={resolvedImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute left-2.5 right-2.5 top-2.5 flex flex-wrap gap-1">
            <span
              className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ${listingTypeMeta.className}`}
            >
              {listingTypeMeta.label}
            </span>
            {data.purpose && (
              <span
                className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ${PURPOSE_STYLES[data.purpose.tone] || PURPOSE_STYLES.slate}`}
              >
                {data.purpose.label}
              </span>
            )}
            {data.status && (
              <span className="rounded-md bg-slate-900/85 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                {isVerifiedStatus && data.showCompletionBadge ? `${pct}% Verified` : data.status}
              </span>
            )}
          </div>
          {data.photoCount > 1 && (
            <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
              +{data.photoCount - 1} photos
            </span>
          )}
          {data.showCompletionBadge && !isVerifiedStatus && (
            <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm">
              {pct}% verified
            </span>
          )}
        </div>

        {/* Right — details from API */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col font-sans">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            {data.propertyTypeName && (
              <p className="m-0 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-600">
                {data.propertyTypeName}
              </p>
            )}
            <h3 className="m-0 mt-0.5 line-clamp-2 text-[16px] font-bold leading-snug text-slate-900">
              {data.title}
            </h3>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <p className="m-0 text-[22px] font-bold text-slate-900">{data.price}</p>
              {/* {data.rating != null && !Number.isNaN(Number(data.rating)) && (
                <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                  ★ {Number(data.rating).toFixed(1)}
                </span>
              )} */}
            </div>
            {data.pricePerSqft != null && data.price !== 'Price on Request' && (
              <p className="m-0 mt-0.5 text-[11px] text-slate-500">
                ₹{data.pricePerSqft.toLocaleString('en-IN')} per sq.ft
                {data.priceUnit ? ` · ${data.priceUnit}` : ''}
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 [scrollbar-width:thin]">
            <p className="m-0 flex items-start gap-1.5 text-[12px] leading-relaxed text-slate-600">
              <PinIco size={14} strokeWidth={2.5} className="mt-0.5 shrink-0 text-amber-500" />
              <span>{data.fullAddress}</span>
            </p>

            {data.stats.length > 0 && !data.extraRows.length > 0 && (
              <div className="mt-3 flex gap-2">
                {data.stats.map((s) => (
                  <DetailCell key={s.label} icon={s.icon} label={s.label} value={s.val} />
                ))}
              </div>
            )}

            {data.extraRows.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
                {data.extraRows.map((row) => (
                  <div key={row.label} className="min-w-0">
                    <p className="m-0 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      {row.label}
                    </p>
                    <p className="m-0 mt-0.5 text-[12px] font-semibold leading-snug text-slate-800">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {data.description && (
              <p className="m-0 mt-3 line-clamp-2 border-t border-slate-100 pt-3 text-[12px] leading-relaxed text-slate-600">
                {data.description}
              </p>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-4 py-2 flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-primary hover:bg-primary-600 text-white px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-sm"
              onClick={handleNavigateToDetails}
            >
              View Details
            </button>
          </div>
        </div>
      </article>
    </div>,
    document.body
  );
});

export default PropertyHoverPreview;
