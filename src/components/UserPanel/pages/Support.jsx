import {
  useVendorSupportStore,
  fetchVendorSupportTickets,
  createVendorSupportTicket,
  setStatusFilter,
  setPriorityFilter,
  setSearchFilter,
  setPage,
} from '../../../store/vendorSupportStore';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Badge from '../../vendor/components/ui/Badge';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Activity,
  Timer,
  X,
  Plus,
} from 'lucide-react';
import Select from '../../vendor/components/ui/Select';
import Pagination from '../../vendor/components/ui/Pagination';
import DataTable from '../../vendor/components/ui/DataTable';
import {
  vpPage,
  vpHeader,
  vpHeaderTitle,
  vpHeaderSubtitle,
  vpStatGrid,
  vpStatCard,
  vpStatIcon,
  vpStatLabel,
  vpStatValue,
  vpPanel,
  vpPanelToolbar,
  vpPanelFooter,
  vpSearchWrap,
  vpSearchIcon,
  vpSearchInput,
  vpSelect,
  vpToolbarFilters,
  vpActionBtn,
  vpModalOverlay,
  vpModal,
  vpModalHeader,
  vpModalBody,
  vpModalFooter,
  upBtnPrimary,
  upBtnSecondary,
  upLabel,
  upInput,
  upTextarea,
} from '../userPanelStyles';

export default function Support() {
  const navigate = useNavigate();
  const tickets = useVendorSupportStore((s) => s.tickets);
  const { statusFilter, priorityFilter, categoryFilter, searchFilter, pagination } =
    useVendorSupportStore(
      useShallow((s) => ({
        statusFilter: s.statusFilter,
        priorityFilter: s.priorityFilter,
        categoryFilter: s.categoryFilter,
        searchFilter: s.searchFilter,
        pagination: s.pagination,
      }))
    );
  const stats = useVendorSupportStore((s) => s.stats);
  const loading = useVendorSupportStore((s) => s.loading);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Technical Support',
    priority: 'Medium',
    description: '',
  });

  const ticketStatusClass = (status) => {
    const label = getStatusDisplay(status);
    if (label === 'Open') return 'data-table__status--pending';
    if (label === 'In Progress') return 'data-table__status--pending';
    if (label === 'Resolved') return 'data-table__status--verified';
    return '';
  };

  const tableColumns = [
    {
      header: 'Subject',
      accessor: 'subject',
      cell: (ticket) => (
        <div className="max-w-[220px] truncate text-sm font-semibold text-slate-800" title={ticket.subject}>
          {ticket.subject}
        </div>
      ),
    },
    {
      header: 'Ticket ID',
      accessor: '_id',
      cell: (ticket) => (
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          #{ticket._id?.slice(-6) || ticket.id}
        </span>
      ),
    },
    {
      header: 'User',
      accessor: 'userId',
      cell: (ticket) => (
        <span className="text-sm font-medium text-slate-700">
          {ticket.userId?.name || 'Unknown User'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (ticket) => <span className="text-sm capitalize text-slate-700">{ticket.category}</span>,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      cell: (ticket) => (
        <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (ticket) => (
        <span className={`capitalize text-sm font-semibold ${ticketStatusClass(ticket.status)}`}>
          {getStatusDisplay(ticket.status)}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (ticket) => (
        <span className="text-sm font-medium text-slate-600 tabular-nums">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-center',
      cell: (ticket) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/support/${ticket._id}`);
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

  const statsArray = [
    {
      id: 1,
      label: 'Open Tickets',
      value: stats.open || 0,
      Icon: AlertCircle,
    },
    {
      id: 2,
      label: 'In Progress',
      value: stats.inProgress || 0,
      Icon: Activity,
    },
    {
      id: 3,
      label: 'Resolved Today',
      value: stats.resolvedToday || 0,
      Icon: CheckCircle2,
    },
    {
      id: 4,
      label: 'Avg Response Time',
      value: stats.avgResponseTime || '0.0h',
      Icon: Timer,
    },
  ];

  useEffect(() => {
    fetchVendorSupportTickets({
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
      search: searchFilter,
      page: pagination.current,
      limit: 10,
    });
  }, [statusFilter, priorityFilter, categoryFilter, searchFilter, pagination.current]);

  const handleCreateTicket = async () => {
    if (newTicket.subject && newTicket.description) {
      await createVendorSupportTicket(newTicket);
      setShowNewTicketModal(false);
      setNewTicket({
        subject: '',
        category: 'Technical Support',
        priority: 'Medium',
        description: '',
      });
      fetchVendorSupportTickets({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        search: searchFilter,
        page: pagination.current,
        limit: 10,
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return 'red';
      case 'Medium':
        return 'amber';
      case 'Low':
        return 'blue';
      default:
        return 'slate';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In Progress';
      case 'closed':
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <div className={vpPage}>
      <div className={vpHeader}>
        <div>
          <h2 className={vpHeaderTitle}>Support Overview</h2>
          <p className={vpHeaderSubtitle}>Track and manage your support tickets</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewTicketModal(true)}
          className={`${upBtnPrimary} inline-flex items-center gap-2 min-w-0`}
        >
          <Plus size={14} strokeWidth={2.5} />
          New Ticket
        </button>
      </div>

      <div className={vpStatGrid}>
        {statsArray.map((stat) => (
          <div key={stat.id} className={vpStatCard}>
            <div className={vpStatIcon}>
              <stat.Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className={vpStatLabel}>{stat.label}</p>
              <p className={vpStatValue}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={vpPanel}>
        <div className={vpPanelToolbar}>
          <div className={vpSearchWrap}>
            <Search size={14} className={vpSearchIcon} />
            <input
              className={vpSearchInput}
              placeholder="Search tickets by subject, ID or user..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <div className={vpToolbarFilters}>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={['All', 'High', 'Medium', 'Low']}
              className={vpSelect}
              placeholder="Priority"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={['All', 'Open', 'In Progress', 'Closed']}
              className={vpSelect}
              placeholder="Status"
            />
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          data={tickets}
          loading={loading}
          emptyMessage="No support tickets found"
          onRowClick={(ticket) => navigate(`/profile/support/${ticket._id}`)}
        />

        <div className={vpPanelFooter}>
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.total}
            onPageChange={(page) => setPage(page)}
            totalItems={pagination.count}
            pageSize={10}
          />
        </div>
      </div>

      {showNewTicketModal && (
        <div className={vpModalOverlay} role="dialog" aria-modal="true">
          <div className={vpModal}>
            <div className={vpModalHeader}>
              <div>
                <h3 className={vpHeaderTitle}>New Support Ticket</h3>
                <p className={vpHeaderSubtitle}>Describe your issue and we will get back to you</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className={vpActionBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={vpModalBody}>
              <div>
                <label className={upLabel} htmlFor="ticket-subject">
                  Subject
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className={`${upInput} mt-1.5`}
                  placeholder="Enter ticket subject"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={upLabel} htmlFor="ticket-category">
                    Category
                  </label>
                  <select
                    id="ticket-category"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className={`${upInput} mt-1.5 appearance-none cursor-pointer`}
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Payment/Subscription">Payment/Subscription</option>
                    <option value="Account/Profile">Account/Profile</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={upLabel} htmlFor="ticket-priority">
                    Priority
                  </label>
                  <select
                    id="ticket-priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className={`${upInput} mt-1.5 appearance-none cursor-pointer`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={upLabel} htmlFor="ticket-description">
                  Description
                </label>
                <textarea
                  id="ticket-description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className={`${upTextarea} mt-1.5 min-h-[120px]`}
                  rows={4}
                  placeholder="Describe your issue in detail"
                />
              </div>
            </div>

            <div className={vpModalFooter}>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className={`${upBtnSecondary} flex-1`}
              >
                Cancel
              </button>
              <button type="button" onClick={handleCreateTicket} className={`${upBtnPrimary} flex-1`}>
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
