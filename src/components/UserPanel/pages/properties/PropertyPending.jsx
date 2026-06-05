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
  AlertCircle,
  Clock,
  Plus,
  Search,
  TrendingUp,
  MapPin,
  CheckCircle,
  XCircle,
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

export default function PropertyPending() {
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
    // fetchProducts({ status: 'rejected', search: searchTerm, type: typeFilter });
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
        status: 'pending',
      });
    }, debounceMs);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchQuery, typeFilter, statusFilter]);

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
    if (window.confirm('Are you sure you want to delete this property?')) {
      // Add delete functionality here
    }
  };

  const handleView = (property) => {
    navigate(`/profile/property-details/${property._id}`);
  };

  const columns = [
    {
      header: 'Property',
      cell: (prop) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1 group-hover:rotate-3 transition-transform overflow-hidden shadow-sm">
            {prop.media?.poster ? (
              <img
                src={prop.media.poster}
                className="w-full h-full object-cover rounded-lg"
                alt=""
              />
            ) : (
              <Building2 size={16} className="text-slate-400" />
            )}
          </div>
          <div>
            <p>{prop.projectName}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (prop) => <span className="capitalize">{prop.propertyType?.name}</span>,
    },
    {
      header: 'Location',
      cell: (prop) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary/50 shrink-0" />
          <span>{prop.address?.addressLine1 || prop.address?.addressLine2 || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Wishlist',
      cell: (prop) => (
        <div className="flex items-center gap-1.5">
          <Heart
            size={14}
            className="text-rose-500"
            fill={prop.wishlistCount > 0 ? 'currentColor' : 'none'}
          />
          <span>{prop.wishlistCount ?? 0}</span>
        </div>
      ),
    },
    {
      header: 'Shares',
      cell: (prop) => (
        <div className="flex items-center gap-1.5">
          <Share2 size={14} className="text-amber-500" />
          <span>{prop.shareCount ?? 0}</span>
        </div>
      ),
    },
    {
      header: 'Total Views',
      cell: (prop) => (
        <div className="flex items-center gap-1.5">
          <Eye size={14} className="text-slate-400" />
          <span>{prop.views ?? 0}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: () => <span className="capitalize data-table__status--pending">Under Review</span>,
    },
    {
      header: 'Actions',
      className: 'text-center',
      cell: (prop) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/property-details/${prop._id}`);
            }}
            className="btn-action btn-action-view"
            title="View Details"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800">Error loading properties</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 leading-none">
            Pending Review Properties
          </h2>
          <p className="text-md text-slate-500 mt-1.5 font-medium">
            Properties awaiting admin review and approval
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock size={18} className="text-amber-600 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold text-amber-700 leading-none">Under Review</p>
              <p className="text-xl font-bold text-slate-900 leading-none mt-0.5">{list.length}</p>
            </div>
          </div>
          <button onClick={handleNewPost} className={`${BTN_PRIMARY} rounded-lg py-2.5`}>
            <Plus size={14} strokeWidth={3} />
            <span>New Property</span>
          </button>
        </div>
      </div>

      {/* Enhanced Property Repository Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Integrated Filter Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex-1 w-full md:max-w-md relative group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
            />
            <input
              className={`${PF_INPUT} pl-11 rounded-lg shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20`}
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
                className={`${PF_SELECT} rounded-lg focus:ring-4 focus:ring-primary/5 focus:border-primary/20`}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list}
          loading={loading}
          emptyMessage="No pending properties found"
          emptyIcon={Building2}
          onRowClick={(prop) => {
            navigate(`/profile/property-details/${prop._id}`);
          }}
        />
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
