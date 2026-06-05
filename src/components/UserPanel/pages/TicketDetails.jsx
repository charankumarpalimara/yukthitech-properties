import {
  useVendorSupportStore,
  fetchSupportTicketById,
  sendVendorMessage,
  selectCurrentTicket,
  selectVendorLoading,
  selectVendorError,
} from '../../../store/vendorSupportStore';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../../vendor/components/ui/Avatar';
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Send,
  User,
  Shield,
  Calendar,
} from 'lucide-react';

const SECTION_TITLE = 'text-md font-semibold text-slate-600 flex items-center gap-2';
const FIELD_LABEL = 'text-xs font-medium text-slate-500';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reply, setReply] = useState('');

  const ticket = useVendorSupportStore((s) => selectCurrentTicket(s));
  const loading = useVendorSupportStore((s) => selectVendorLoading(s));
  const error = useVendorSupportStore((s) => selectVendorError(s));

  useEffect(() => {
    if (id) {
      fetchSupportTicketById(id);
    }
  }, [id]);

  const handleSendMessage = () => {
    if (reply.trim() && ticket) {
      sendVendorMessage({ ticketId: ticket._id || ticket.id, message: reply });
      setReply('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-border mt-10">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Loading ticket…</h2>
        <p className="text-md text-slate-500 mt-1 font-medium">
          Please wait while we fetch the ticket details.
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-border mt-10">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Ticket not found</h2>
        <p className="text-md text-slate-500 mt-1 font-medium">
          {error || "The support ticket you're looking for doesn't exist."}
        </p>
        <button onClick={() => navigate('/support')} className="mt-6 btn-secondary">
          <ArrowLeft size={14} /> Back to Support
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-slate-50 text-slate-600 border-slate-100';
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Low':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    switch (status) {
      case 'open':
        return <AlertCircle size={14} className="text-blue-500" />;
      case 'in-progress':
        return <Clock size={14} className="text-amber-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      default:
        return null;
    }
  };

  const getStatusDisplay = (status) => {
    if (!status) return 'Unknown';
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 -m-4 lg:-m-6 px-4 lg:px-6">
      {/* Immersive Header Section */}
      <div className="relative h-[240px] bg-slate-900 border-b border-white/5 -mx-4 lg:-mx-6 mb-[-100px] z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pb-20 pt-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile/support')}
              className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white transition-all active:scale-95 group shrink-0"
              aria-label="Back to support"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-none truncate">
                  Ticket #{ticket._id?.slice(-6) || ticket.id || '—'}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${getPriorityColor(ticket.priority)}`}
                >
                  {ticket.priority || 'Normal'} priority
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 shrink-0">
                  {getStatusDisplay(ticket.status)}
                </span>
              </div>
              <p className="text-slate-300 text-md font-medium truncate">
                {ticket.subject || 'No subject'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area (LHS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Ticket Description */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className={`${SECTION_TITLE} mb-4`}>
                <Shield size={16} className="text-primary shrink-0" /> Description
              </h3>
              <p className="text-slate-700 text-md leading-relaxed font-medium bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-100">
                {ticket.description || 'No description provided'}
              </p>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-md font-semibold text-slate-600">Conversation</span>
                </div>
                <div className="flex -space-x-2">
                  <Avatar name="Admin" size="xs" className="ring-2 ring-white" />
                  <Avatar
                    name={ticket.userId?.name || 'User'}
                    size="xs"
                    className="ring-2 ring-white"
                  />
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {ticket.messages?.length > 0 ? (
                  ticket.messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={idx}
                        className={`flex ${isAdmin ? 'justify-start' : 'justify-end'} group`}
                      >
                        <div
                          className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isAdmin ? 'items-start' : 'items-end'}`}
                        >
                          <div className={`flex items-center gap-2 mb-1.5 px-1`}>
                            {isAdmin && (
                              <span className="text-xs font-semibold text-primary">Support</span>
                            )}
                            <span className="text-xs font-medium text-slate-400 tabular-nums">
                              {new Date(msg.timestamp || msg.time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {!isAdmin && (
                              <span className="text-xs font-semibold text-slate-600">You</span>
                            )}
                          </div>

                          <div
                            className={`relative px-4 py-3 rounded-xl text-md font-medium leading-relaxed shadow-sm transition-colors ${
                              isAdmin
                                ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50 hover:bg-slate-200/50'
                                : 'bg-primary text-white rounded-tr-none hover:bg-primary/90 shadow-primary/20'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                      <MessageSquare size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-md font-medium">
                      No messages in this conversation yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Modern Reply Area */}
              <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100">
                <div className="relative flex items-end gap-3 bg-white p-2 rounded-[1.5rem] border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-md font-medium py-3 px-4 min-h-[48px] max-h-[120px] resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!reply.trim()}
                    className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center font-medium flex items-center justify-center gap-1.5">
                  <Shield size={12} className="shrink-0" /> Messages are sent to the support team
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Area (RHS) */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Details */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

              <h3 className={`${SECTION_TITLE} mb-4`}>
                <User size={16} className="text-primary shrink-0" /> User details
              </h3>

              <div className="flex flex-col items-center text-center mb-5">
                <Avatar
                  name={ticket.userId?.name || ticket.user || 'User'}
                  size="xl"
                  className="mb-3 ring-4 ring-slate-50"
                />
                <h4 className="text-lg font-semibold text-slate-900 leading-snug mb-0.5">
                  {ticket.userId?.name || ticket.user || 'Unknown user'}
                </h4>
                <p className="text-md font-medium text-slate-500">Ticket submitter</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className={FIELD_LABEL}>Email</p>
                  <p className="text-md font-semibold text-slate-800 flex items-center gap-2 truncate mt-0.5">
                    <Mail size={14} className="text-primary shrink-0" />
                    <span className="truncate">
                      {ticket.userId?.email || ticket.email || 'N/A'}
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className={FIELD_LABEL}>Phone</p>
                  <p className="text-md font-semibold text-slate-800 flex items-center gap-2 mt-0.5">
                    <Phone size={14} className="text-amber-600 shrink-0" />
                    {ticket.userId?.mobile || ticket.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Metadata */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className={`${SECTION_TITLE} mb-4`}>
                <Clock size={16} className="text-primary shrink-0" /> Ticket info
              </h3>

              <div className="space-y-4">
                {[
                  {
                    label: 'Date submitted',
                    value: new Date(
                      ticket.createdAt || ticket.date || Date.now()
                    ).toLocaleDateString(),
                    icon: Calendar,
                  },
                  {
                    label: 'Status',
                    value: getStatusDisplay(ticket.status),
                    icon: () => getStatusIcon(ticket.status),
                  },
                  { label: 'Category', value: ticket.category || 'General', icon: Shield },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      {typeof item.icon === 'function' ? item.icon() : <item.icon size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className={FIELD_LABEL}>{item.label}</p>
                      <p className="text-md font-semibold text-slate-900 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
