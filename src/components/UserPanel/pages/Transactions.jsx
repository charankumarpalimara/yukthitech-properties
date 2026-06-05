import { useState } from 'react';
import {
  Search,
  Download,
  CreditCard,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { transactionsData } from '../../vendor/data/mockData';
import Modal from '../../vendor/components/ui/Modal';
import DataTable from '../../vendor/components/ui/DataTable';
import Pagination from '../../vendor/components/ui/Pagination';
import {
  vpPage,
  vpHeader,
  vpHeaderTitle,
  vpHeaderSubtitle,
  vpStatGrid3,
  vpStatCard,
  vpStatIcon,
  vpStatLabel,
  vpStatValue,
  vpStatSub,
  vpPanel,
  vpPanelToolbar,
  vpPanelFooter,
  vpSearchWrap,
  vpSearchIcon,
  vpSearchInput,
  vpSelect,
  vpToolbarFilters,
  vpActionBtn,
  vpDetailLabel,
  vpDetailValue,
  vpDetailMuted,
  vpStatusCompleted,
  vpStatusPending,
  vpStatusFailed,
  vpInfoBox,
  upBtnSecondary,
} from '../userPanelStyles';

const statusClass = {
  Completed: vpStatusCompleted,
  Pending: vpStatusPending,
  Failed: vpStatusFailed,
};

const statusIcons = {
  Completed: CheckCircle2,
  Pending: Clock,
  Failed: XCircle,
};

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const itemsPerPage = 8;

  const parseAmount = (amt) => Number(amt.replace(/[^0-9.-]+/g, ''));

  const completedTxns = transactionsData.filter((t) => t.status === 'Completed');
  const pendingTxns = transactionsData.filter((t) => t.status === 'Pending');
  const totalRevenue = completedTxns.reduce((acc, t) => acc + parseAmount(t.amount), 0);
  const pendingVolume = pendingTxns.reduce((acc, t) => acc + parseAmount(t.amount), 0);
  const successRate =
    transactionsData.length > 0
      ? ((completedTxns.length / transactionsData.length) * 100).toFixed(1)
      : 0;

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      sub: `${completedTxns.length} successful payments`,
      icon: ArrowUpRight,
    },
    {
      label: 'Pending Volume',
      value: `₹${pendingVolume.toLocaleString()}`,
      sub: `${pendingTxns.length} in queue`,
      icon: Clock,
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      sub: `${transactionsData.length} total transactions`,
      icon: CreditCard,
    },
  ];

  const filteredTransactions = transactionsData.filter((txn) => {
    const matchesSearch =
      txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tableColumns = [
    {
      header: 'ID',
      accessor: 'id',
      cell: (txn) => (
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          #{txn.id.split('-')[1]}
        </span>
      ),
    },
    {
      header: 'Plan',
      accessor: 'type',
      cell: (txn) => <span className="text-sm font-semibold text-slate-800">{txn.type}</span>,
    },
    {
      header: 'Payment',
      accessor: 'method',
      cell: (txn) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
            <CreditCard size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{txn.method}</p>
            <p className="text-xs font-medium text-slate-500">{txn.date}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (txn) => (
        <span className="text-sm font-bold text-slate-900 tabular-nums">{txn.amount}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (txn) => {
        const Icon = statusIcons[txn.status] || AlertCircle;
        return (
          <span className={statusClass[txn.status] || vpStatusPending}>
            <Icon size={12} />
            {txn.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-center',
      cell: (txn) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTxn(txn);
            }}
            className={vpActionBtn}
            title="View details"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={vpPage}>
      <div className={vpHeader}>
        <div>
          <h2 className={vpHeaderTitle}>Transaction History</h2>
          <p className={vpHeaderSubtitle}>Track subscription payments and billing activity</p>
        </div>
        <button type="button" className={`${upBtnSecondary} inline-flex items-center gap-2 min-w-0`}>
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className={vpStatGrid3}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={vpStatCard}>
              <div className={vpStatIcon}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className={vpStatLabel}>{stat.label}</p>
                <p className={vpStatValue}>{stat.value}</p>
                <p className={vpStatSub}>{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={vpPanel}>
        <div className={vpPanelToolbar}>
          <div className={vpSearchWrap}>
            <Search size={14} className={vpSearchIcon} />
            <input
              type="text"
              placeholder="Search by ID or customer name..."
              className={vpSearchInput}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className={vpToolbarFilters}>
            <select
              className={vpSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          data={paginatedTransactions}
          emptyMessage="No matching transactions found"
          emptyIcon={AlertCircle}
          onRowClick={setSelectedTxn}
        />

        {filteredTransactions.length > 0 && (
          <div className={vpPanelFooter}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTransactions.length}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="Transaction Details">
        {selectedTxn && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <p className={vpDetailLabel}>Transaction ID</p>
                <p className={`${vpDetailValue} mt-1`}>{selectedTxn.id}</p>
              </div>
              {(() => {
                const Icon = statusIcons[selectedTxn.status] || AlertCircle;
                return (
                  <span className={statusClass[selectedTxn.status] || vpStatusPending}>
                    <Icon size={12} />
                    {selectedTxn.status}
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className={vpDetailLabel}>Customer</p>
                <p className={`${vpDetailValue} mt-1`}>{selectedTxn.user}</p>
                <p className={`${vpDetailMuted} mt-0.5`}>{selectedTxn.email}</p>
              </div>
              <div>
                <p className={vpDetailLabel}>Amount</p>
                <p className={`${vpDetailValue} mt-1 text-lg tabular-nums`}>{selectedTxn.amount}</p>
              </div>
              <div>
                <p className={vpDetailLabel}>Subscription Plan</p>
                <p className={`${vpDetailValue} mt-1`}>{selectedTxn.type}</p>
              </div>
              <div>
                <p className={vpDetailLabel}>Payment Method</p>
                <p className={`${vpDetailValue} mt-1`}>{selectedTxn.method}</p>
              </div>
            </div>

            <div>
              <p className={vpDetailLabel}>Payment Date</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} className="text-slate-400" />
                <p className={vpDetailValue}>{selectedTxn.date}</p>
              </div>
            </div>

            <div className={vpInfoBox}>
              This record confirms a verified payment on Yukthi Properties. All transactions are
              secured and encrypted.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
