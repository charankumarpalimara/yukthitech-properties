import { useAuthStore, getMe } from '../../../store/authStore';
import {
  useVendorProductsStore,
  selectPropertyById,
  fetchPropertyById,
} from '../../../store/vendorProductsStore';
import { useParams, useNavigate } from 'react-router-dom';
import { isVendorRegistered } from '../../../utils/isVendorRegistered';
import VendorRegistrationModal from '../../../components/vendor/VendorRegistrationModal';
import PropertyCreateForm from '../../vendor/components/ui/PropertyCreateForm';
import { ChevronLeft, Building2, AlertOctagon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CreateProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const property = useVendorProductsStore((s) => selectPropertyById(s, id));
  const [isFetching, setIsFetching] = useState(!!id);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      getMe().finally(() => setProfileChecked(true));
    } else {
      setProfileChecked(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!profileChecked) return;
    if (user && !isVendorRegistered(user)) {
      setShowRegistrationModal(true);
    }
  }, [user, profileChecked]);

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      fetchPropertyById(id).finally(() => {
        setIsFetching(false);
      });
    }
  }, [id]);

  const canPost = isVendorRegistered(user);

  const handleSubmit = () => {
    navigate('/profile/properties');
  };

  const handleCancel = () => {
    navigate('/profile/properties');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-sm gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-primary/30 hover:bg-slate-50 text-slate-500 hover:text-primary transition-all shadow-sm"
          >
            <ChevronLeft size={12} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 leading-none">
              Add Property Listing
            </h2>
            <p className="text-md text-slate-500 mt-1.5 font-medium">
              Configure property details, legal documentation and high-impact media
            </p>
          </div>
        </div>
      </div>

      {/* Rejection Notice Banner - Refined 'Quiet Luxury' Style */}
      {property?.status === 'rejected' && (
        <div className="bg-rose-50 border border-rose-200 px-8 py-6 flex items-center gap-6 animate-in fade-in slide-in-from-top-6 duration-700 w-full shadow-sm rounded-[1.5rem] shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-sm border border-rose-200">
            <AlertOctagon size={28} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest leading-none">
                Correction Required
              </p>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
              Administrative Feedback
            </h3>
            <p className="text-sm font-semibold text-slate-600 leading-snug max-w-3xl">
              {property.rejectionReason ||
                'This listing requires adjustments. Please review the specific feedback below and update your property details accordingly.'}
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-1 px-5 py-3 bg-rose-100/50 rounded-2xl border border-rose-200">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Status</p>
            <p className="text-xs font-black text-rose-700 uppercase tracking-[0.1em]">Rejected</p>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 flex-1 min-h-0 overflow-y-auto custom-scrollbar relative rounded-b-2xl">
        {!canPost ? (
          <div className="flex flex-col items-center justify-center h-full py-32 px-6 text-center space-y-4">
            <Building2 size={40} className="text-slate-300" />
            <p className="text-sm font-semibold text-slate-600 max-w-md">
              Complete your seller profile to create or edit property listings.
            </p>
          </div>
        ) : isFetching ? (
          <div className="flex flex-col items-center justify-center h-full py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
              Loading Details...
            </p>
          </div>
        ) : (
          <PropertyCreateForm
            initialData={property}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      <VendorRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          navigate('/profile/properties');
        }}
        onComplete={() => {
          setShowRegistrationModal(false);
          getMe();
        }}
        introMessage="Complete your seller profile to post properties."
      />
    </div>
  );
}
