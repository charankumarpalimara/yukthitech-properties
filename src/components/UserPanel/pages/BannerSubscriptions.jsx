import {
  useBannerOrdersStore,
  fetchAvailablePlans,
  fetchMyOrders,
  createBannerOrder,
  processPayment,
  updateBannerOrder,
  checkSlotAvailability,
  clearError,
  clearSuccessMessage,
  clearCurrentOrder,
} from '../../../store/bannerOrdersStore';
import { useVendorProductsStore, fetchProducts } from '../../../store/vendorProductsStore';
import { useState, useEffect, useRef, useCallback } from 'react';
import BannerWeekPicker, {
  formatBannerSlotRange,
  findWeekInList,
  WeekRangePreview,
} from '../../vendor/components/BannerWeekPicker';
import {
  Check,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  CreditCard,
  ArrowRight,
  Calendar as CalendarIcon,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, PAYMENT_CANCELLED } from '../../../utils/getErrorMessage';
import { PROMO_BANNER_SIZES } from '../../../components/HomeScreen/PromoBannerSlider/bannerSizes';
import {
  PF_LABEL,
  PF_LABEL_BLOCK,
  PF_INPUT,
  PF_SELECT,
  PF_PICKER_TRIGGER,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_GHOST,
} from '../../vendor/components/ui/property-form/formFieldClasses';

const FORM_SECTION_TITLE = 'text-md font-semibold text-slate-900';
const FORM_SECTION_DESC = 'text-md font-medium text-slate-500 mt-1';
const BANNER_WEB_HINT = `${PROMO_BANNER_SIZES.web.label} px`;
const BANNER_MOBILE_HINT = `${PROMO_BANNER_SIZES.mobile.label} px`;
const BANNER_SIZE_SUMMARY = `Desktop ${PROMO_BANNER_SIZES.web.label} · Mobile ${PROMO_BANNER_SIZES.mobile.label}`;
const BANNER_FILE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg';

/** Same demo creatives as home page promo slider — separate web + mobile files */
const BANNER_EXAMPLE_TEMPLATES = [
  {
    variant: 'web',
    src: '/banners/vendor-promo-featured-listing.svg',
    downloadName: `banner-template-desktop-${PROMO_BANNER_SIZES.web.width}x${PROMO_BANNER_SIZES.web.height}.svg`,
    label: 'Desktop',
    sizeLabel: PROMO_BANNER_SIZES.web.label,
  },
  {
    variant: 'mobile',
    src: '/banners/vendor-promo-featured-listing-mobile.svg',
    downloadName: `banner-template-mobile-${PROMO_BANNER_SIZES.mobile.width}x${PROMO_BANNER_SIZES.mobile.height}.svg`,
    label: 'Mobile',
    sizeLabel: PROMO_BANNER_SIZES.mobile.label,
  },
];

/** Shared preview frame so desktop & mobile upload/example cards match in height */
const BANNER_PREVIEW_FRAME_CLASS = 'h-[148px] sm:h-[160px]';

const checkBannerImageDimensions = (file, variant) =>
  new Promise((resolve, reject) => {
    const expected = variant === 'web' ? PROMO_BANNER_SIZES.web : PROMO_BANNER_SIZES.mobile;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width === expected.width && img.height === expected.height) {
        resolve(true);
      } else {
        reject(
          new Error(
            `${variant === 'web' ? 'Desktop' : 'Mobile'} image is ${img.width}×${img.height}px. Required ${expected.label}px.`
          )
        );
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = url;
  });

function BannerCreativeExamples() {
  const handleDownloadTemplate = async (src, downloadName) => {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download template. Try again.');
    }
  };

  return (
    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm font-semibold text-slate-900">Example banners (shown on home page)</p>
      <p className="text-xs font-medium text-slate-500 mt-1">
        Upload two separate creatives — desktop and mobile — at exactly {BANNER_SIZE_SUMMARY}.
      </p>
      <div className="grid gap-4 mt-3 sm:grid-cols-2 items-stretch">
        {BANNER_EXAMPLE_TEMPLATES.map((t) => (
          <div key={t.variant} className="min-w-0 flex flex-col h-full">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              {t.label} · {t.sizeLabel} px
            </p>
            <div className="w-full flex flex-col flex-1 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div
                className={`w-full ${BANNER_PREVIEW_FRAME_CLASS} flex items-center justify-center bg-[#f8fafc] p-3`}
              >
                <img
                  src={t.src}
                  alt={`${t.label} banner example`}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDownloadTemplate(t.src, t.downloadName)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-t border-slate-200 hover:bg-primary/10 hover:text-primary transition-colors mt-auto"
              >
                <Download size={14} />
                Download {t.label.toLowerCase()} template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerImageUpload({
  label,
  hint,
  preview,
  inputRef,
  onFileChange,
  onRemove,
  uploadTitle,
  replaceTitle,
}) {
  const openPicker = () => inputRef.current?.click();

  return (
    <div className="min-w-0 flex flex-col h-full">
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1.5">
        <label className={PF_LABEL}>{label}</label>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {hint}
        </span>
      </div>
      <div className="w-full flex-1 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm group">
        <div
          className={`relative w-full ${BANNER_PREVIEW_FRAME_CLASS} flex items-center justify-center bg-[#f8fafc] p-3`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt=""
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[1px]">
                <Upload size={20} className="mb-1" />
                <span className="text-sm font-semibold">{replaceTitle}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-2 right-2 p-1.5 bg-white text-rose-500 rounded-full hover:bg-rose-500 hover:text-white shadow-lg z-10 transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                className="absolute inset-0 z-[1] cursor-pointer"
                aria-label={replaceTitle}
                onClick={openPicker}
              />
            </>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              className="w-full h-full min-h-[120px] border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-primary/50 transition-all group/box focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 px-3"
            >
              <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/box:text-primary transition-colors mb-2">
                <ImageIcon size={20} />
              </span>
              <span className="text-sm font-semibold text-slate-600">{uploadTitle}</span>
              <span className="text-xs font-medium text-slate-400 mt-1 text-center">
                JPG, PNG, WebP, SVG · Max 5MB
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={BANNER_FILE_ACCEPT}
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

const statusColors = {
  pending_upload: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Upload Images' },
  pending_payment: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Payment Pending' },
  pending_verification: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    label: 'Pending Verification',
  },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Active' },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejected' },
  expired: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Expired' },
};

const priorityColors = {
  Highest: 'bg-amber-100 text-amber-700',
  High: 'bg-violet-100 text-violet-700',
  Medium: 'bg-blue-100 text-blue-700',
  Low: 'bg-slate-200 text-slate-600',
};

export default function BannerSubscriptions() {
  const availablePlans = useBannerOrdersStore((s) => s.availablePlans);
  const myOrders = useBannerOrdersStore((s) => s.myOrders);
  const slotAvailability = useBannerOrdersStore((s) => s.slotAvailability);
  const loading = useBannerOrdersStore((s) => s.loading);
  const weeksLoading = useBannerOrdersStore((s) => s.weeksLoading);
  const error = useBannerOrdersStore((s) => s.error);
  const successMessage = useBannerOrdersStore((s) => s.successMessage);
  const propertiesList = useVendorProductsStore((s) => s.list) ?? [];

  const [view, setView] = useState('plans'); // 'plans' | 'orders' | 'form'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedStartWeek, setSelectedStartWeek] = useState(null);
  /** Full week row + API dates — survives slot re-check that omits the weeks list */
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [bannerContent, setBannerContent] = useState({
    title: '',
    description: '',
    propertyId: '',
  });
  const [bannerWeb, setBannerWeb] = useState({ file: null, preview: null });
  const [bannerMobile, setBannerMobile] = useState({ file: null, preview: null });
  const [selectedDateSlots, setSelectedDateSlots] = useState(null);
  const [weekPickerOpen, setWeekPickerOpen] = useState(false);
  const [weeksError, setWeeksError] = useState(null);
  const [confirmingWeek, setConfirmingWeek] = useState(false);
  const fileInputWebRef = useRef(null);
  const fileInputMobileRef = useRef(null);

  useEffect(() => {
    fetchAvailablePlans();
    fetchMyOrders();
    fetchProducts({ status: 'verified', limit: 100 });
  }, []);

  const loadWeeks = useCallback(async () => {
    if (!selectedPlan) return;
    setWeeksError(null);
    try {
      await checkSlotAvailability({
        pageType: selectedPlan.pageType,
        position: selectedPlan.position,
        duration: selectedPlan.duration,
        planId: selectedPlan._id,
      });
    } catch (e) {
      setWeeksError(e.message || 'Failed to load available weeks');
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (selectedPlan && view === 'form' && !isEditMode) {
      loadWeeks();
    }
  }, [selectedPlan, view, isEditMode, loadWeeks]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
    if (successMessage) {
      toast.success(successMessage);
      clearSuccessMessage();
    }
  }, [error, successMessage]);

  // Select plan and navigate to form - remove redundant API call
  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setView('form');
  };

  const handleConfirmWeek = async (week) => {
    if (!week?.bookable || !selectedPlan) return;
    setConfirmingWeek(true);
    try {
      const payload = await checkSlotAvailability({
        pageType: selectedPlan.pageType,
        position: selectedPlan.position,
        duration: selectedPlan.duration,
        planId: selectedPlan._id,
        startDate: week.weekStart,
      });
      if (payload?.available) {
        const weekStart = payload.weekStart ?? week.weekStart;
        const weekEnd = payload.weekEnd ?? week.weekEnd;
        const weekStartKey = week.weekStartKey || weekStart;
        setSelectedWeek({
          ...week,
          weekStart,
          weekEnd,
          weekStartKey,
        });
        setSelectedStartWeek(weekStartKey);
        setSelectedDateSlots(result.payload.remainingSlots ?? week.remaining);
        setWeekPickerOpen(false);
        toast.success(
          `Week confirmed · ${result.payload.remainingSlots ?? week.remaining}/${week.capacity} banners available`
        );
      } else {
        toast.error(result.payload?.message || 'This week is no longer available');
        await loadWeeks();
      }
    } catch {
      toast.error('Could not confirm week availability');
    } finally {
      setConfirmingWeek(false);
    }
  };

  const shiftCalendarMonth = (delta) => {
    setCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  const handlePaymentResult = async (paymentPromise, { onSuccess } = {}) => {
    try {
      await paymentPromise;
      toast.success('Payment successful! Your banner order has been placed.');
      await fetchMyOrders();
      onSuccess?.();
      return true;
    } catch (err) {
      if (err !== PAYMENT_CANCELLED) {
        toast.error(getErrorMessage(err) || 'Payment failed');
      } else {
        toast('Payment cancelled. Complete payment anytime from My Orders.', { icon: 'ℹ️' });
      }
      await fetchMyOrders();
      return false;
    }
  };

  const handlePayNow = async (order) => {
    await handlePaymentResult(
      processPayment({
        orderId: order._id,
        startDate:
          order.bookedSlots?.[0]?.weekStart ||
          order.bookedSlots?.[0]?.startDate ||
          order.schedule?.startDate,
      })
    );
  };

  // Handle Edit Order
  const handleEditOrder = (order) => {
    setIsEditMode(true);
    setEditingOrderId(order._id);

    // setSelectedPlan(order.planDetails);

    setSelectedPlan({
      ...order.planDetails,
      _id: order.planDetails?._id || order.planId || order.planDetails?.id,
    });

    setBannerContent({
      title: order.bannerContent?.title || '',
      description: order.bannerContent?.description || '',
      propertyId: order.bannerContent?.propertyId || '',
    });

    const slotStart = order.bookedSlots?.[0]?.weekStart || order.bookedSlots?.[0]?.startDate;
    if (slotStart) {
      setSelectedStartWeek(new Date(slotStart).toISOString());
    }

    const webImg =
      order.bannerImages?.find((img) => img.variant === 'web') || order.bannerImages?.[0];
    const mobileImg =
      order.bannerImages?.find((img) => img.variant === 'mobile') || order.bannerImages?.[1];
    setBannerWeb({ file: null, preview: webImg?.url || null });
    setBannerMobile({ file: null, preview: mobileImg?.url || null });

    setView('form');
  };

  const validateBannerFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 5MB limit`);
      return false;
    }
    return true;
  };

  const handleBannerImageSelect = async (variant, e) => {
    const file = e.target.files?.[0];
    if (!file || !validateBannerFile(file)) return;

    try {
      await checkBannerImageDimensions(file, variant);
    } catch (err) {
      toast.error(err.message || 'Invalid banner dimensions');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const next = { file, preview: reader.result };
      if (variant === 'web') setBannerWeb(next);
      else setBannerMobile(next);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveBannerImage = (variant) => {
    if (variant === 'web') {
      setBannerWeb({ file: null, preview: null });
      if (fileInputWebRef.current) fileInputWebRef.current.value = '';
    } else {
      setBannerMobile({ file: null, preview: null });
      if (fileInputMobileRef.current) fileInputMobileRef.current.value = '';
    }
  };

  const hasWebBanner = Boolean(bannerWeb.file || bannerWeb.preview);
  const hasMobileBanner = Boolean(bannerMobile.file || bannerMobile.preview);
  const bannerImagesReady = hasWebBanner && hasMobileBanner;

  const handleSubmitOrder = async () => {
    if (!bannerContent.title.trim()) {
      toast.error('Please enter a banner title');
      return;
    }

    if (!bannerContent.propertyId) {
      toast.error('Please select a property');
      return;
    }

    if (!isEditMode && !selectedStartWeek) {
      toast.error('Please select a weekly slot');
      return;
    }

    if (!bannerImagesReady) {
      toast.error('Please upload both web (desktop) and mobile banner images');
      return;
    }

    try {
      // =========================
      // EDIT MODE
      // =========================
      console.log('isEditMode', isEditMode);
      if (isEditMode) {
        // UPDATE BANNER CONTENT AND IMAGES AT ONCE
        if (bannerWeb.file || bannerMobile.file) {
          if (!bannerWeb.file || !bannerMobile.file) {
            toast.error('When changing images, upload both web and mobile versions.');
            return;
          }
        }

        await updateBannerOrder({
          orderId: editingOrderId,
          bannerContent,
          webImage: bannerWeb.file || undefined,
          mobileImage: bannerMobile.file || undefined,
        });

        toast.success('Order updated successfully!');

        resetForm();

        setIsEditMode(false);
        setEditingOrderId(null);

        setView('orders');

        await fetchMyOrders();

        return;
      }

      // =========================
      // CREATE MODE
      // =========================
      if (!bannerWeb.file || !bannerMobile.file) {
        toast.error('Please select new image files for both web and mobile');
        return;
      }

      const slotCheck = await checkSlotAvailability({
        pageType: selectedPlan.pageType,
        position: selectedPlan.position,
        duration: selectedPlan.duration,
        planId: selectedPlan._id,
        startDate: selectedStartWeek,
      });
      if (!slotCheck?.available) {
        toast.error(slotCheck?.message || 'Selected week is no longer available');
        return;
      }

      const order = await createBannerOrder({
        planId: selectedPlan._id,
        bannerContent,
        startDate: selectedStartWeek,
        webImage: bannerWeb.file,
        mobileImage: bannerMobile.file,
      });

      const orderId = order._id;

      const paid = await handlePaymentResult(
        processPayment({
          orderId,
          startDate: selectedStartWeek,
        }),
        {
          onSuccess: () => {
            resetForm();
            setView('orders');
          },
        }
      );

      if (!paid) {
        setView('orders');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    }
  };

  // Reset form
  // const resetForm = () => {
  //   setSelectedPlan(null);
  //   setSelectedImages([]);
  //   setSelectedStartWeek(null);
  //   setSelectedDateSlots(null);
  //   setPreviewImages([]);
  //   setBannerContent({ title: '', description: '', linkUrl: '' });
  //   dispatch(clearCurrentOrder());
  // };

  const resetForm = () => {
    setSelectedPlan(null);
    setBannerWeb({ file: null, preview: null });
    setBannerMobile({ file: null, preview: null });
    setSelectedStartWeek(null);
    setSelectedWeek(null);
    setSelectedDateSlots(null);
    setWeekPickerOpen(false);
    setWeeksError(null);

    setBannerContent({
      title: '',
      description: '',
      propertyId: '',
    });

    setIsEditMode(false);
    setEditingOrderId(null);

    clearCurrentOrder();
  };

  // Render plans list
  const renderPlans = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div>
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-900 leading-none">
              Banner Advertising Plans
            </h2>
            <button
              onClick={() => setView('orders')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-200 transition-all border border-slate-200"
            >
              My Orders
              <span className="bg-white text-primary px-2 py-0.5 rounded text-xs font-bold shadow-sm border border-slate-100">
                {myOrders.length}
              </span>
            </button>
          </div>
          <p className="text-md text-slate-500 mt-1.5 font-medium">
            Choose a plan to showcase your properties
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {availablePlans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-primary/30 hover:shadow-md transition-all flex flex-col h-full"
          >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${priorityColors[plan.priority]}`}
                >
                  {plan.priority} Priority
                </span>
                {plan.isActive && (
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
            </div>

            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{plan.price?.toLocaleString()}
                </span>
                <span className="text-sm text-slate-400">/ {plan.duration}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ₹{plan.pricePerWeek?.toLocaleString()} per week
              </p>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Page Type</span>
                <span className="font-medium text-slate-900 capitalize">{plan.pageType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Position</span>
                <span className="font-medium text-slate-900">{plan.position}</span>
              </div>
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-slate-500 shrink-0">Banner Size</span>
                <span className="font-medium text-slate-900 text-right text-xs leading-snug">
                  {plan.bannerSize || BANNER_SIZE_SUMMARY}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100">
              <ul className="space-y-2">
                {(plan.features || []).slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6 mt-auto">
              <button
                onClick={() => {
                  setSelectedStartWeek(null);
                  setSelectedWeek(null);
                  setSelectedDateSlots(null);
                  handleSelectPlan(plan);
                }}
                className={`${BTN_PRIMARY} w-full rounded-lg py-2.5`}
              >
                Book Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Single form - all sections combined
  const renderForm = () => {
    const weeksNeeded = slotAvailability?.weeksNeeded || 1;
    const bookableWeeks = slotAvailability?.weeks || [];
    const maxUsersPerSlot = slotAvailability?.maxUsersPerSlot || selectedPlan?.userLimit || 5;

    const selectedWeekObj = selectedWeek || findWeekInList(bookableWeeks, selectedStartWeek);

    const formatSelectedRange = () => {
      if (!selectedWeekObj && !selectedStartWeek) return null;
      if (selectedWeekObj) {
        return formatBannerSlotRange(
          selectedWeekObj.weekStart,
          selectedWeekObj.weekEnd,
          weeksNeeded
        ).shortLabel;
      }
      return formatBannerSlotRange(selectedStartWeek, null, weeksNeeded).shortLabel;
    };

    const selectedRangeLabels = selectedWeekObj
      ? formatBannerSlotRange(selectedWeekObj.weekStart, selectedWeekObj.weekEnd, weeksNeeded)
      : selectedStartWeek
        ? formatBannerSlotRange(selectedStartWeek, null, weeksNeeded)
        : null;

    const editingOrder =
      isEditMode && editingOrderId ? myOrders.find((o) => o._id === editingOrderId) : null;
    const rejectionReason =
      editingOrder?.status === 'rejected'
        ? editingOrder?.verification?.rejectionReason?.trim()
        : '';

    return (
      <div className="max-w-5xl mx-auto w-full pb-8">
        <button
          type="button"
          onClick={() => {
            resetForm();
            setView('plans');
          }}
          className={`${BTN_GHOST} mb-5 -ml-1`}
        >
          <ArrowRight size={18} className="rotate-180 shrink-0" />
          Back to Plans
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEditMode ? 'Edit Banner Order' : 'Book Banner Slot'}
            </h2>
            <p className="text-md text-slate-300 mt-1.5 font-medium">
              {rejectionReason
                ? 'Fix the issues below and save to resubmit for admin review'
                : `Complete all required fields to ${isEditMode ? 'update' : 'submit'} your order`}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {rejectionReason && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4" role="alert">
                <p className="text-md font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  This order was rejected
                </p>
                <p className="text-md font-medium text-rose-700 mt-2 leading-relaxed whitespace-pre-wrap">
                  {rejectionReason}
                </p>
                {editingOrder?.verification?.verifiedAt && (
                  <p className="text-xs font-medium text-rose-600/90 mt-2">
                    Rejected on{' '}
                    {new Date(editingOrder.verification.verifiedAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
                <p className="text-md font-medium text-rose-800/90 mt-3">
                  Update your banner details below, then save to resubmit for review.
                </p>
              </div>
            )}

            {/* Section 1: Plan Info */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className={FORM_SECTION_TITLE}>Selected plan</p>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
                <div>
                  <span className={`${PF_LABEL} block mb-1`}>Plan</span>
                  <span className="text-md font-semibold text-slate-900">{selectedPlan?.name}</span>
                </div>
                <div>
                  <span className={`${PF_LABEL} block mb-1`}>Position</span>
                  <span className="text-md font-semibold text-slate-900">
                    {selectedPlan?.pageType} · {selectedPlan?.position}
                  </span>
                </div>
                <div>
                  <span className={`${PF_LABEL} block mb-1`}>Duration</span>
                  <span className="text-md font-semibold text-slate-900">
                    {selectedPlan?.duration}
                  </span>
                </div>
                <div>
                  <span className={`${PF_LABEL} block mb-1`}>Amount</span>
                  <span className="text-md font-bold text-primary">
                    ₹{selectedPlan?.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Banner Content */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className={FORM_SECTION_TITLE}>Banner content</p>
                <p className={FORM_SECTION_DESC}>Title and property shown on your banner</p>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className={PF_LABEL_BLOCK} htmlFor="banner-title">
                    Banner title *
                  </label>
                  <input
                    id="banner-title"
                    type="text"
                    value={bannerContent.title}
                    onChange={(e) => setBannerContent({ ...bannerContent, title: e.target.value })}
                    className={PF_INPUT}
                    placeholder="Enter banner title"
                  />
                </div>
                <div>
                  <label className={PF_LABEL_BLOCK} htmlFor="banner-property">
                    Select property *
                  </label>
                  {propertiesList && propertiesList.some((p) => p.status === 'verified') ? (
                    <select
                      id="banner-property"
                      onChange={(e) =>
                        setBannerContent({ ...bannerContent, propertyId: e.target.value })
                      }
                      className={PF_SELECT}
                      value={bannerContent.propertyId || ''}
                    >
                      <option value="" disabled>
                        Choose property
                      </option>
                      {propertiesList
                        .filter((prop) => prop.status === 'verified')
                        .map((prop) => (
                          <option key={prop._id} value={prop._id}>
                            {prop.projectName}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <p className="text-md font-medium text-rose-600 mt-2">
                      You don&apos;t have any verified properties to link.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Banner image & weekly slot */}
            <div className="rounded-xl border border-slate-200 overflow-visible">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className={FORM_SECTION_TITLE}>Banner image & schedule</p>
                <p className={FORM_SECTION_DESC}>
                  {isEditMode
                    ? `Update desktop (${PROMO_BANNER_SIZES.web.label}) and mobile (${PROMO_BANNER_SIZES.mobile.label}) creatives — both required`
                    : `Upload desktop + mobile banners (${BANNER_SIZE_SUMMARY}), then choose a weekly start date`}
                </p>
              </div>

              <div className="grid gap-6 p-5 md:grid-cols-2 items-stretch">
                <BannerCreativeExamples />

                <BannerImageUpload
                  label="Desktop banner *"
                  hint={BANNER_WEB_HINT}
                  preview={bannerWeb.preview}
                  inputRef={fileInputWebRef}
                  onFileChange={(e) => handleBannerImageSelect('web', e)}
                  onRemove={() => handleRemoveBannerImage('web')}
                  uploadTitle="Upload desktop banner"
                  replaceTitle="Replace desktop banner"
                />
                <BannerImageUpload
                  label="Mobile banner *"
                  hint={BANNER_MOBILE_HINT}
                  preview={bannerMobile.preview}
                  inputRef={fileInputMobileRef}
                  onFileChange={(e) => handleBannerImageSelect('mobile', e)}
                  onRemove={() => handleRemoveBannerImage('mobile')}
                  uploadTitle="Upload mobile banner"
                  replaceTitle="Replace mobile banner"
                />

                {!isEditMode && (
                  <div className="min-w-0 flex flex-col md:col-span-2">
                    <label className={`${PF_LABEL_BLOCK} flex items-center gap-2`}>
                      <CalendarIcon size={18} className="text-primary shrink-0" />
                      Weekly slot * ({weeksNeeded} {weeksNeeded === 1 ? 'week' : 'weeks'}, Mon–Sun)
                    </label>
                    <div className="flex flex-col gap-3 flex-1">
                      <p className="text-md text-slate-500">
                        Up to {maxUsersPerSlot} banners per week (1 per vendor) · current week not
                        bookable
                      </p>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !weekPickerOpen;
                            setWeekPickerOpen(next);
                            if (next && (!bookableWeeks.length || weeksError)) loadWeeks();
                          }}
                          disabled={weeksLoading}
                          aria-expanded={weekPickerOpen}
                          aria-haspopup="listbox"
                          className={`${PF_PICKER_TRIGGER} ${
                            weekPickerOpen ? 'is-open ring-2 ring-primary/20' : ''
                          }`}
                        >
                          <span
                            className={`min-w-0 flex-1 ${selectedStartWeek ? 'text-slate-900 font-medium' : 'text-slate-400'}`}
                          >
                            {!selectedStartWeek ? (
                              'Select weekly slot…'
                            ) : selectedRangeLabels?.crossesMonth ? (
                              <span className="flex items-center gap-1.5 flex-wrap text-sm">
                                <span className="font-semibold">
                                  {selectedRangeLabels.startLabel}
                                </span>
                                <ArrowRight size={14} className="text-primary shrink-0" />
                                <span className="font-semibold">
                                  {selectedRangeLabels.endLabel}
                                </span>
                              </span>
                            ) : (
                              formatSelectedRange()
                            )}
                          </span>
                          <CalendarIcon
                            size={18}
                            className={`text-primary shrink-0 transition-transform ${weekPickerOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <BannerWeekPicker
                          open={weekPickerOpen}
                          onClose={() => setWeekPickerOpen(false)}
                          onConfirm={handleConfirmWeek}
                          weeks={bookableWeeks}
                          weeksNeeded={weeksNeeded}
                          maxUsersPerSlot={maxUsersPerSlot}
                          loading={weeksLoading}
                          error={weeksError}
                          onRetry={loadWeeks}
                          calendarMonth={calendarMonth}
                          onMonthChange={shiftCalendarMonth}
                          selectedWeekStart={selectedStartWeek}
                          confirming={confirmingWeek}
                        />
                      </div>

                      {selectedStartWeek && !weekPickerOpen && (
                        <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                          <p className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5">
                            <Check size={16} className="shrink-0" />
                            Slot confirmed
                          </p>
                          {selectedWeekObj ? (
                            <WeekRangePreview
                              week={selectedWeekObj}
                              weeksNeeded={weeksNeeded}
                              compact
                            />
                          ) : (
                            <p className="text-lg font-semibold text-emerald-800">
                              {formatSelectedRange()}
                            </p>
                          )}
                          <p className="text-lg font-semibold text-emerald-700 tabular-nums">
                            Banner limit: {selectedDateSlots ?? '—'} / {maxUsersPerSlot} available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isEditMode && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/60">
                  <div>
                    <p className={`${PF_LABEL} mb-1`}>Total amount</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      ₹{selectedPlan?.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className={`${PF_LABEL} mb-1`}>Payment method</p>
                    <p className="text-md font-semibold text-slate-900">Online payment</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form footer */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-5 border-t border-slate-200 bg-slate-50/50">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setView('plans');
              }}
              className={`${BTN_SECONDARY} flex-1 sm:flex-none sm:min-w-[140px] py-2.5`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={
                loading ||
                !bannerContent.title.trim() ||
                !bannerContent.propertyId ||
                !bannerImagesReady ||
                (!isEditMode && !selectedStartWeek)
              }
              className={`${BTN_PRIMARY} flex-1 py-2.5 disabled:opacity-50`}
            >
              <CreditCard size={18} className="shrink-0" />
              {loading
                ? 'Processing...'
                : isEditMode
                  ? 'Update Order'
                  : `Pay ₹${selectedPlan?.price?.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render my orders
  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('plans')}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-200 transition-all border border-slate-200"
            title="Back to Plans"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 leading-none">My Banner Orders</h2>
            <p className="text-md text-slate-500 mt-1.5 font-medium">
              Track your banner advertising orders
            </p>
          </div>
        </div>
        <button onClick={() => setView('plans')} className={`${BTN_PRIMARY} rounded-lg py-2`}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No orders yet</h3>
          <p className="text-md text-slate-500 font-medium mt-1 mb-4">
            Start advertising by selecting a banner plan
          </p>
          <button onClick={() => setView('plans')} className={`${BTN_PRIMARY} rounded-lg py-2`}>
            Browse Plans
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {myOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{order.planDetails?.name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}
                    >
                      {statusColors[order.status]?.label || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {order.planDetails?.pageType} • {order.planDetails?.position}
                  </p>

                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <span className="text-slate-500">
                      Amount:{' '}
                      <span className="font-medium text-slate-900">
                        ₹{order.payment?.amount?.toLocaleString()}
                      </span>
                    </span>
                    <span className="text-slate-500">
                      Banners:{' '}
                      <span className="font-medium text-slate-900">
                        {order.bannerImages?.some((i) => i.variant === 'web') &&
                        order.bannerImages?.some((i) => i.variant === 'mobile')
                          ? 'Web + Mobile'
                          : `${order.bannerImages?.length || 0} image(s)`}
                      </span>
                    </span>
                    {order.bookedSlots?.length > 0 && (
                      <span className="text-slate-500">
                        Slots:{' '}
                        <span className="font-medium text-slate-900">
                          {order.bookedSlots.length} weeks
                        </span>
                      </span>
                    )}
                    {order.bookedSlots?.length > 0 && (
                      <span className="text-slate-500">
                        Live:{' '}
                        <span className="font-medium text-emerald-600">
                          {new Date(
                            order.bookedSlots[0].startDate || order.bookedSlots[0].weekStart
                          ).toLocaleDateString()}{' '}
                          -{' '}
                          {new Date(
                            order.bookedSlots[0].endDate || order.bookedSlots[0].weekEnd
                          ).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                    <span className="text-slate-500">
                      Ordered:{' '}
                      <span className="font-medium text-slate-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}
                  >
                    {statusColors[order.status]?.label || order.status}
                  </span>
                  {order.bannerImages?.length > 0 && (
                    <div className="flex -space-x-2">
                      {order.bannerImages.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt=""
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                      {order.bannerImages.length > 3 && (
                        <span className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-600">
                          +{order.bannerImages.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {order.status === 'pending_payment' && (
                    <div className="mt-4">
                      <button
                        onClick={() => handlePayNow(order)}
                        className={`${BTN_PRIMARY} rounded-lg py-2`}
                      >
                        <CreditCard size={18} />
                        Pay Now
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleEditOrder(order)}
                    className={`${BTN_SECONDARY} rounded-lg py-2 border-primary text-primary hover:bg-primary hover:text-white`}
                  >
                    Edit
                  </button>
                </div>
              </div>

              {order.status === 'rejected' && order.verification?.rejectionReason && (
                <div
                  className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3"
                  role="alert"
                >
                  <p className="text-md font-semibold text-rose-800 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    Rejection reason
                  </p>
                  <p className="text-md font-medium text-rose-700 mt-1.5 leading-relaxed whitespace-pre-wrap">
                    {order.verification.rejectionReason}
                  </p>
                  {order.verification.verifiedAt && (
                    <p className="text-xs font-medium text-rose-600/90 mt-2">
                      Rejected on{' '}
                      {new Date(order.verification.verifiedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="vendor-banner-subscriptions  mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-md font-medium text-slate-700">Processing...</span>
          </div>
        </div>
      )}

      {view === 'plans' && renderPlans()}
      {view === 'orders' && renderOrders()}
      {view === 'form' && renderForm()}
    </div>
  );
}
