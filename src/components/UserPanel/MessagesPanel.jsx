import React from 'react';
import { useUserPanelStore } from '../../store/userPanelStore';
import {
  upChatUnreadBg,
  upChatAvatar,
  upChatActiveHeaderAvatar,
  upChatBubbleUser,
  upChatInput,
  upChatSendBtn,
} from './userPanelStyles';

export default function MessagesPanel() {
  const chats = useUserPanelStore((s) => s.chats);

  return (
    <div className="bg-white border border-slate-100 rounded-[16px] overflow-hidden mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex h-[600px]">
      {/* Sidebar List */}
      <div className="w-[300px] border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-[18px_24px] border-b border-slate-100 bg-white">
          <h3 className="text-[1.1rem] font-semibold text-slate-900 m-0">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto bg-white">
          {chats.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-4 p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${c.unread ? upChatUnreadBg : ''}`}
            >
              <div className={upChatAvatar}>
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[0.9rem] font-semibold text-slate-900 truncate">
                    {c.name}
                  </span>
                  <span className="text-[0.7rem] font-medium text-slate-400 whitespace-nowrap ml-2">
                    {c.time}
                  </span>
                </div>
                <p className="text-[0.82rem] text-slate-500 truncate m-0">{c.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fcfcfd]">
        <div className="p-[18px_24px] border-b border-slate-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className={upChatActiveHeaderAvatar}>
              P
            </div>
            <div>
              <strong className="block text-[0.95rem] font-semibold text-slate-900 leading-tight">
                Priya Sharma
              </strong>
              <div className="text-[0.75rem] text-emerald-500 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          <div className="max-w-[80%] self-end flex flex-col items-end gap-1.5">
            <div className={upChatBubbleUser}>
              Hi Priya, I saw your enquiry for the Powai apartment.
            </div>
            <div className="text-[0.7rem] font-semibold text-slate-400 mr-1 pb-1">11:05 AM</div>
          </div>
          <div className="max-w-[80%] self-start flex flex-col gap-1.5">
            <div className="p-[12px_18px] bg-white border border-slate-100 rounded-[4px_18px_18px_18px] text-[0.92rem] text-slate-700 leading-[1.5] shadow-sm">
              Is the price negotiable? I am very interested.
            </div>
            <div className="text-[0.7rem] font-semibold text-slate-400 ml-1">11:10 AM</div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <input
            type="text"
            className={upChatInput}
            placeholder="Type a message..."
          />
          <button className={upChatSendBtn}>
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
          </button>
        </div>
      </div>
    </div>
  );
}
