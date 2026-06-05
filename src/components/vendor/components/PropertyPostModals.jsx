import { useNavigate } from 'react-router-dom';
import { Building2, Clock } from 'lucide-react';
import { BTN_DARK, BTN_GHOST } from '../components/ui/property-form/formFieldClasses';
import VendorRegistrationModal from '../VendorRegistrationModal';

export default function PropertyPostModals({
  subscription,
  showSubModal,
  setShowSubModal,
  modalType,
  showRegistrationModal,
  setShowRegistrationModal,
  onRegistrationComplete,
  onRegistrationDismiss,
}) {
  const navigate = useNavigate();

  return (
    <>
      {showSubModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[28px] max-w-md w-full shadow-2xl p-10 text-center relative overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-primary" />
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
              {modalType === 'limit' ? (
                <Building2 className="text-rose-500" size={40} />
              ) : (
                <Clock className="text-rose-500" size={40} />
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
              {modalType === 'limit'
                ? 'Limit Reached'
                : modalType === 'expiry'
                  ? 'Plan Expired'
                  : 'Access Restricted'}
            </h3>
            <p className="text-slate-500 mb-8 leading-relaxed font-medium">
              {modalType === 'limit'
                ? `You've reached your maximum limit of ${subscription?.totalLimit} properties. Upgrade your plan to continue listing.`
                : modalType === 'expiry'
                  ? `Your subscription expired on ${new Date(subscription?.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Please renew to proceed.`
                  : 'You need an active subscription plan to create new property listings.'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile/subscriptions')}
                className={`${BTN_DARK} w-full rounded-xl py-4 shadow-lg shadow-slate-200 active:scale-95`}
              >
                View Plans & Pricing
              </button>
              <button
                type="button"
                onClick={() => setShowSubModal(false)}
                className={`${BTN_GHOST} w-full py-4 rounded-xl bg-slate-50`}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <VendorRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          onRegistrationDismiss?.();
        }}
        onComplete={onRegistrationComplete}
        introMessage="Complete your seller profile to post properties. You can finish this now or when you tap New property."
      />
    </>
  );
}
