import {
  useVendorProductsStore,
  setSearch,
  setTypeFilter,
  setStatusFilter,
  setCityFilter,
  setPage,
  fetchProducts,
} from '../../../../store/vendorProductsStore';
import { useVendorCategoriesStore, fetchCategories } from '../../../../store/vendorCategoriesStore';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  Edit,
  Trash2,
  Save,
  FileText,
  Plus,
  Search,
  TrendingUp,
  Play,
  MapPin,
  Heart,
  Share2,
} from 'lucide-react';

import DataTable from '../../../vendor/components/ui/DataTable';
import Select from '../../../vendor/components/ui/Select';
import {
  PF_INPUT,
  PF_SELECT,
  BTN_PRIMARY,
} from '../../../vendor/components/ui/property-form/formFieldClasses';
import useNewPropertyAction from '../../../vendor/hooks/useNewPropertyAction';
import PropertyPostModals from '../../../vendor/components/PropertyPostModals';

export default function PropertyDraft() {
  const navigate = useNavigate();
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
  const error = useVendorProductsStore((s) => s.error);
  const loading = useVendorProductsStore((s) => s.loading);
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
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const debounceMs = searchQuery?.trim() ? 300 : 0;
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        type: typeFilter,
        status: 'draft',
      });
    }, debounceMs);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchQuery, typeFilter, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const dynamicTypes = [
    { label: 'All Categories', value: '' },
    ...categories.map((cat) => ({ label: cat.name, value: cat._id })),
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (property) => {
    navigate(`/profile/create-property/${property._id}`);
  };

  const handleDelete = (property) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      // Add delete functionality here
    }
  };

  const handlePublish = (property) => {
    navigate(`/profile/create-property/${property._id}?publish=true`);
  };

  const handleView = (property) => {
    navigate(`/profile/property-details/${property._id}`);
  };

  const PropertyCard = ({ prop, onContinue }) => {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        {/* Media Poster */}
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
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm bg-slate-50 text-slate-700 border-slate-200/60">
              Draft
            </span>
          </div>
        </div>

        {/* Card Info */}
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

            {/* Pricing */}
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                <p className="text-base font-extrabold text-slate-900 tabular-nums leading-none">
                  {prop.financials?.totalPrice
                    ? `₹${(prop.financials.totalPrice / 10000000).toFixed(2)} Cr`
                    : 'Price on Request'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContinue(prop);
              }}
              className="flex-1 py-2.5 px-3 bg-primary hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border-none cursor-pointer"
            >
              <Play size={12} fill="currentColor" /> Continue Posting
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <FileText size={48} className="text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800">Error loading drafts</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-5 rounded-3xl border border-slate-200/60 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-none">Draft Properties</h2>
          <p className="text-md text-slate-500 mt-2 font-medium">
            Properties you are working on but haven't published yet
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <FileText size={18} className="text-slate-500 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-bold text-slate-500 leading-none">Total Drafts</p>
              <p className="text-lg font-bold text-slate-900 leading-none mt-1">{list.length}</p>
            </div>
          </div>
          <button onClick={handleNewPost} className={`${BTN_PRIMARY} rounded-xl py-3 cursor-pointer`}>
            <Plus size={14} strokeWidth={3} />
            <span>New Property</span>
          </button>
        </div>
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
        ) : list.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">No draft properties found</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">You don't have any incomplete properties saved as drafts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {list.map((prop) => (
              <PropertyCard
                key={prop._id}
                prop={prop}
                onContinue={(p) => navigate(`/profile/create-property/${p._id}`)}
              />
            ))}
          </div>
        )}
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
