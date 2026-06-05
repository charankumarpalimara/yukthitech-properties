import {
  useVendorProductsStore,
  updatePropertyStatus,
  fetchPropertyById,
} from '../../../store/vendorProductsStore';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  LayoutGrid,
  CheckCircle2,
  Play,
  FileText,
  Share2,
  Heart,
  Eye,
  Activity,
  Edit3,
  AlertCircle,
  XCircle,
  Shield,
  Users,
  Maximize2,
  MessageSquare,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import Modal from '../../vendor/components/ui/Modal';
import PropertyForm from '../../vendor/components/ui/PropertyForm2';
import {
  upBtnPrimary,
  upBtnSecondary,
  upInput,
  vpPage,
  vpHeader,
  vpHeaderTitle,
  vpHeaderSubtitle,
  vpPanel,
  vpStatGrid,
  vpStatCard,
  vpStatIcon,
  vpStatLabel,
  vpStatValue,
  vpStatSub,
  vpDetailLabel,
  vpDetailValue,
  vpDetailMuted,
  vpStatusCompleted,
  vpStatusPending,
  vpStatusFailed,
  vpInfoBox,
  vpActionBtn,
  vpPropMedia,
  vpPropThumb,
  vpPropThumbActive,
  vpPropThumbInactive,
  vpPropSectionHead,
  vpPropSpecRow,
  vpPropAlert,
  upSection,
  upSectionAccent,
  upSectionTitle,
  upSectionLine,
} from '../userPanelStyles';
import {
  formatDevelopmentRatio,
  getDevelopmentShare,
  isLandForDevelopmentType,
} from '../../../utils/developmentShare';

const getYouTubeID = (url) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

const isMediaVideo = (url) => {
  if (!url) return false;
  return (
    url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/i) ||
    url.includes('/video/upload/') ||
    getYouTubeID(url)
  );
};

const formatPrice = (price) => {
  if (!price) return 'TBD';
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) return price;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

const formatCount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return '0';
  return n.toLocaleString('en-IN');
};

const statusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'verified' || s === 'active') return vpStatusCompleted;
  if (s === 'pending' || s === 'processing') return vpStatusPending;
  if (s === 'rejected') return vpStatusFailed;
  return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-semibold bg-slate-50 text-slate-600 border-slate-200 capitalize';
};

function SectionBlock({ icon: Icon, title, children }) {
  return (
    <div className={`${vpPanel} p-5 sm:p-6`}>
      <div className={vpPropSectionHead}>
        {Icon ? <Icon size={16} className="text-primary shrink-0" /> : null}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function SpecTable({ rows }) {
  const visible = rows.filter((r) => r.value != null && r.value !== '' && r.value !== 'N/A ');
  if (!visible.length) return null;
  return (
    <div className="divide-y divide-slate-50">
      {visible.map((row) => (
        <div key={row.label} className={vpPropSpecRow}>
          <span className={vpDetailLabel}>{row.label}</span>
          <span className={`${vpDetailValue} sm:text-right capitalize break-words`}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatusAlert({ tone, icon: Icon, title, message, actionLabel, onAction }) {
  const tones = {
    rejected: 'bg-rose-50 border-rose-200 text-rose-900',
    pending: 'bg-amber-50 border-amber-200 text-amber-900',
    verified: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  };
  const btnTones = {
    rejected: 'bg-rose-600 hover:bg-rose-700',
    pending: 'bg-amber-600 hover:bg-amber-700',
    verified: 'bg-emerald-600 hover:bg-emerald-700',
  };
  return (
    <div className={`${vpPropAlert} ${tones[tone]}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-sm bg-white/70 border border-current/10 flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">{title}</p>
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className={`${upBtnPrimary} min-w-0 inline-flex items-center gap-2 ${btnTones[tone]}`}
      >
        <Edit3 size={14} />
        {actionLabel}
      </button>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const list = useVendorProductsStore((s) => s.list);
  const currentProperty = useVendorProductsStore((s) => s.currentProperty);
  const loading = useVendorProductsStore((s) => s.loading);
  const error = useVendorProductsStore((s) => s.error);
  const product = currentProperty?._id === id ? currentProperty : list.find((p) => p._id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);

  useEffect(() => {
    if (id) fetchPropertyById(id);
  }, [id]);

  const onBack = () => navigate(-1);
  const goEdit = () => navigate(`/profile/create-property/${product?._id}`);

  const displayMedia = useMemo(() => {
    if (activeMedia) return activeMedia;
    if (product?.media?.youtubevideo) return { type: 'video', url: product.media.youtubevideo };
    if (product?.media?.poster) return { type: 'image', url: product.media.poster };
    if (product?.media?.photos?.[0]) {
      const url = product.media.photos[0];
      return { type: isMediaVideo(url) ? 'video' : 'image', url };
    }
    return { type: 'image', url: 'https://via.placeholder.com/800x600?text=No+Image' };
  }, [activeMedia, product]);

  const specRows = useMemo(() => {
    if (!product) return [];
    const specs = product.specifications || {};
    const areaUnit = specs.totalAreaUnit || specs.plotAreaUnit || 'Sft';
    const fmt = (area) => (area != null && area !== '' ? `${area} ${areaUnit}` : null);
    const propertyTypeName = product.propertyType?.name;
    const isLandForDevelopment = isLandForDevelopmentType(propertyTypeName);
    const developmentShare = isLandForDevelopment ? getDevelopmentShare(product) : null;

    return [
      { label: 'Project / Society', value: product.projectName },
      { label: 'Property Type', value: propertyTypeName },
      { label: 'BHK Configuration', value: specs.bhkConfig },
      { label: 'Total Area', value: fmt(specs.totalArea) },
      { label: 'Built-up Area', value: fmt(specs.builtUpArea) },
      { label: 'Plot Area', value: fmt(specs.plotArea) },
      {
        label: 'Dimensions (L × W)',
        value:
          specs.dimensions?.length && specs.dimensions?.width
            ? `${specs.dimensions.length} × ${specs.dimensions.width} ft`
            : null,
      },
      { label: 'Facing', value: specs.facing },
      { label: 'Total Floors', value: specs.numberOfFloors },
      { label: 'Floor Number', value: specs.floorNumber },
      { label: 'Vastu Compliant', value: specs.vastuCompliant },
      { label: 'Boundary Wall', value: specs.boundaryWall },
      { label: 'Road Width', value: specs.roadWidth ? `${specs.roadWidth} ft` : null },
      ...(developmentShare
        ? [
            { label: 'Builder Ratio', value: formatDevelopmentRatio(developmentShare.builder) },
            { label: 'Owner Ratio', value: formatDevelopmentRatio(developmentShare.owner) },
          ]
        : []),
      { label: 'Commercial Type', value: specs.commercialType },
      { label: 'Washrooms', value: specs.washrooms },
      {
        label: 'RERA Number',
        value: product.propertyDocument?.rera?.number || product.documents?.rera?.number,
      },
      {
        label: 'RERA Expiry',
        value:
          product.propertyDocument?.rera?.expiry || product.documents?.rera?.expiry
            ? new Date(
                product.propertyDocument?.rera?.expiry || product.documents?.rera?.expiry
              ).toLocaleDateString('en-IN')
            : null,
      },
      { label: 'Video Editing Consent', value: product.media?.videoConsent ? 'Granted' : 'Not granted' },
      { label: 'Approved By', value: product.projectApprovedBy },
      {
        label: 'Listed On',
        value: product.createdAt
          ? new Date(product.createdAt).toLocaleDateString('en-IN')
          : null,
      },
    ];
  }, [product]);

  if (loading || (!product && !error)) {
    return (
      <div className={`${vpPage} flex flex-col items-center justify-center min-h-[50vh]`}>
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className={`${vpDetailMuted} mt-4`}>Loading property details…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`${vpPage} flex flex-col items-center justify-center min-h-[50vh]`}>
        <div className={vpPanel + ' p-10 text-center max-w-md w-full'}>
          <Building2 size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className={vpHeaderTitle}>Property not found</h3>
          <p className={`${vpHeaderSubtitle} mb-6`}>
            {error || 'This listing may have been removed or is unavailable.'}
          </p>
          <button type="button" onClick={onBack} className={`${upBtnSecondary} inline-flex items-center gap-2`}>
            <ArrowLeft size={14} />
            Back to properties
          </button>
        </div>
      </div>
    );
  }

  const propertyTypeName = product.propertyType?.name;
  const isLandForDevelopment = isLandForDevelopmentType(propertyTypeName);
  const developmentShare = isLandForDevelopment ? getDevelopmentShare(product) : null;
  const heroAreaLabel = (() => {
    const specs = product.specifications || {};
    const area = specs.totalArea || specs.builtUpArea || specs.plotArea;
    const unit = specs.totalAreaUnit || specs.plotAreaUnit || 'Sft';
    return area ? `${area} ${unit}` : null;
  })();

  const priceSub =
    product.financials?.pricePerSft
      ? `₹${Number(product.financials.pricePerSft).toLocaleString('en-IN')} / sft`
      : product.financials?.pricePerSqYard
        ? `₹${Number(product.financials.pricePerSqYard).toLocaleString('en-IN')} / sq yd`
        : product.financials?.pricePerAcre
          ? `₹${Number(product.financials.pricePerAcre).toLocaleString('en-IN')} / acre`
          : 'Price on request';

  const mediaThumbs = [
    ...(product.media?.youtubevideo
      ? [{ type: 'video', url: product.media.youtubevideo, thumb: `https://img.youtube.com/vi/${getYouTubeID(product.media.youtubevideo)}/mqdefault.jpg` }]
      : []),
    ...(product.media?.video && !product.media?.youtubevideo
      ? [{
          type: 'video',
          url: product.media.video,
          thumb: getYouTubeID(product.media.video)
            ? `https://img.youtube.com/vi/${getYouTubeID(product.media.video)}/mqdefault.jpg`
            : product.media?.poster || product.media?.photos?.[0],
        }]
      : []),
    ...(product.media?.photos || []).map((url) => ({
      type: isMediaVideo(url) ? 'video' : 'image',
      url,
      thumb: isMediaVideo(url) ? product.media?.poster || url : url,
    })),
  ];

  const legalDocs = [
    ...(Array.isArray(product.propertyDocument?.rera?.certificate)
      ? product.propertyDocument.rera.certificate.map((cert, i) => ({
          id: `rera-${i}`,
          label: `RERA ${i + 1}`,
          doc: cert,
          number: product.propertyDocument?.rera?.number,
        }))
      : [{
          id: 'rera',
          label: 'RERA Certificate',
          doc: product.propertyDocument?.rera?.certificate,
          number: product.propertyDocument?.rera?.number,
        }]),
    { id: 'layout', label: 'Layout Permission', doc: product.propertyDocument?.layoutPermission?.doc, number: product.propertyDocument?.layoutPermission?.number },
    { id: 'building', label: 'Building Permission', doc: product.propertyDocument?.buildingPermission?.doc, number: product.propertyDocument?.buildingPermission?.number },
    { id: 'hmda', label: 'HMDA Approval', doc: product.propertyDocument?.hmdaApproval?.doc, number: product.propertyDocument?.hmdaApproval?.number },
    ...(product.propertyDocument?.additionalApprovals || []).map((app) => ({
      id: app._id,
      label: app.title,
      doc: app.doc,
      number: app.number,
    })),
  ].filter((d) => d.doc || d.number);

  return (
    <div className={vpPage}>
      <div className={vpHeader}>
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button type="button" onClick={onBack} className={vpActionBtn} aria-label="Go back">
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={vpHeaderTitle}>{product.projectName}</h1>
              <span className={statusBadgeClass(product.status)}>{product.status}</span>
              {product.completionPercentage != null && (
                <span className={vpStatusPending}>{product.completionPercentage}% complete</span>
              )}
            </div>
            <p className={`${vpHeaderSubtitle} flex items-center gap-1.5`}>
              <MapPin size={14} className="shrink-0" />
              {product.address?.addressLine1 || product.address?.addressLine2 || 'Location not set'}
            </p>
          </div>
        </div>
        {!isEditing && (
          <button type="button" onClick={goEdit} className={`${upBtnPrimary} inline-flex items-center gap-2 shrink-0`}>
            <Edit3 size={14} />
            Edit listing
          </button>
        )}
      </div>

      {product.status === 'rejected' && (
        <StatusAlert
          tone="rejected"
          icon={XCircle}
          title="Listing rejected"
          message={product.rejectionReason || 'Review the feedback and update your listing to resubmit.'}
          actionLabel="Fix & resubmit"
          onAction={goEdit}
        />
      )}
      {product.status === 'pending' && (
        <StatusAlert
          tone="pending"
          icon={AlertCircle}
          title="Pending review"
          message="This listing is awaiting admin approval. Editing will send it back for review."
          actionLabel="Edit property"
          onAction={goEdit}
        />
      )}
      {(product.status === 'verified' || product.status === 'active') && (
        <StatusAlert
          tone="verified"
          icon={CheckCircle2}
          title="Live on platform"
          message="This property is verified and visible to buyers. Changes may require re-approval."
          actionLabel="Edit property"
          onAction={goEdit}
        />
      )}

      {isEditing ? (
        <div className={vpPanel}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/40">
            <span className="text-sm font-semibold text-slate-900">Edit listing</span>
            <button type="button" onClick={() => setIsEditing(false)} className="text-sm font-semibold text-rose-600 hover:underline">
              Cancel
            </button>
          </div>
          <PropertyForm
            initialData={product}
            onCancel={() => setIsEditing(false)}
            onSubmit={() => {
              setIsEditing(false);
              fetchPropertyById(id);
            }}
          />
        </div>
      ) : (
        <>
          <div className={vpStatGrid}>
            <div className={vpStatCard}>
              <div className={vpStatIcon}>
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <p className={vpStatLabel}>Listing price</p>
                <p className={vpStatValue}>{formatPrice(product.financials?.totalPrice)}</p>
                <p className={vpStatSub}>{priceSub}</p>
              </div>
            </div>
            <div className={vpStatCard}>
              <div className={vpStatIcon}>
                <Eye size={18} />
              </div>
              <div>
                <p className={vpStatLabel}>Views</p>
                <p className={vpStatValue}>{formatCount(product.views)}</p>
              </div>
            </div>
            <div className={vpStatCard}>
              <div className={vpStatIcon}>
                <Share2 size={18} />
              </div>
              <div>
                <p className={vpStatLabel}>Shares</p>
                <p className={vpStatValue}>{formatCount(product.shareCount)}</p>
              </div>
            </div>
            <div className={vpStatCard}>
              <div className={vpStatIcon}>
                <Heart size={18} />
              </div>
              <div>
                <p className={vpStatLabel}>Saved</p>
                <p className={vpStatValue}>{formatCount(product.wishlistCount ?? product.likes)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 space-y-4">
              <SectionBlock icon={ImageIcon} title="Media gallery">
                <div className={vpPropMedia}>
                  {displayMedia.type === 'video' ? (
                    getYouTubeID(displayMedia.url) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeID(displayMedia.url)}`}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Property video"
                      />
                    ) : (
                      <video src={displayMedia.url} controls className="w-full h-full object-contain" />
                    )
                  ) : (
                    <img src={displayMedia.url} alt={product.projectName} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                    {propertyTypeName && (
                      <span className="px-2.5 py-1 rounded-sm bg-primary text-white text-xs font-semibold capitalize">
                        {propertyTypeName}
                      </span>
                    )}
                    {heroAreaLabel && (
                      <span className="px-2.5 py-1 rounded-sm bg-white/90 text-slate-800 text-xs font-semibold border border-slate-200">
                        {heroAreaLabel}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLightboxMedia(displayMedia)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-sm bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>

                {mediaThumbs.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {mediaThumbs.map((item, idx) => {
                      const active = displayMedia.url === item.url;
                      return (
                        <button
                          key={`${item.url}-${idx}`}
                          type="button"
                          onClick={() => setActiveMedia({ type: item.type, url: item.url })}
                          className={`${vpPropThumb} ${active ? vpPropThumbActive : vpPropThumbInactive}`}
                        >
                          <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                          {item.type === 'video' && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play size={14} className="text-white" fill="white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {product.media?.brochure && (
                  <a
                    href={product.media.brochure}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-between gap-3 p-3 rounded-md border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-sm bg-white border border-slate-100 flex items-center justify-center text-primary shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className={vpDetailValue}>Project brochure</p>
                        <p className={vpDetailMuted}>PDF · opens in new tab</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary shrink-0">View</span>
                  </a>
                )}
              </SectionBlock>

              <SectionBlock icon={LayoutGrid} title="Specifications">
                <SpecTable rows={specRows} />
              </SectionBlock>

              {product.amenities?.length > 0 && (
                <SectionBlock icon={CheckCircle2} title="Amenities">
                  <div className="flex flex-wrap gap-2">
                    {product.amenities.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-sm text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 capitalize"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {(product.salesDept || product.loanDept) && (
                <SectionBlock icon={Users} title="Departments">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.salesDept && (
                      <div className={vpInfoBox}>
                        <p className={`${vpDetailLabel} text-primary mb-2`}>Sales</p>
                        <p className={vpDetailValue}>{product.salesDept.fullName}</p>
                        <p className={vpDetailMuted}>{product.salesDept.contactNumber}</p>
                        <p className={vpDetailMuted}>{product.salesDept.email}</p>
                      </div>
                    )}
                    {product.loanDept && (
                      <div className={vpInfoBox}>
                        <p className={`${vpDetailLabel} mb-2`}>Loan</p>
                        <p className={vpDetailValue}>{product.loanDept.fullName}</p>
                        <p className={vpDetailMuted}>{product.loanDept.contactNumber}</p>
                      </div>
                    )}
                  </div>
                </SectionBlock>
              )}
            </div>

            <div className="xl:col-span-4 space-y-4">
              <SectionBlock icon={MapPin} title="Location">
                <div className="space-y-3">
                  <div>
                    <p className={vpDetailLabel}>Locality</p>
                    <p className={vpDetailValue}>{product.address?.addressLine2 || '—'}</p>
                  </div>
                  <div>
                    <p className={vpDetailLabel}>Full address</p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed mt-1">
                      {product.address?.addressLine1 || '—'}
                    </p>
                  </div>
                </div>
              </SectionBlock>

              <SectionBlock title="Financial details">
                <div className="space-y-3">
                  <div>
                    <p className={vpDetailLabel}>Total price</p>
                    <p className="text-xl font-bold text-slate-900 tabular-nums">
                      {formatPrice(product.financials?.totalPrice)}
                    </p>
                    <p className={vpDetailMuted}>{priceSub}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'GST', value: product.financials?.gstStatus },
                      { label: 'Stamp duty', value: product.financials?.stampDuty },
                      { label: 'Agent fee', value: product.financials?.agentFee },
                    ]
                      .filter((f) => f.value && f.value !== 'N/A' && f.value !== 'Not Applicable')
                      .map((f) => (
                        <div key={f.label} className="flex justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                          <span className={vpDetailMuted}>{f.label}</span>
                          <span className={vpDetailValue}>{f.value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </SectionBlock>

              {developmentShare && (
                <SectionBlock title="Development share">
                  <div className="grid grid-cols-2 gap-2">
                    <div className={vpInfoBox + ' text-center'}>
                      <p className={vpDetailLabel}>Builder</p>
                      <p className={vpStatValue}>{formatDevelopmentRatio(developmentShare.builder) ?? '—'}</p>
                    </div>
                    <div className={vpInfoBox + ' text-center'}>
                      <p className={vpDetailLabel}>Owner</p>
                      <p className={vpStatValue}>{formatDevelopmentRatio(developmentShare.owner) ?? '—'}</p>
                    </div>
                  </div>
                  <p className={`${vpDetailMuted} text-center mt-2`}>Total {developmentShare.total}%</p>
                </SectionBlock>
              )}

              <SectionBlock icon={Shield} title="Legal & verification">
                <div className="space-y-4">
                  <div className={vpInfoBox}>
                    <p className={`${vpDetailLabel} mb-2`}>Legal adviser</p>
                    <p className={vpDetailValue}>
                      {product.propertyDocument?.legalAdvisor?.fullName || 'Not provided'}
                    </p>
                    <p className={vpDetailMuted}>
                      {product.propertyDocument?.legalAdvisor?.contactNumber || '—'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className={vpDetailMuted}>Enrollment</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {product.propertyDocument?.legalAdvisor?.rollNumber || '—'}
                        </p>
                      </div>
                      <div>
                        <p className={vpDetailMuted}>Bar council</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {product.propertyDocument?.legalAdvisor?.memberOf || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {legalDocs.length > 0 && (
                    <div>
                      <div className={upSection + ' mb-3'}>
                        <div className={upSectionAccent} />
                        <span className={upSectionTitle}>Documents</span>
                        <div className={upSectionLine} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {legalDocs.map((doc) => {
                          const isPdf = typeof doc.doc === 'string' && doc.doc.toLowerCase().includes('.pdf');
                          return (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() =>
                                doc.doc
                                  ? isPdf
                                    ? window.open(doc.doc, '_blank')
                                    : setLightboxMedia({ type: 'image', url: doc.doc })
                                  : undefined
                              }
                              className="rounded-md border border-slate-100 overflow-hidden text-left hover:border-primary/30 transition-colors"
                            >
                              <div className="h-14 bg-slate-50 flex items-center justify-center">
                                {doc.doc && !isPdf ? (
                                  <img src={doc.doc} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText size={18} className="text-slate-400" />
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-[11px] font-semibold text-slate-700 truncate">{doc.label}</p>
                                {doc.number && <p className="text-[10px] text-slate-400 truncate">#{doc.number}</p>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </SectionBlock>

              <SectionBlock icon={Activity} title="Activity">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Check size={12} />
                    </div>
                    <div>
                      <p className={vpDetailValue}>Status: {product.status}</p>
                      <p className={vpDetailMuted}>Last updated recently</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                      <ImageIcon size={12} />
                    </div>
                    <div>
                      <p className={vpDetailValue}>{product.media?.photos?.length || 0} media files</p>
                      <p className={vpDetailMuted}>Gallery attached to listing</p>
                    </div>
                  </div>
                </div>
              </SectionBlock>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={!!lightboxMedia}
        onClose={() => setLightboxMedia(null)}
        title={lightboxMedia?.type === 'video' ? 'Property video' : 'Property image'}
        size="xl"
      >
        <div className="bg-slate-950 rounded-md overflow-hidden flex items-center justify-center min-h-[320px]">
          {lightboxMedia?.type === 'video' ? (
            getYouTubeID(lightboxMedia.url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeID(lightboxMedia.url)}?autoplay=1`}
                className="w-full aspect-video border-0"
                allowFullScreen
                title="Video preview"
              />
            ) : (
              <video src={lightboxMedia.url} controls autoPlay className="max-h-[75vh] w-full object-contain" />
            )
          ) : (
            <img src={lightboxMedia?.url} alt="Preview" className="max-h-[75vh] w-full object-contain" />
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        title={statusConfirm?.type === 'Verified' ? 'Confirm verification' : 'Reject listing'}
        size="md"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            {statusConfirm?.type === 'Verified'
              ? 'This listing will be marked verified and published to all users.'
              : 'Provide a clear reason for rejecting this listing.'}
          </p>
          {statusConfirm?.type === 'Rejected' && (
            <textarea
              value={statusConfirm.reason || ''}
              onChange={(e) => setStatusConfirm({ ...statusConfirm, reason: e.target.value })}
              placeholder="Reason for rejection..."
              className={`${upInput} min-h-[96px] resize-y`}
            />
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setStatusConfirm(null)} className={upBtnSecondary}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                updatePropertyStatus({
                  id: product._id,
                  status: statusConfirm.type,
                  rejectionReason: statusConfirm.reason,
                });
                setStatusConfirm(null);
              }}
              disabled={statusConfirm?.type === 'Rejected' && !statusConfirm.reason?.trim()}
              className={upBtnPrimary}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
