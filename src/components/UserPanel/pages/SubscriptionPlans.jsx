import {
  useVendorSubscriptionsStore,
  setBillingCycle,
  fetchPlans,
  fetchFeatures,
  fetchSubscriptionHistory,
  purchaseSubscription,
} from '../../../store/vendorSubscriptionsStore';
import { getMe } from '../../../store/authStore';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isVendorRegistered } from '../../../utils/isVendorRegistered';
import { formatPurchaseToastError } from '../../../utils/getErrorMessage';
import VendorRegistrationModal from '../../../components/vendor/VendorRegistrationModal';
import toast from 'react-hot-toast';
import {
  Check,
  X,
  Star,
  History,
  ShoppingBag,
  Zap,
  Calendar,
  Clock,
  Building2,
  ArrowRight,
} from 'lucide-react';
import Modal from '../../vendor/components/ui/Modal';
import DataTable from '../../vendor/components/ui/DataTable';
import Pagination from '../../vendor/components/ui/Pagination';
import ISTDate from '../../vendor/components/ui/ISTDate';
import Skeleton from '../../vendor/components/ui/Skeleton';
import {
  PF_LABEL_BLOCK,
  BTN_PRIMARY,
  BTN_GHOST,
  BTN_DARK,
} from '../../vendor/components/ui/property-form/formFieldClasses';

const planColors = {
  Basic: { badge: 'slate', ring: 'ring-slate-200', activeBg: 'bg-slate-700', light: 'bg-slate-50' },
  Standard: {
    badge: 'amber',
    ring: 'ring-primary/30',
    activeBg: 'bg-primary',
    light: 'bg-amber-50',
  },
  Premium: {
    badge: 'blue',
    ring: 'ring-dark-500/30',
    activeBg: 'bg-dark-500',
    light: 'bg-slate-800',
  },
};

const PlanCard = ({ plan, billingCycle, onBuy, isTopUp, isActive, isUpgrade, isDowngrade }) => {
  const isPremium = plan.name.includes('Premium');
  const isStandard = plan.name.includes('Standard');
  const isPopular = plan.popular || plan.highlightTag;

  const price = isTopUp || billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const propertyLimit =
    isTopUp || billingCycle === 'monthly'
      ? plan.monthlyPropertyLimit || plan.propertyLimit
      : plan.annualPropertyLimit || plan.propertyLimit;

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-6 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isPremium
        ? 'bg-gradient-to-br from-[#011f16] to-[#0a1122] border-gold/40 text-white shadow-lg'
        : isStandard
          ? 'bg-white border-primary/20 hover:border-gold/50 shadow-sm'
          : 'bg-white border-slate-200/80 shadow-sm'
        }`}
    >
      {/* Top Tag — corner ribbon badge */}
      {isPopular && (
        <div className={`absolute top-0 right-0 flex items-center gap-1 px-3 py-1.5 rounded-bl-xl rounded-tr-2xl text-[10.5px] font-bold uppercase tracking-widest shadow-sm ${isPremium
            ? 'bg-gradient-to-r from-[#c5a880] to-[#b4966c] text-[#011f16]'
            : 'bg-gradient-to-r from-[#023526] to-[#034d3a] text-white'
          }`}>
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674Z" />
          </svg>
          {plan.highlightTag || 'Most Popular'}
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`text-xl font-bold tracking-tight ${isPremium ? 'text-gold' : 'text-slate-900'}`}>
              {plan.name}
            </h3>
            <p className={`text-xs font-semibold mt-1 ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>
              {isTopUp ? 'Add-on Pack' : 'Seller Tier'}
            </p>
          </div>
          {isPremium && (
            <span className="text-gold p-1 bg-gold/10 rounded-lg">
              <Star size={18} fill="currentColor" />
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1 mt-4">
          <span className={`text-xl font-bold ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>₹</span>
          <span className={`text-4xl font-extrabold tracking-tight tabular-nums leading-none ${isPremium ? 'text-white' : 'text-slate-900'}`}>
            {price.toLocaleString('en-IN')}
          </span>
          <span className={`text-xs font-medium ml-1 ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
            / {isTopUp ? 'one-time' : billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>

        {!isTopUp && billingCycle === 'annual' && (
          <div className={`inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-[11px] font-bold border ${isPremium
            ? 'bg-gold/10 text-gold border-gold/20'
            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
            <Check size={10} strokeWidth={4} />
            <span>Save ₹{(plan.monthlyPrice * 12 - plan.annualPrice).toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={`h-px w-full my-4 ${isPremium ? 'bg-white/10' : 'bg-slate-100'}`} />

      {/* Features list */}
      <div className="flex-1 space-y-3.5 mb-6">
        <div className={`text-[10px] font-bold uppercase tracking-wider ${isPremium ? 'text-gold-300/60' : 'text-slate-400'}`}>
          Included Features
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-gold/20 text-gold' : 'bg-emerald-50 text-emerald-600'}`}>
            <Check size={12} strokeWidth={3} />
          </div>
          <span className={`text-sm font-semibold ${isPremium ? 'text-slate-200' : 'text-slate-600'}`}>
            List Up To {propertyLimit} Properties
          </span>
        </div>

        {(plan.features || []).map((f, i) => {
          const isInc = typeof f === 'object' ? f.isIncluded : true;
          const name = typeof f === 'object' ? f.name : f;
          if (isTopUp && !isInc) return null;

          return isInc ? (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-gold/20 text-gold' : 'bg-emerald-50 text-emerald-600'}`}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span className={`text-sm font-semibold ${isPremium ? 'text-slate-200' : 'text-slate-600'}`}>{name}</span>
            </div>
          ) : (
            <div key={i} className="flex items-center gap-2.5 opacity-40">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-white/10 text-white/40' : 'bg-slate-50 text-slate-400'}`}>
                <X size={12} strokeWidth={3} />
              </div>
              <span className={`text-sm font-semibold  ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>{name}</span>
            </div>
          );
        })}
      </div>

      {/* Button */}
      <button
        onClick={() => onBuy(plan)}
        disabled={plan.status === 'inactive' || isActive}
        className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${plan.status === 'inactive' || isActive
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
          : isPremium
            ? 'bg-gold text-[#011f16] hover:bg-gold-400 shadow-md shadow-gold/10 hover:shadow-lg'
            : 'bg-primary text-white hover:bg-primary-700 shadow-md shadow-primary/10 hover:shadow-lg'
          }`}
      >
        {isActive ? <Check size={14} strokeWidth={3} /> : <ShoppingBag size={14} />}
        <span>
          {isTopUp
            ? 'Add to Account'
            : isActive
              ? 'Active Plan'
              : isUpgrade
                ? 'Upgrade Plan'
                : 'Downgrade Plan'}
        </span>
      </button>
    </div>
  );
};

export default function SubscriptionPlans() {
  const [searchParams] = useSearchParams();
  const [vendorRegistrationForm, setVendorRegistrationForm] = useState(
    () => searchParams.get('completeProfile') === '1'
  );
  const allPlans = useVendorSubscriptionsStore((s) => s.plans) ?? [];
  const features = useVendorSubscriptionsStore((s) => s.features) ?? [];
  const historyState = useVendorSubscriptionsStore((s) => s.history) ?? {
    data: [],
    pagination: {},
    metadata: {},
    activePlanDetails: {},
  };
  const loading = useVendorSubscriptionsStore((s) => s.loading);
  const billingCycle = useVendorSubscriptionsStore((s) => s.billingCycle);

  const history = historyState.data || [];
  const activePlanDetails = historyState.activePlanDetails || {};
  const isExpired = activePlanDetails && new Date(activePlanDetails.endDate) < new Date();
  const daysLeft = activePlanDetails
    ? Math.ceil((new Date(activePlanDetails.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;
  const activePlanPrice = activePlanDetails?.plan?.price || 0;

  const [showUpgradeWarning, setShowUpgradeWarning] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);

  const safePlans = Array.isArray(allPlans) ? allPlans : [];

  const [activeTab, setActiveTab] = useState('agent');
  const [planModal, setPlanModal] = useState(false);
  const [featureModal, setFeatureModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [editPlan, setEditPlan] = useState(null);
  const [planType, setPlanType] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    monthlyPrice: 0,
    annualPrice: 0,
    propertyLimit: 0,
    highlightTag: '',
  });
  const [featureDropdownOpen, setFeatureDropdownOpen] = useState(false);
  const featureDropdownRef = useRef(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPlans();
    // dispatch(fetchFeatures());
  }, []);

  useEffect(() => {
    if (searchParams.get('completeProfile') === '1') {
      setVendorRegistrationForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSubscriptionHistory({ page, limit: 10 });
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featureDropdownRef.current && !featureDropdownRef.current.contains(event.target)) {
        setFeatureDropdownOpen(false);
      }
    };
    if (featureDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [featureDropdownOpen]);

  const plans = safePlans.filter((p) => p.role === activeTab || !p.role);
  const regularPlans = plans.filter(
    (p) => p.planType === 'regular' || p.type === 'regular' || (!p.planType && p.type !== 'topup')
  );

  // Show only plans available for the current billing cycle
  const visibleRegularPlans = regularPlans
    .filter((plan) => {
      if (billingCycle === 'annual') {
        return (
          (plan.annualPropertyLimit > 0 || plan.propertyLimit > 0) &&
          plan.annualPrice !== null &&
          plan.annualPrice !== 0
        );
      }
      return (
        (plan.monthlyPropertyLimit > 0 || plan.propertyLimit > 0) &&
        plan.monthlyPrice !== null &&
        plan.monthlyPrice !== 0
      );
    })
    .sort((a, b) => {
      const priceA = billingCycle === 'monthly' ? a.monthlyPrice : a.annualPrice;
      const priceB = billingCycle === 'monthly' ? b.monthlyPrice : b.annualPrice;
      return priceA - priceB;
    });

  const topUpPlans = plans.filter((p) => p.planType === 'topup' || p.type === 'topup');

  const historyStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'data-table__status--verified';
    if (s === 'expired') return 'data-table__status--rejected';
    return 'data-table__status--pending';
  };

  const historyColumns = [
    {
      header: 'Plan',
      cell: (row) => <span>{row.plan?.name || 'Unknown'}</span>,
    },
    {
      header: 'Amount',
      cell: (row) => (
        <span className="tabular-nums font-semibold text-slate-800">
          ₹{row.plan?.price?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Transaction ID',
      cell: (row) => (
        <span className="tabular-nums text-slate-500">{row.transaction?.transactionId || '—'}</span>
      ),
    },
    {
      header: 'Plan type',
      cell: (row) => <span className="capitalize">{row.plan?.durationType || '—'}</span>,
    },
    {
      header: 'Property limit',
      cell: (row) => <span className="tabular-nums">{row.plan?.propertyLimit ?? '—'}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`capitalize ${historyStatusClass(row.status)}`}>{row.status}</span>
      ),
    },
    {
      header: 'Duration',
      cell: (row) => (
        <span className="tabular-nums">
          {row.startDate && row.endDate ? (
            <>
              <ISTDate dateString={row.startDate} /> – <ISTDate dateString={row.endDate} />
            </>
          ) : (
            'N/A'
          )}
        </span>
      ),
    },
    {
      header: 'Payment',
      cell: (row) => <span className="capitalize">{row.transaction?.paymentMethod || '—'}</span>,
    },
  ];

  const planTypeOptions = [
    { value: '', label: 'Select Plan Type' },
    { value: 'regular', label: 'Regular' },
    { value: 'topup', label: 'Top-up' },
  ];

  const handlePurchase = (plan, isConfirmed = false) => {
    console.log('HandlePurchase called for:', plan.name, { isConfirmed });

    // Robust detection of plan type
    const isTopUp =
      plan.planType?.toLowerCase() === 'topup' ||
      plan.type?.toLowerCase() === 'topup' ||
      plan.durationType?.toLowerCase() === 'top-up' ||
      plan.isTopUp === true;

    const price = isTopUp || billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

    const activePlanName = activePlanDetails?.plan?.name?.trim()?.toLowerCase();
    const currentPlanName = plan.name?.trim()?.toLowerCase();

    console.log('Comparison:', {
      currentPlanName,
      activePlanName,
      isTopUp,
      activeSubExists: !!activePlanDetails,
    });

    // Show warning if switching from an active regular plan to a DIFFERENT regular plan
    if (!isConfirmed && activePlanDetails && !isTopUp && currentPlanName !== activePlanName) {
      console.log('Triggering Upgrade Modal');
      setPendingPlan(plan);
      setShowUpgradeWarning(true);
      return;
    }

    console.log('Proceeding with Purchase Logic');
    const startDate = new Date();
    const endDate = new Date();

    if (plan.planType === 'topup') {
      endDate.setDate(startDate.getDate() + (plan.duration || 30));
    } else if (billingCycle === 'monthly') {
      endDate.setMonth(startDate.getMonth() + 1);
    } else {
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    const purchaseData = {
      planId: plan._id || plan.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationType: plan.planType === 'topup' ? 'top-up' : billingCycle,
      price: price,
      paymentStatus: 'success',
      paymentMethod: 'Credit Card', // Simulated
    };

    toast.promise(
      purchaseSubscription(purchaseData).then(() => {
        fetchSubscriptionHistory({ page, limit: 10 });
        fetchPlans();
        return getMe()
          .then((updatedUser) => {
            if (!isVendorRegistered(updatedUser)) {
              setVendorRegistrationForm(true);
            }
          })
          .catch(() => {
            setVendorRegistrationForm(true);
          });
      }),
      {
        loading: `Purchasing ${plan.name}...`,
        success: 'Subscription activated successfully!',
        error: (err) => formatPurchaseToastError(err),
      }
    );
    setShowUpgradeWarning(false);
    setPendingPlan(null);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 leading-none">Subscription Plans</h2>
          <p className="text-md text-slate-500 mt-1.5 font-medium">
            Manage service levels, pricing, and revenue streams
          </p>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
          {['monthly', 'annual'].map((c) => (
            <button
              key={c}
              onClick={() => setBillingCycle(c)}
              className={`px-5 py-1.5 rounded-md text-md font-semibold capitalize transition-all ${billingCycle === c ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {c}
              {c === 'annual' && <span className="ml-1.5 text-emerald-600 font-bold">-17%</span>}
            </button>
          ))}
        </div>
      </div>
      {/* Active Membership Overview - Simplified Premium */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-40 h-6" />
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-3" />
                  <Skeleton className="w-20 h-4 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex-[2] w-full bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-center gap-6">
              <Skeleton className="w-32 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-full h-2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-10 rounded-lg" />
                <Skeleton className="w-20 h-10 rounded-lg" />
              </div>
            </div>
            <Skeleton className="w-32 h-10 rounded-lg" />
          </div>
        </div>
      ) : (
        activePlanDetails && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left: Identity */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                    <Zap size={28} fill="currentColor" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-md font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-500'}`}
                      >
                        {isExpired ? 'Membership expired' : 'Active membership'}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {activePlanDetails.plan?.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={12} />
                        <span className="text-md font-medium">
                          Expires: <ISTDate dateString={activePlanDetails.endDate} />
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={12} className={isExpired ? 'text-rose-500' : 'text-primary'} />
                        <span
                          className={`text-md font-semibold px-2 py-0.5 rounded-full ${isExpired ? 'text-rose-600 bg-rose-50' : 'text-primary bg-primary/10'}`}
                        >
                          {isExpired ? 'Expired' : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center: Capacity - Linear Horizontal Layout */}
                <div className="flex-[2] w-full bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-center gap-6">
                  <div className="flex items-center gap-4 border-r border-slate-200 pr-6 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                      <Building2 size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-md font-semibold text-slate-500 leading-none mb-1.5">
                        Capacity
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900 leading-none tabular-nums">
                          {historyState?.metadata?.usedProperties || 0}
                        </span>
                        <span className="text-md font-medium text-slate-500">
                          / {historyState?.metadata?.totalLimit || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Visual */}
                  <div className="max-w-[150px] flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-md font-semibold text-slate-700">
                        {Math.round(
                          ((historyState?.metadata?.usedProperties || 0) /
                            (historyState?.metadata?.totalLimit || 1)) *
                          100
                        )}
                        % Used
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full border border-slate-100 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isExpired ? 'bg-rose-500' : 'bg-slate-900'}`}
                        style={{
                          width: `${Math.min(100, ((historyState?.metadata?.usedProperties || 0) / (historyState?.metadata?.totalLimit || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Linear Breakdown Cards */}
                  <div className="flex items-center gap-2 pl-6 border-l border-slate-200 shrink-0">
                    <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-100 flex flex-col items-center shadow-sm min-w-[80px]">
                      <span className="text-md font-semibold text-slate-500 leading-none mb-1.5 truncate max-w-[90px]">
                        Main plan
                      </span>
                      <span className="text-lg font-bold text-slate-900 leading-none tabular-nums">
                        {historyState?.metadata?.mainLimit || 0}
                      </span>
                    </div>
                    <div className="bg-white px-3.5 py-2.5 rounded-lg border border-primary/10 flex flex-col items-center shadow-sm min-w-[80px]">
                      <span className="text-md font-semibold text-primary leading-none mb-1.5">
                        Extra
                      </span>
                      <span className="text-lg font-bold text-primary leading-none tabular-nums">
                        +{historyState?.metadata?.topupLimit || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Action */}
                <button
                  onClick={() => {
                    const historyEl = document.getElementById('sub-history');
                    historyEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`${BTN_DARK} shrink-0 rounded-lg py-2.5 flex items-center gap-2`}
                >
                  View History <ArrowRight size={14} />
                </button>
              </div>
            </div>
            {/* Subtle timeline */}
            <div className="h-1 w-full bg-slate-50">
              <div
                className={`h-full transition-all duration-1000 ${isExpired ? 'bg-rose-500' : 'bg-primary/20'}`}
                style={{
                  width: `${Math.max(0, Math.min(100, (1 - (new Date(activePlanDetails.endDate) - new Date()) / (new Date(activePlanDetails.endDate) - new Date(activePlanDetails.startDate))) * 100))}%`,
                }}
              />
            </div>
          </div>
        )
      )}

      {/* Regular Plans Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 py-2">
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-md shadow-sm">
            <p className={`${PF_LABEL_BLOCK} mb-0 text-primary whitespace-nowrap`}>
              Subscription tiers
            </p>
          </div>
          <div className="h-[2px] w-full bg-gradient-to-r from-primary/30 to-transparent rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-6">
          {loading
            ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[15px] p-6 border border-slate-200 shadow-sm space-y-6"
                >
                  <div className="space-y-3">
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                  <Skeleton className="w-full h-12 rounded-lg" />
                  <div className="space-y-3">
                    {Array(4)
                      .fill(0)
                      .map((_, j) => (
                        <div key={j} className="flex gap-3">
                          <Skeleton className="w-4 h-4 rounded-md shrink-0" />
                          <Skeleton className="w-full h-3" />
                        </div>
                      ))}
                  </div>
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
              ))
            : visibleRegularPlans.map((plan) => {
              const isActive =
                activePlanDetails?.plan?.name?.trim() === plan.name?.trim() &&
                activePlanDetails?.plan?.durationType === billingCycle;
              const planPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const isUpgrade = activePlanDetails ? planPrice > activePlanPrice : true;
              const isDowngrade = activePlanDetails ? planPrice < activePlanPrice : false;

              return (
                <PlanCard
                  key={plan._id || plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  onBuy={handlePurchase}
                  isActive={isActive}
                  isUpgrade={isUpgrade}
                  isDowngrade={isDowngrade}
                />
              );
            })}
        </div>
      </div>

      {/* Top Up Plans Section */}
      {/* <div className="space-y-4">
        <div className="flex items-center gap-4 py-2">
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-md shadow-sm">
            <p className={`${PF_LABEL_BLOCK} mb-0 text-primary whitespace-nowrap`}>
              Add-on packages
            </p>
          </div>
          <div className="h-[2px] w-full bg-gradient-to-r from-primary/30 to-transparent rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {loading
            ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[15px] p-6 border border-slate-200 shadow-sm space-y-6"
                >
                  <div className="space-y-3">
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                  <Skeleton className="w-full h-12 rounded-lg" />
                  <div className="space-y-3">
                    {Array(3)
                      .fill(0)
                      .map((_, j) => (
                        <div key={j} className="flex gap-3">
                          <Skeleton className="w-4 h-4 rounded-md shrink-0" />
                          <Skeleton className="w-full h-3" />
                        </div>
                      ))}
                  </div>
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
              ))
            : topUpPlans.map((plan) => (
              <PlanCard
                key={plan._id || plan.id}
                plan={plan}
                isTopUp
                onBuy={handlePurchase}
                isActive={history.some(
                  (h) =>
                    h.status?.toLowerCase() === 'active' &&
                    h.plan?.name?.trim() === plan.name?.trim()
                )}
              />
            ))}
        </div>
      </div> */}

      {/* Subscription History Table */}
      <div
        id="sub-history"
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 leading-none">
              Subscription history
            </h3>
            <p className="text-md text-slate-500 mt-1.5 font-medium">
              Transaction logs and membership activations
            </p>
          </div>
          <span className="text-md font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 inline-flex items-center gap-1.5 shrink-0">
            <History size={14} /> Audit trail
          </span>
        </div>
        <DataTable
          columns={historyColumns}
          data={history}
          loading={loading}
          emptyMessage="No subscription history found"
          emptyIcon={History}
        />
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={historyState.pagination?.pages || 1}
            totalItems={historyState.pagination?.total || 0}
            pageSize={historyState.pagination?.limit || 10}
            onPageChange={setPage}
          />
        </div>
      </div>

      <Modal
        isOpen={showUpgradeWarning}
        onClose={() => setShowUpgradeWarning(false)}
        title="Confirm Plan Change"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Star size={32} className="text-primary" fill="currentColor" />
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Upgrade to {pendingPlan?.name}?
          </h3>
          <p className="text-md text-slate-500 font-medium leading-relaxed mb-8 max-w-sm mx-auto">
            You are switching from your current plan. Please note that{' '}
            <span className="font-semibold text-slate-900">all remaining days</span> on your active
            subscription will be lost immediately.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handlePurchase(pendingPlan, true)}
              className={`${BTN_PRIMARY} w-full py-3 rounded-lg active:scale-[0.98]`}
            >
              Confirm & activate
            </button>
            <button
              type="button"
              onClick={() => setShowUpgradeWarning(false)}
              className={`${BTN_GHOST} w-full py-3`}
            >
              No, keep my current plan
            </button>
          </div>
        </div>
      </Modal>

      <VendorRegistrationModal
        isOpen={vendorRegistrationForm}
        onClose={() => {
          setVendorRegistrationForm(false);
          toast(
            'Complete your seller profile before posting properties. Use New property on the Properties page when ready.',
            { icon: 'ℹ️' }
          );
        }}
        onComplete={() => {
          setVendorRegistrationForm(false);
          toast.success('Profile complete! You can now post properties.');
        }}
        introMessage="Complete your seller profile to start posting properties."
      />
    </div>
  );
}
