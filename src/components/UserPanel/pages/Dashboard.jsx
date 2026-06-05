import { useDashboardStore, fetchDashboardStats } from '../../../store/dashboardStore';
import { useTransactionsStore, fetchTransactionHistory } from '../../../store/transactionsStore';
import { useVendorProductsStore, fetchProducts } from '../../../store/vendorProductsStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../vendor/components/ui/StatCard';
import Skeleton from '../../vendor/components/ui/Skeleton';
import DataTable from '../../vendor/components/ui/DataTable';
import { TrendingUp, Building2, Clock, CreditCard, MapPin, Plus } from 'lucide-react';
import { BTN_PRIMARY } from '../../vendor/components/ui/property-form/formFieldClasses';
import useNewPropertyAction from '../../vendor/hooks/useNewPropertyAction';
import PropertyPostModals from '../../vendor/components/PropertyPostModals';

const propertyStatusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === 'verified') return 'data-table__status--verified';
  if (s === 'processing' || s === 'pending') return 'data-table__status--pending';
  if (s === 'rejected') return 'data-table__status--rejected';
  if (s === 'draft') return 'data-table__status--draft';
  return '';
};

const paymentStatusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === 'success') return 'data-table__status--verified';
  if (s === 'pending') return 'data-table__status--pending';
  return 'data-table__status--rejected';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const kpis = useDashboardStore((s) => s.kpis) ?? [];
  const dashboardLoading = useDashboardStore((s) => s.loading);

  const transactions = useTransactionsStore((s) => s.list) ?? [];
  const transactionsLoading = useTransactionsStore((s) => s.loading);
  const properties = useVendorProductsStore((s) => s.list) ?? [];
  const propertiesLoading = useVendorProductsStore((s) => s.loading);

  const isLoading = dashboardLoading || transactionsLoading || propertiesLoading;

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

  useEffect(() => {
    fetchTransactionHistory({ limit: 5 });
    fetchDashboardStats();
    fetchProducts({ limit: 5 });
  }, []);

  const propertyColumns = [
    {
      header: 'Property',
      cell: (prop) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {prop.media?.poster ? (
              <img src={prop.media.poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={18} className="text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate max-w-[200px]">{prop.projectName}</p>
            <p className="data-table__sub text-slate-400 mt-0.5">Ref: PR-{prop._id?.slice(-6)}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      className: 'text-center',
      cell: (prop) => (
        <div className="flex items-center justify-center gap-1.5">
          <MapPin size={14} className="text-primary/50 shrink-0" />
          <span>{prop.address?.city || prop.address?.addressLine1 || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      className: 'text-center',
      cell: (prop) => (
        <span className={`capitalize ${propertyStatusClass(prop.status)}`}>{prop.status}</span>
      ),
    },
    {
      header: 'Views',
      className: 'text-right',
      cell: (prop) => (
        <div className="flex flex-col items-end">
          <span className="tabular-nums font-semibold text-slate-800">
            {prop.viewCount || prop.views || 0}
          </span>
          <span className="data-table__sub text-emerald-600 flex items-center gap-1 mt-0.5">
            <TrendingUp size={12} /> views
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 leading-none">Seller dashboard</h2>
          <p className="text-md text-slate-500 mt-1.5 font-medium">
            Live analytics and property portfolio overview
          </p>
        </div>
        <button type="button" className={BTN_PRIMARY} onClick={handleNewPost}>
          <Plus size={14} strokeWidth={3} />
          <span>New property</span>
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex justify-between">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                  <Skeleton className="w-24 h-6" />
                  <Skeleton className="w-full h-4" />
                </div>
              ))
          : kpis.map((kpi) => <StatCard key={kpi.id} {...kpi} />)}
      </div>

      {/* Main row */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <Skeleton className="w-32 h-6" />
            <div className="space-y-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-2/3 h-3" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <Skeleton className="w-40 h-6" />
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="w-full h-12" />
              ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent transactions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-md font-semibold text-slate-900 leading-none">
                  Recent transactions
                </h3>
                <p className="text-md text-slate-500 font-medium mt-1.5">
                  Latest subscription payments
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/profile/subscriptions#sub-history')}
                className="text-md font-semibold text-primary hover:underline shrink-0"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[450px] custom-scrollbar flex-1">
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <div
                    key={txn._id}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/70 transition-all group cursor-pointer"
                    onClick={() => navigate('/profile/subscriptions#sub-history')}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && navigate('/profile/subscriptions#sub-history')
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <div className="w-9 h-9 rounded-md bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-md font-semibold text-slate-800 truncate">
                          {txn.paymentMethod || 'Subscription payment'}
                        </p>
                        <span className="text-md font-semibold text-slate-900 tabular-nums shrink-0">
                          ₹{txn.price?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-md font-medium text-slate-500">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <span
                          className={`text-md font-semibold capitalize shrink-0 ${paymentStatusClass(txn.paymentStatus)}`}
                        >
                          {txn.paymentStatus === 'success' ? 'Completed' : txn.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                    <CreditCard size={20} />
                  </div>
                  <p className="text-md font-semibold text-slate-600">No transactions</p>
                  <p className="text-md text-slate-500 font-medium mt-1">
                    Your payment history will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Property performance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-md font-semibold text-slate-900 leading-none">
                  Property performance
                </h3>
                <p className="text-md text-slate-500 font-medium mt-1.5">
                  Recent listings and engagement
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/profile/properties')}
                className="text-md font-semibold text-primary hover:underline shrink-0"
              >
                View all
              </button>
            </div>
            <DataTable
              columns={propertyColumns}
              data={properties.slice(0, 5)}
              loading={propertiesLoading}
              emptyMessage="No properties yet"
              emptyIcon={Building2}
              onRowClick={(prop) => navigate(`/profile/property-details/${prop._id}`)}
            />
          </div>
        </div>
      )}

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
