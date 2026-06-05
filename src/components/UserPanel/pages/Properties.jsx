import {
  useVendorProductsStore,
  setSearch,
  setTypeFilter,
  setStatusFilter,
  setCityFilter,
  setPage,
  selectFilteredProperties,
  fetchProducts,
  deleteProperty,
} from '../../../store/vendorProductsStore';
import { useVendorCategoriesStore, fetchCategories } from '../../../store/vendorCategoriesStore';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// import Modal from '../../vendor/components/ui/Modal';
import PropertyForm from '../../vendor/components/ui/PropertyForm';
import Select from '../../vendor/components/ui/Select';
import { PF_INPUT, PF_SELECT, BTN_PRIMARY } from '../../vendor/components/ui/property-form/formFieldClasses';
import DataTable from '../../vendor/components/ui/DataTable';
import Pagination from '../../vendor/components/ui/Pagination';
import useNewPropertyAction from '../../vendor/hooks/useNewPropertyAction';
import PropertyPostModals from '../../vendor/components/PropertyPostModals';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  TrendingUp,
  Plus,
  Play,
  Clock,
  Heart,
  Share2,
  Trash2,
} from 'lucide-react';

const statuses = [
  { label: 'All Statuses', value: '' },
  { label: 'Inactive', value: 'inactive' },
  // { label: 'New', value: 'new' },
  { label: 'Processing', value: 'processing' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Verified', value: 'verified' },
  { label: 'Draft', value: 'draft' },
];

const cities = [
  { label: 'All Locations', value: '' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Bangalore', value: 'Bangalore' },
  { label: 'Delhi NCR', value: 'Delhi NCR' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Chennai', value: 'Chennai' },
];

export default function Properties() {
  const navigate = useNavigate();
  const loading = useVendorProductsStore((s) => s.loading);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        toast.success('Property deleted successfully');
      } catch (err) {
        toast.error(err.message || 'Failed to delete property');
      }
    }
  };
  const searchQuery = useVendorProductsStore((s) => s.searchQuery);
  const typeFilter = useVendorProductsStore((s) => s.typeFilter);
  const statusFilter = useVendorProductsStore((s) => s.statusFilter);
  const cityFilter = useVendorProductsStore((s) => s.cityFilter);
  const currentPage = useVendorProductsStore((s) => s.currentPage);
  const pageSize = useVendorProductsStore((s) => s.pageSize);
  const list = useVendorProductsStore((s) => s.list) ?? [];
  const totalItems = useVendorProductsStore((s) => s.totalItems);
  const totalPages = useVendorProductsStore((s) => s.totalPages);
  const statusCounts = useVendorProductsStore((s) => s.statusCounts) ?? {};
  const categories = useVendorCategoriesStore((s) => s.categories) ?? [];
  const filtered = useVendorProductsStore(selectFilteredProperties);

  const {
    subscription,
    showSubModal,
    setShowSubModal,
    modalType,
    showRegistrationModal,
    setShowRegistrationModal,
    handleNewPost,
    handleRegistrationComplete,
    handleRegistrationDismiss,
  } = useNewPropertyAction();

  const dynamicTypes = [
    { label: 'All Categories', value: '' },
    ...categories.map((cat) => ({ label: cat.name, value: cat._id })),
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounceMs = searchQuery?.trim() ? 300 : 0;
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        type: typeFilter,
        status: statusFilter,
      });
    }, debounceMs);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchQuery, typeFilter, statusFilter]);

  // Server already paginates the result, so no need to slice locally
  const paginated = filtered;

  const counts = {
    all: totalItems,
    active: statusCounts.activePropertiesCount || 0,
    processing: statusCounts.processingPropertiesCount || 0,
    rejected: 0, // Not provided by the backend endpoint yet
    verified: statusCounts.verifieddPropertiesCount || statusCounts.verifiedPropertiesCount || 0, // Handling typo from backend
    draft: statusCounts.draftPropertiesCount || 0,
    wishlist: statusCounts.wishlistCount || 0,
  };

  const PropertyCard = ({ prop, onView, onContinue, onResubmit, onDelete }) => {
    const status = prop.status?.toLowerCase();
    const isDraft = status === 'draft';
    const isRejected = status === 'rejected';

    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        {/* Poster Media */}
        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-100">
          {prop.media?.poster ? (
            <img
              src={prop.media.poster}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt={prop.projectName || 'Property'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Building2 size={36} strokeWidth={1.5} />
            </div>
          )}
          
          {/* Status Overlay Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
              status === 'verified'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                : status === 'pending' || status === 'processing'
                  ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                  : status === 'rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                    : 'bg-slate-50 text-slate-700 border-slate-200/60'
            }`}>
              {status === 'pending' ? 'Under Review' : prop.status || 'Draft'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              {prop.propertyType?.name || 'Property Category'}
            </span>
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors mb-2">
              {prop.projectName || 'Unnamed Property'}
            </h3>
            
            <div className="flex items-center gap-1.5 text-slate-500 mb-4">
              <MapPin size={14} className="text-primary/60 shrink-0" />
              <span className="text-xs font-semibold line-clamp-1">
                {prop.address?.addressLine1 || prop.address?.addressLine2 || 'Location N/A'}
              </span>
            </div>

            {/* Pricing Info */}
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                <p className="text-base font-extrabold text-slate-900 tabular-nums leading-none">
                  {prop.financials?.totalPrice
                    ? `₹${(prop.financials.totalPrice / 10000000).toFixed(2)} Cr`
                    : 'Price on Request'}
                </p>
              </div>
              {prop.financials?.pricePerSft && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/60 flex items-center gap-1">
                  <TrendingUp size={12} /> ₹{prop.financials.pricePerSft}/sft
                </span>
              )}
            </div>

            {/* Analytics Stats */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 mb-4">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Views</span>
                <span className="text-xs font-bold text-slate-700">{prop.views ?? 0}</span>
              </div>
              <div className="text-center border-l border-r border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Wishlist</span>
                <span className="text-xs font-bold text-slate-700">{prop.wishlistCount ?? 0}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Shares</span>
                <span className="text-xs font-bold text-slate-700">{prop.shareCount ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-2">
            {isDraft && onContinue ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(prop);
                }}
                className="flex-1 py-2 px-3 bg-primary hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border-none cursor-pointer"
              >
                <Play size={12} fill="currentColor" /> Continue
              </button>
            ) : isRejected && onResubmit ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResubmit(prop);
                }}
                className="flex-1 py-2 px-3 bg-primary hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border-none cursor-pointer"
              >
                <Edit size={12} /> Edit & Fix
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(prop);
                }}
                className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Eye size={12} /> Details
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(prop._id);
                }}
                className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl border border-rose-100/60 transition-all duration-300 active:scale-95 shrink-0 cursor-pointer"
                title="Delete Listing"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-5 rounded-3xl border border-slate-200/60 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 leading-none">Property Repository</h2>
          <p className="text-md text-slate-500 mt-2 font-medium">
            Manage your portfolio listings and verification status
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button type="button" onClick={handleNewPost} className={`${BTN_PRIMARY} rounded-xl py-3 group cursor-pointer`}>
            <Plus
              size={14}
              strokeWidth={3}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            <span>New property</span>
          </button>
        </div>
      </div>

      {/* Professional Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Pending Review',
            value: counts.processing,
            icon: Clock,
            color: 'amber',
          },
          {
            label: 'Verified Listings',
            value: counts.verified,
            icon: CheckCircle,
            color: 'emerald',
          },
          {
            label: 'Action Required',
            value: counts.rejected,
            icon: XCircle,
            color: 'rose',
          },
          {
            label: 'Draft Listings',
            value: counts.draft,
            icon: Filter,
            color: 'slate',
          },
        ].map((s) => {
          const styles = {
            amber: 'bg-amber-50 text-amber-600 border-amber-100',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            rose: 'bg-rose-50 text-rose-600 border-rose-100',
            slate: 'bg-slate-50 text-slate-500 border-slate-200',
          };
          return (
            <div
              key={s.label}
              className="bg-white p-6 rounded-3xl border border-slate-200/60 flex items-center gap-5 hover:shadow-md transition-all duration-300 group cursor-default"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${styles[s.color]} border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
              >
                <s.icon size={24} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                <h4 className="text-3xl font-extrabold text-slate-900 leading-none">
                  {s.value.toLocaleString()}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Property Repository Card Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Integrated Filter Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/20">
          <div className="flex-1 w-full md:max-w-md relative group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
            />
            <input
              className={`${PF_INPUT} pl-11 rounded-xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20`}
              placeholder="Search properties by name, location or ID..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-44">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={dynamicTypes}
                placeholder="Category"
                className={`${PF_SELECT} rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20`}
              />
            </div>
            <div className="flex-1 md:w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statuses}
                placeholder="Status"
                className={`${PF_SELECT} rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20`}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse">
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl w-full" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {paginated.map((prop) => (
              <PropertyCard
                key={prop._id}
                prop={prop}
                onView={(p) => navigate(`/profile/property-details/${p._id}`)}
                onContinue={(p) => navigate(`/profile/create-property/${p._id}`)}
                onResubmit={(p) => navigate(`/profile/create-property/${p._id}?resubmit=true`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setPage(page)}
          />
        </div>
      </div>

      <PropertyPostModals
        subscription={subscription}
        showSubModal={showSubModal}
        setShowSubModal={setShowSubModal}
        modalType={modalType}
        showRegistrationModal={showRegistrationModal}
        setShowRegistrationModal={setShowRegistrationModal}
        onRegistrationComplete={handleRegistrationComplete}
        onRegistrationDismiss={handleRegistrationDismiss}
      />
    </div>
  );
}
