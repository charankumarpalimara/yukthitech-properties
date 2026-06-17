import { useState, useEffect, useMemo } from 'react';
import { useSubscriptionStore, fetchPlans, purchaseSubscription } from '../store/subscriptionStore';
import { useAuthStore, openLoginModal, getMe } from '../store/authStore';
import toast from 'react-hot-toast';
import {
  Check,
  X,
  ArrowRight,
  Crown,
  Star,
  Building2,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import Modal from '../components/vendor/components/ui/Modal';
import VendorRegistrationModal from '../components/vendor/VendorRegistrationModal';
import { isVendorRegistered } from '../utils/isVendorRegistered';
import { formatPurchaseToastError } from '../utils/getErrorMessage';
import { useNavigate, useSearchParams, Navigate, Link } from 'react-router-dom';
import { isSellerUserType } from '../utils/isSellerUserType';

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Secure Razorpay checkout' },
  { icon: Building2, label: 'Reach verified buyers' },
  { icon: Zap, label: 'Instant plan activation' },
];

const getListingTypeMeta = (plan) => {
  const raw = String(plan?.listingPlacement || plan?.listingType || '')
    .trim()
    .toLowerCase();
  const normalized = raw.replace(/\s+/g, '_');
  const isFeatured = normalized === 'featured_listing' || normalized === 'featured';

  if (isFeatured) {
    return {
      label: 'Featured',
      className: 'bg-gold/15 text-gold border-gold/25',
    };
  }

  return {
    label: 'Premium',
    className: 'bg-primary/10 text-primary border-primary/15',
  };
};

const getPlanTier = (plan) => {
  const name = String(plan?.name || '').toLowerCase();
  if (name.includes('premium') || getListingTypeMeta(plan).label === 'Featured') return 'premium';
  if (name.includes('standard') || name.includes('pro')) return 'standard';
  return 'basic';
};

function PlanCardSkeleton() {
  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-3xl border-2 border-slate-100 bg-white p-6 animate-pulse">
      <div className="mb-6 h-5 w-24 rounded-full bg-slate-100" />
      <div className="mb-2 h-7 w-32 rounded-lg bg-slate-100" />
      <div className="mb-6 h-10 w-28 rounded-lg bg-slate-100" />
      <div className="mb-4 h-px w-full bg-slate-100" />
      <div className="flex-1 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 rounded bg-slate-100" style={{ width: `${70 + i * 5}%` }} />
        ))}
      </div>
      <div className="mt-6 h-12 rounded-xl bg-slate-100" />
    </div>
  );
}

function PlanCard({ plan, billingCycle, onSelect }) {
  const tier = getPlanTier(plan);
  const isPremium = tier === 'premium';
  const isStandard = tier === 'standard';
  const isPopular = Boolean(plan.highlightTag);
  const listingMeta = getListingTypeMeta(plan);

  const price =
    billingCycle === 'annual' ? plan.annualPrice || 0 : plan.monthlyPrice || 0;
  const propertyLimit =
    billingCycle === 'annual'
      ? plan.annualPropertyLimit || plan.propertyLimit
      : plan.monthlyPropertyLimit || plan.propertyLimit;

  const annualSavings =
    plan.monthlyPrice > 0 && plan.annualPrice > 0
      ? plan.monthlyPrice * 12 - plan.annualPrice
      : 0;

  const sortedFeatures = [...(plan.features || [])].sort(
    (a, b) => (b.isIncluded ? 1 : 0) - (a.isIncluded ? 1 : 0)
  );

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isPremium
          ? 'border-gold/35 bg-gradient-to-br from-[#011f16] via-primary to-[#034432] text-white shadow-lg shadow-primary/20'
          : isStandard
            ? 'border-primary/20 bg-white shadow-sm hover:border-gold/40'
            : 'border-slate-200/80 bg-white shadow-sm hover:border-slate-300'
      } ${isPopular && !isPremium ? 'ring-2 ring-gold/30 ring-offset-2' : ''}`}
    >
      {isPopular && (
        <div
          className={`absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl rounded-tr-[22px] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-sm ${
            isPremium
              ? 'bg-gradient-to-r from-gold to-gold-600 text-[#011f16]'
              : 'bg-gradient-to-r from-primary to-[#034432] text-white'
          }`}
        >
          <Star className="h-3 w-3 shrink-0 fill-current" />
          {plan.highlightTag || 'Popular'}
        </div>
      )}

      <div className={`mb-5 ${isPopular ? 'pt-4' : ''}`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${listingMeta.className}`}
          >
            {listingMeta.label} listing
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className={`text-xl font-bold tracking-tight ${isPremium ? 'text-gold' : 'text-slate-900'}`}
            >
              {plan.name}
            </h3>
            <p className={`mt-1 text-xs font-medium ${isPremium ? 'text-white/50' : 'text-slate-400'}`}>
              Seller plan
            </p>
          </div>
          {isPremium && (
            <span className="rounded-xl bg-gold/15 p-2 text-gold">
              <Crown className="h-5 w-5" />
            </span>
          )}
        </div>

        <div className="mt-5 flex items-baseline gap-0.5">
          <span className={`text-lg font-bold ${isPremium ? 'text-white/60' : 'text-slate-400'}`}>
            ₹
          </span>
          <span
            className={`text-4xl font-extrabold tabular-nums leading-none tracking-tight ${isPremium ? 'text-white' : 'text-slate-900'}`}
          >
            {price.toLocaleString('en-IN')}
          </span>
          <span className={`ml-1 text-xs font-semibold ${isPremium ? 'text-white/50' : 'text-slate-500'}`}>
            / {billingCycle === 'annual' ? 'year' : 'month'}
          </span>
        </div>

        {billingCycle === 'annual' && annualSavings > 0 && (
          <div
            className={`mt-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              isPremium
                ? 'border-gold/25 bg-gold/10 text-gold'
                : 'border-emerald-100 bg-emerald-50 text-emerald-700'
            }`}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
            Save ₹{annualSavings.toLocaleString('en-IN')} yearly
          </div>
        )}
      </div>

      <div className={`mb-5 h-px w-full ${isPremium ? 'bg-white/10' : 'bg-slate-100'}`} />

      <div className="flex-1 space-y-3">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${isPremium ? 'text-gold/60' : 'text-slate-400'}`}
        >
          What&apos;s included
        </p>

        <div className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              isPremium ? 'bg-gold/20 text-gold' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className={`text-sm font-semibold ${isPremium ? 'text-slate-200' : 'text-slate-700'}`}>
            List up to {propertyLimit} properties
          </span>
        </div>

        {sortedFeatures.map((feature, i) => {
          const included = feature.isIncluded !== false;
          return (
            <div
              key={feature._id || i}
              className={`flex items-start gap-2.5 ${!included ? 'opacity-45' : ''}`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  included
                    ? isPremium
                      ? 'bg-gold/20 text-gold'
                      : 'bg-emerald-50 text-emerald-600'
                    : isPremium
                      ? 'bg-white/10 text-white/40'
                      : 'bg-slate-50 text-slate-400'
                }`}
              >
                {included ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <X className="h-3 w-3" strokeWidth={3} />
                )}
              </span>
              <span
                className={`text-sm font-medium leading-snug ${
                  included
                    ? isPremium
                      ? 'text-slate-200'
                      : 'text-slate-600'
                    : isPremium
                      ? 'text-slate-400'
                      : 'text-slate-500'
                }`}
              >
                {feature.name}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect(plan)}
        className={`group mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
          isPremium
            ? 'bg-gold text-[#011f16] shadow-md shadow-gold/20 hover:bg-gold-400 hover:shadow-lg'
            : isPopular
              ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-[#034432]'
              : 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
        }`}
      >
        {isPremium ? (
          <Crown className="h-4 w-4" />
        ) : (
          <Sparkles className={`h-4 w-4 ${isPopular ? 'text-gold' : 'text-primary'}`} />
        )}
        <span>{plan.cta || 'Choose plan'}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </article>
  );
}

export default function Subscription() {
  const [billingCycleTab, setBillingCycleTab] = useState('monthly');
  const [vendorRegistrationForm, setVendorRegistrationForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const plans = useSubscriptionStore((s) => s.plans);
  const loading = useSubscriptionStore((s) => s.loading);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sellerRedirect =
    isLoggedIn && isSellerUserType(user?.type)
      ? `/profile/subscriptions${searchParams.get('completeProfile') === '1' ? '?completeProfile=1' : ''}`
      : null;

  useEffect(() => {
    if (sellerRedirect) {
      toast('Manage your subscription from the seller dashboard.', { icon: 'ℹ️' });
    }
  }, [sellerRedirect]);

  useEffect(() => {
    if (sellerRedirect) return;
    if (searchParams.get('completeProfile') === '1') {
      setVendorRegistrationForm(true);
    }
  }, [searchParams, sellerRedirect]);

  useEffect(() => {
    if (sellerRedirect) return;
    fetchPlans();
  }, [sellerRedirect]);

  const visiblePlans = useMemo(
    () =>
      plans.filter((plan) => {
        if (billingCycleTab === 'annual') {
          return (
            (plan.annualPropertyLimit > 0 || plan.propertyLimit > 0) &&
            plan.annualPrice != null &&
            plan.annualPrice !== 0
          );
        }
        return (
          (plan.monthlyPropertyLimit > 0 || plan.propertyLimit > 0) &&
          plan.monthlyPrice != null &&
          plan.monthlyPrice !== 0
        );
      }),
    [plans, billingCycleTab]
  );

  if (sellerRedirect) {
    return <Navigate to={sellerRedirect} replace />;
  }

  const getDisplayPrice = (plan) => {
    if (billingCycleTab === 'annual') {
      return (plan.annualPrice || 0).toLocaleString('en-IN');
    }
    return (plan.monthlyPrice || 0).toLocaleString('en-IN');
  };

  const getPropertyLimit = (plan) =>
    billingCycleTab === 'annual'
      ? plan.annualPropertyLimit || plan.propertyLimit
      : plan.monthlyPropertyLimit || plan.propertyLimit;

  const handlePlanSelect = (plan) => {
    if (!isLoggedIn) {
      openLoginModal('Login required to choose a plan');
      return;
    }
    setSelectedPlan(plan);
  };

  const handleBuy = () => {
    if (!selectedPlan) return;

    const startDate = new Date();
    const endDate = new Date();

    if (billingCycleTab === 'monthly') {
      endDate.setMonth(startDate.getMonth() + 1);
    } else {
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    const purchaseData = {
      planId: selectedPlan._id || selectedPlan.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationType: billingCycleTab,
      price:
        billingCycleTab === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice,
    };

    toast.promise(
      purchaseSubscription(purchaseData).then(() => {
        getMe()
          .then((updatedUser) => {
            if (isVendorRegistered(updatedUser)) {
              toast.success('Subscription activated! Redirecting to dashboard...');
              navigate('/profile/dashboard');
            } else {
              setVendorRegistrationForm(true);
            }
          })
          .catch(() => {
            setVendorRegistrationForm(true);
          });
      }),
      {
        loading: `Purchasing ${selectedPlan.name}...`,
        success: 'Subscription activated successfully!',
        error: (err) => formatPurchaseToastError(err),
      }
    );
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-surface font-outfit text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#034432] to-primary-dark px-5 pb-24 pt-10 text-white sm:px-8 sm:pt-14 sm:pb-28">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-56 w-56 rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-[1280px] text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
            <Building2 className="h-3.5 w-3.5" />
            For owners &amp; agents
          </span>

          <h1 className="mx-auto max-w-2xl text-[1.75rem] text-white font-bold leading-tight tracking-tight sm:text-4xl">
            List your property and reach serious buyers
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Choose a plan that fits your listings. Get visibility, verified enquiries, and seller
            tools on Yukthi Properties.
          </p>

          {/* Billing toggle */}
          <div className="mx-auto mt-8 inline-flex h-12 w-full max-w-[400px] rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setBillingCycleTab('monthly')}
              className={`relative z-10 flex flex-1 items-center justify-center rounded-full text-sm font-bold transition-all ${
                billingCycleTab === 'monthly' ? 'bg-white text-primary shadow-md' : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycleTab('annual')}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-bold transition-all ${
                billingCycleTab === 'annual' ? 'bg-white text-primary shadow-md' : 'text-white/70 hover:text-white'
              }`}
            >
              Annual
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  billingCycleTab === 'annual'
                    ? 'bg-gold text-[#011f16]'
                    : 'bg-gold/20 text-gold'
                }`}
              >
                Save
              </span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/75 sm:text-sm"
              >
                <Icon className="h-4 w-4 text-gold" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Plans grid */}
      <section className="relative z-20 mx-auto -mt-14 max-w-[1280px] px-5 pb-16 sm:px-8 sm:pb-20">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : visiblePlans.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Building2 className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-lg font-bold text-slate-900">No plans available</h2>
            <p className="mt-2 text-sm text-slate-500">
              Subscription plans for {billingCycleTab} billing are not available right now. Try
              switching the billing cycle or check back later.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 ${
              visiblePlans.length === 1
                ? 'max-w-sm mx-auto'
                : visiblePlans.length === 2
                  ? 'sm:grid-cols-2 max-w-3xl mx-auto'
                  : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {visiblePlans.map((plan) => (
              <PlanCard
                key={plan._id || plan.id}
                plan={plan}
                billingCycle={billingCycleTab}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        )}

        {/* Bottom note */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
          All plans include secure payment via Razorpay. After purchase, complete your seller profile
          to start posting properties. Need help choosing?{' '}
          <Link to="/contact-us" className="font-semibold text-primary no-underline hover:underline">
            Contact us
          </Link>
          .
        </p>
      </section>

      {/* Confirm modal */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title="Confirm your plan"
        size="md"
      >
        {selectedPlan && (
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-slate-600">
              Review your selection before proceeding to secure checkout.
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Selected plan
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">{selectedPlan.name}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getListingTypeMeta(selectedPlan).className}`}
                  >
                    {getListingTypeMeta(selectedPlan).label}
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-5 py-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Billing</span>
                  <span className="font-bold capitalize text-slate-800">{billingCycleTab}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Property limit</span>
                  <span className="font-bold text-emerald-700">
                    {getPropertyLimit(selectedPlan)} listings
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-700">Total</span>
                  <span className="text-2xl font-extrabold tabular-nums text-primary">
                    ₹{getDisplayPrice(selectedPlan)}
                    <span className="ml-1 text-sm font-semibold text-slate-400">
                      /{billingCycleTab === 'annual' ? 'yr' : 'mo'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBuy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-[#034432] active:scale-[0.98]"
              >
                Pay now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>

      <VendorRegistrationModal
        isOpen={vendorRegistrationForm}
        onClose={() => {
          setVendorRegistrationForm(false);
          toast(
            'You can complete your seller profile anytime from Properties. Use New property when ready.',
            { icon: 'ℹ️' }
          );
        }}
        onComplete={() => {
          setVendorRegistrationForm(false);
          navigate('/profile/dashboard');
        }}
        introMessage="Complete your seller profile to start posting properties."
      />
    </div>
  );
}
