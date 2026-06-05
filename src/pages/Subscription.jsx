import { useState, useEffect } from 'react';
import { useSubscriptionStore, fetchPlans, purchaseSubscription } from '../store/subscriptionStore';
import { useAuthStore, openLoginModal, getMe } from '../store/authStore';
import toast from 'react-hot-toast';
import { CheckCircle2, X, ArrowRight, Crown, Sparkles } from 'lucide-react';
import Modal from '../components/vendor/components/ui/Modal';
import VendorRegistrationModal from '../components/vendor/VendorRegistrationModal';
import { isVendorRegistered } from '../utils/isVendorRegistered';
import { formatPurchaseToastError } from '../utils/getErrorMessage';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { isSellerUserType } from '../utils/isSellerUserType';

const getListingTypeMeta = (plan) => {
  const raw = String(plan?.listingPlacement || plan?.listingType || '')
    .trim()
    .toLowerCase();
  const normalized = raw.replace(/\s+/g, '_');
  const isFeatured = normalized === 'featured_listing' || normalized === 'featured';

  if (isFeatured) {
    return {
      label: 'Featured Listing',
      className: 'bg-indigo-50 text-indigo-800 border border-indigo-200/70',
    };
  }

  return {
    label: 'Premium Listing',
    className: 'bg-amber-50 text-amber-800 border border-amber-200/70',
  };
};

export default function Subscription() {
  const [billingCycleTab, setBillingCycleTab] = useState('monthly');
  const [vendorRegistrationForm, setVendorRegistrationForm] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const plans = useSubscriptionStore((s) => s.plans);
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

  if (sellerRedirect) {
    return <Navigate to={sellerRedirect} replace />;
  }

  const getDisplayPrice = (plan) => {
    if (billingCycleTab === 'annual') {
      return (plan.annualPrice || 0).toLocaleString('en-IN');
    }
    return (plan.monthlyPrice || 0).toLocaleString('en-IN');
  };

  const getAnnualTotal = (plan) => {
    if (plan.annualPrice === 0) return 'Free forever';
    if (plan.annualPrice != null && plan.annualPrice > 0) {
      return `Billed annually at ₹${plan.annualPrice.toLocaleString('en-IN')}`;
    }
    return '\u00A0';
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
      price: billingCycleTab === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice,
    };

    toast.promise(
      purchaseSubscription(purchaseData).then(() => {
        // Sync user state and intelligently route or prompt profile completion
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
            // Fallback if getMe fails
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
    <div className="bg-slate-50 min-h-screen px-5 pb-[60px] text-slate-900 relative z-10">
      <div className="max-w-[1280px] mx-auto">
        <header className="text-center max-w-[600px] mx-auto mb-7 pt-6 flex flex-col items-center">
          {/* <div className="bg-amber-500 text-white px-3 py-0.5 rounded-full font-bold text-[0.65rem] tracking-widest uppercase mb-3 border border-amber-400">
            Agent &amp; Developer Portal
          </div> */}
          <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight mb-2 text-slate-900">
            Scale your real estate empire.
          </h1>
          {/* <p className="text-[0.86rem] text-slate-500 leading-relaxed mb-4">
            Unlock premium buyer leads, dominate search visibility, and post unlimited properties.
          </p> */}

          <div className="inline-flex bg-slate-100 rounded-full p-1 relative shadow-inner border border-slate-200 w-full max-w-[380px] h-[42px]">
            <div
              className={`absolute top-1 bottom-1 rounded-full bg-white shadow-sm z-10 transition-all duration-300`}
              style={{
                width: 'calc(50% - 4px)',
                left: billingCycleTab === 'monthly' ? '4px' : 'calc(50%)',
              }}
            />
            <button
              className={`flex-1 h-full rounded-full text-[0.8rem] font-medium border-none bg-transparent cursor-pointer transition-colors duration-300 relative z-20 flex items-center justify-center gap-2 whitespace-nowrap ${billingCycleTab === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setBillingCycleTab('monthly')}
            >
              Billed Monthly
            </button>
            <button
              className={`flex-1 h-full rounded-full text-[0.8rem] font-medium border-none bg-transparent cursor-pointer transition-colors duration-300 relative z-20 flex items-center justify-center gap-2 whitespace-nowrap ${billingCycleTab === 'annual' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setBillingCycleTab('annual')}
            >
              Billed Annually
              <span
                className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition-all duration-300 border ${billingCycleTab === 'annual' ? 'bg-amber-500 text-white border-transparent shadow-sm' : 'bg-amber-50 text-amber-700 border-amber-700/10'}`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </header>

        <div className="flex flex-wrap justify-center items-stretch gap-4 w-full">
          {plans
            .filter((plan) => {
              if (billingCycleTab === 'annual') {
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
            .map((plan) => {
              const isPopular = plan.highlightTag;
              const listingTypeMeta = getListingTypeMeta(plan);

              return (
                <div
                  key={plan._id || plan.id}
                  className={`w-full max-w-[300px] sm:w-[300px] bg-white border rounded-2xl flex flex-col relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] h-full group ${
                    isPopular
                      ? 'border-amber-500 border-2 shadow-[0_8px_16px_rgba(245,158,11,0.1)]'
                      : 'border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 bg-amber-500 px-4 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-[0.65rem] tracking-wider uppercase whitespace-nowrap">
                        {isPopular}
                      </span>
                    </div>
                  )}

                  <div className={`flex flex-col h-full p-5 ${isPopular ? 'pt-7' : ''}`}>
                    <div className=" pb-3">
                      <div className="mb-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${listingTypeMeta.className}`}
                        >
                          {listingTypeMeta.label}
                        </span>
                      </div>
                      <h3 className="text-3xl font-semibold text-slate-900 mb-3">{plan.name}</h3>
                      <div className="flex items-start gap-0.5">
                        <span className="text-2xl font-semibold text-slate-900 ">₹</span>
                        <span className="text-2xl font-semibold text-slate-900 leading-none tracking-tight">
                          {getDisplayPrice(plan)}
                        </span>
                        <span className="text-[0.8rem] text-slate-500 font-medium self-end mb-1 ml-1">
                          {billingCycleTab === 'annual' ? '/Yearly' : '/Monthly'}
                        </span>
                      </div>
                      <div className="text-[0.7rem] text-slate-400 mt-0.2 min-h-[14px]">
                        {billingCycleTab === 'annual' && plan.annualPrice
                          ? getAnnualTotal(plan)
                          : '\u00A0'}
                      </div>
                    </div>

                    <div className="flex-1 mb-4">
                      <ul className="flex flex-col gap-2">
                        <li className="flex items-start gap-2 text-[0.8rem] leading-[1.4] text-slate-700">
                          <div className="mt-[2px] text-emerald-500 shrink-0">
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                          </div>
                          <span>
                            List Upto{' '}
                            {billingCycleTab === 'annual'
                              ? plan.annualPropertyLimit || plan.propertyLimit
                              : plan.monthlyPropertyLimit || plan.propertyLimit}{' '}
                            Properties
                          </span>
                        </li>
                        {[...(plan.features || [])]
                          .sort((a, b) => (b.isIncluded ? 1 : 0) - (a.isIncluded ? 1 : 0))
                          .map((feature, i) => (
                            <li
                              key={feature._id || i}
                              className={`flex items-start gap-2 text-[0.8rem] leading-[1.4] ${!feature.isIncluded ? 'text-slate-400' : 'text-slate-700'}`}
                            >
                              <div
                                className={`mt-[2px] shrink-0 ${!feature.isIncluded ? 'text-slate-300' : 'text-emerald-500'}`}
                              >
                                {feature.isIncluded ? (
                                  <CheckCircle2 size={16} strokeWidth={2.5} />
                                ) : (
                                  <X size={16} strokeWidth={2.5} />
                                )}
                              </div>
                              <span>{feature.name}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLoggedIn) {
                            openLoginModal('Login required to choose a plan');
                          } else {
                            setSelectedPlan(plan);
                          }
                        }}
                        className={`w-full py-2 px-4 rounded-xl text-[0.85rem] font-bold cursor-pointer transition-all duration-200 border flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                          isPopular
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-sm shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 hover:shadow-md hover:shadow-amber-500/35 focus-visible:ring-amber-400'
                            : 'bg-white text-slate-800 border-slate-200 shadow-sm hover:border-amber-300 hover:bg-amber-50/80 hover:text-amber-900 focus-visible:ring-amber-300'
                        }`}
                      >
                        {isPopular ? (
                          <Crown
                            size={16}
                            strokeWidth={2.25}
                            className="shrink-0 opacity-95"
                            aria-hidden
                          />
                        ) : (
                          <Sparkles
                            size={16}
                            strokeWidth={2.25}
                            className="shrink-0 text-amber-500"
                            aria-hidden
                          />
                        )}
                        <span>{plan.cta || 'Choose Plan'}</span>
                        <ArrowRight
                          size={15}
                          strokeWidth={2.5}
                          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title="Confirm Subscription"
      >
        {selectedPlan && (
          <div className="flex flex-col gap-4">
            <p className="text-slate-600 text-[0.95rem]">
              You are about to purchase the following subscription plan:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Listing Type:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getListingTypeMeta(selectedPlan).className}`}
                >
                  {getListingTypeMeta(selectedPlan).label}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Plan:</span>
                <span className="text-[1.05rem]">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Billing Cycle:</span>
                <span className="capitalize">{billingCycleTab}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Property Limit:</span>
                <span className="text-emerald-600">
                  {billingCycleTab === 'annual'
                    ? selectedPlan.annualPropertyLimit || selectedPlan.propertyLimit
                    : selectedPlan.monthlyPropertyLimit || selectedPlan.propertyLimit}{' '}
                  Listings
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Total Amount:</span>
                <span className="text-amber-600 text-[1.2rem]">
                  ₹{getDisplayPrice(selectedPlan)}
                  <span className="text-[0.8rem] text-slate-500 ml-1">
                    {selectedPlan.monthlyPrice !== 0 && selectedPlan.annualPrice !== 0
                      ? `/${billingCycleTab === 'annual' ? 'yr' : 'mo'}`
                      : ''}
                  </span>
                </span>
              </div>
            </div>

            <p className="text-slate-700 font-medium text-[1rem] text-center mt-3">
              Are you sure you want to buy this subscription?
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-3 rounded-[5px] border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                className="flex-1 py-3 rounded-[5px] bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-sm"
              >
                Confirm & Buy
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
