import React, { useState, useEffect, useRef } from 'react';
import {
  useSupportStore,
  createSupportTicket,
  fetchSupportTickets,
  setCurrentTicket,
  sendSupportMessage,
} from '../../store/supportStore';
import {
  upSupportInputFocus,
  upSupportSubmitBtn,
  upSupportBubbleUser,
  upSupportChatInput,
  upSupportChatSendBtn,
  upSupportRaiseBtn,
  upSupportBadgeOpen,
} from './userPanelStyles';

export default function SupportPanel() {
  const tickets = useSupportStore((s) => s.tickets);
  const currentTicket = useSupportStore((s) => s.currentTicket);
  const loading = useSupportStore((s) => s.loading);
  const error = useSupportStore((s) => s.error);
  const categories = useSupportStore((s) => s.categories);
  const priorities = useSupportStore((s) => s.priorities);
  const [view, setView] = useState('list'); // 'list', 'form', or 'chat'
  const [formData, setFormData] = useState({
    subject: '',
    category: categories[0] || 'Technical Support',
    priority: priorities[1] || 'Medium',
    description: '',
  });
  const messageInputRef = useRef(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const handleSendMessage = async () => {
    if (!messageInputRef.current?.value.trim() || !currentTicket) return;

    try {
      setSendingMessage(true);
      const message = messageInputRef.current.value.trim();
      await sendSupportMessage({
        ticketId: currentTicket._id,
        message,
      });

      messageInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (view === 'form') {
    return (
      <div className="bg-white border border-slate-100 rounded-[16px] p-[28px_32px] mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[1.15rem] font-semibold text-slate-900 mb-1.5 tracking-tight">
              Raise New Ticket
            </div>
            <div className="text-[0.88rem] text-slate-500">
              Explain your issue and we'll get back to you
            </div>
          </div>
          <button
            className="px-3.5 py-2 rounded-lg font-semibold text-[0.85rem] border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            onClick={() => setView('list')}
          >
            Back to Tickets
          </button>
        </div>

        <form
          id="support-form"
          onSubmit={(e) => {
            e.preventDefault();
            const ticketData = {
              subject: formData.subject,
              category: formData.category,
              priority: formData.priority,
              description: formData.description,
            };
            createSupportTicket(ticketData)
              .then((result) => {
                if (result.success) {
                  setFormData({
                    subject: '',
                    category: categories[0] || 'Technical Support',
                    priority: priorities[1] || 'Medium',
                    description: '',
                  });
                  setView('list');
                } else {
                  console.error('Ticket creation failed:', result.message);
                  alert('Failed to create ticket: ' + result.message);
                }
              })
              .catch((error) => {
                console.error('Ticket creation error:', error);
                alert('Failed to create ticket. Please try again.');
              });
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[0.75rem] font-semibold text-slate-500 uppercase tracking-widest">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief summary of issue"
              className={`p-[11px_14px] border border-slate-200 rounded-lg text-[0.9rem] text-slate-900 outline-none transition-all ${upSupportInputFocus}`}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[0.75rem] font-semibold text-slate-500 uppercase tracking-widest">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`p-[11px_14px] border border-slate-200 rounded-lg text-[0.9rem] text-slate-900 outline-none transition-all bg-white ${upSupportInputFocus}`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[0.75rem] font-semibold text-slate-500 uppercase tracking-widest">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className={`p-[11px_14px] border border-slate-200 rounded-lg text-[0.9rem] text-slate-900 outline-none transition-all bg-white ${upSupportInputFocus}`}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[0.75rem] font-semibold text-slate-500 uppercase tracking-widest">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe problem in detail..."
              className={`p-[11px_14px] border border-slate-200 rounded-lg text-[0.9rem] text-slate-900 outline-none transition-all min-h-[120px] resize-vertical ${upSupportInputFocus}`}
              required
            />
          </div>
        </form>

        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            form="support-form"
            className={upSupportSubmitBtn}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg font-semibold text-[0.88rem] bg-transparent border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            onClick={() => setView('list')}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (view === 'chat' && currentTicket) {
    return (
      <div className="bg-white border border-slate-100 rounded-[16px] overflow-hidden mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col h-[600px]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-md bg-blue-500 text-white uppercase tracking-wider">
                {currentTicket._id?.slice(-4).toUpperCase()}
              </span>
              <strong className="text-[1rem] font-semibold text-slate-900 leading-tight">
                {currentTicket.subject}
              </strong>
            </div>
            <div className="text-[0.82rem] text-slate-500">
              {currentTicket.category} · Status: {currentTicket.status}
            </div>
          </div>
          <button
            className="px-3.5 py-2 rounded-lg font-semibold text-[0.8rem] border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            onClick={() => setView('list')}
          >
            Back to List
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#fcfcfd]">
          {currentTicket.messages?.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] flex flex-col gap-1.5 ${msg.sender === 'user' ? 'self-end items-end' : 'self-start'}`}
            >
              <div
                className={msg.sender === 'user' ? upSupportBubbleUser : 'p-[12px_18px] bg-white border border-slate-100 rounded-[4px_18px_18px_18px] text-[0.92rem] text-slate-700 leading-[1.5] shadow-sm'}
              >
                {msg.content}
              </div>
              <div
                className={`text-[0.7rem] font-semibold text-slate-400 ${msg.sender === 'user' ? 'mr-1' : 'ml-1'}`}
              >
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <input
            ref={messageInputRef}
            type="text"
            className={upSupportChatInput}
            placeholder="Type your message..."
            disabled={sendingMessage}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !sendingMessage) {
                handleSendMessage();
              }
            }}
          />
          <button
            className={`${upSupportChatSendBtn} ${sendingMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSendMessage}
            disabled={sendingMessage}
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-[16px] p-[28px_32px] mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[1.15rem] font-semibold text-slate-900 mb-1.5 tracking-tight">
            Support Tickets
          </div>
          <div className="text-[0.88rem] text-slate-500">
            Manage your raised issues and enquiries
          </div>
        </div>
        <button
          className={upSupportRaiseBtn}
          onClick={() => setView('form')}
        >
          + Raise New Ticket
        </button>
      </div>

      <div className="overflow-x-auto mt-4 -mx-1 px-1">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="text-left border-b border-slate-100">
              <th className="p-[12px_16px] text-[0.75rem] font-semibold text-slate-400 uppercase tracking-widest">
                Ticket ID
              </th>
              <th className="p-[12px_16px] text-[0.75rem] font-semibold text-slate-400 uppercase tracking-widest">
                Subject
              </th>
              <th className="p-[12px_16px] text-[0.75rem] font-semibold text-slate-400 uppercase tracking-widest">
                Category
              </th>
              <th className="p-[12px_16px] text-[0.75rem] font-semibold text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="p-[12px_16px] text-[0.75rem] font-semibold text-slate-400 uppercase tracking-widest text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t, i) => (
              <tr key={t._id} className="border-b border-slate-100 last:border-none group">
                <td className="p-4 font-semibold text-[0.85rem] text-slate-500 italic">
                  {t._id?.slice(-4).toUpperCase()}
                </td>
                <td className="p-4">
                  <div className="font-semibold text-slate-900 text-[0.88rem] mb-0.5 leading-tight">
                    {t.subject}
                  </div>
                  <div className="text-[0.75rem] text-slate-400 font-medium">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[0.8rem] text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {t.category}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block text-[0.65rem] font-semibold uppercase tracking-wider p-[3px_10px] rounded-full shadow-sm
                    ${t.status === 'Resolved' ? 'bg-emerald-500 text-white' : t.status === 'In Progress' ? 'bg-blue-500 text-white' : `${upSupportBadgeOpen} text-white`}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    className="px-3 py-1.5 rounded-lg font-semibold text-[0.75rem] border border-slate-200 text-slate-600 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 cursor-pointer"
                    onClick={() => {
                      setCurrentTicket(t);
                      setView('chat');
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
