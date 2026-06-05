/** Tailwind class bundles for User Panel (no separate CSS — avoids clash with global .form-input) */

export const upCard = 'bg-white border border-slate-100 rounded-md p-6 sm:p-7 mb-6 shadow-sm';

export const upTitle = 'text-lg font-semibold text-slate-900 tracking-tight mb-1';

export const upSubtitle = 'text-sm font-medium text-slate-500 mb-6';

export const upSection = 'flex items-center gap-3 mb-5';

export const upSectionAccent = 'w-[3px] h-[18px] bg-gold rounded-full shrink-0';

export const upSectionTitle =
  'text-xs font-semibold text-slate-900 uppercase tracking-wider whitespace-nowrap';

export const upSectionLine = 'flex-1 h-px bg-slate-100';

export const upFieldGrid = 'grid grid-cols-1 md:grid-cols-3 gap-4';

export const upFieldGrid2 = 'grid grid-cols-1 sm:grid-cols-2 gap-4';

export const upField = 'flex flex-col gap-1.5';

export const upFieldFull = 'flex flex-col gap-1.5 sm:col-span-2';

export const upLabel = 'text-xs font-semibold text-slate-500 uppercase tracking-wider';

export const upLabelRequired = 'text-rose-500 normal-case font-bold';

export const upLabelHint = 'normal-case font-medium text-slate-400';

/** Same focus ring as SupportPanel inputs */
export const upInput =
  'w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

export const upInputError =
  'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15';

export const upInputDisabled =
  'w-full px-3 py-2 border border-slate-300 rounded-sm text-sm font-normal text-slate-500 bg-slate-50 cursor-not-allowed outline-none';

export const upTextarea = `${upInput} min-h-[88px] resize-y`;

export const upDropdown =
  'absolute top-full left-0 w-full mt-1 bg-white border border-slate-300 rounded-sm shadow-md z-[200] max-h-[180px] overflow-y-auto';

export const upDropdownItem =
  'w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 border-0 bg-transparent cursor-pointer block truncate border-b border-slate-100 last:border-0 hover:bg-gold-50';

export const upAvatar =
  'w-16 h-16 rounded-sm bg-gold-50 border border-gold-500/20 flex items-center justify-center text-2xl font-semibold text-gold-600 shrink-0 relative cursor-pointer overflow-hidden group/avatar';

export const upAvatarOverlay =
  'absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200';

export const upBtnPrimary =
  'inline-flex items-center justify-center min-w-[140px] px-5 py-2 rounded-sm text-sm font-semibold bg-primary text-white transition-colors hover:bg-primary-dark cursor-pointer';

export const upBtnSecondary =
  'inline-flex items-center justify-center px-5 py-2 rounded-sm text-sm font-semibold bg-transparent border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer';

export const upBtnDanger =
  'inline-flex items-center justify-center px-5 py-2 rounded-sm text-sm font-semibold bg-white border border-rose-200 text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

export const upDivider = 'h-px bg-slate-100 my-5';

// ── BRAND COLOR PALETTE & CENTRALIZED THEME CLASSES ──

// Generic Auth/Login
export const upBtnLogin = 'px-5 py-2.5 rounded-lg font-semibold bg-primary text-white transition-all hover:bg-primary-dark';

// Mobile Header & Tabs
export const upMobileHeaderAvatar = 'w-14 h-14 rounded-full bg-gold-50 border border-gold-500/20 flex items-center justify-center text-gold-700 overflow-hidden shrink-0';
export const upMobileTabContainer = 'flex bg-slate-100/80 p-1 rounded-2xl gap-1 shadow-inner border border-slate-200/40';
export const upMobileTabActive = 'bg-white text-primary shadow-[0_4px_16px_rgba(0,0,0,0.06)] border-none';
export const upMobileTabInactive = 'text-slate-500 hover:text-slate-900 border-none bg-transparent';
export const upMobileTabIconActive = 'text-primary scale-110';
export const upMobileTabIconInactive = 'text-slate-400 group-hover:scale-110';
export const upMobileTabBadgeActive = 'bg-primary text-white';
export const upMobileTabBadgeInactive = 'bg-slate-200 text-slate-600';
export const upMobileTabIndicator = 'absolute bottom-1 w-5 h-1 bg-gold rounded-full';

// Sidebar
export const upSidebarContainer = 'bg-white border border-slate-200/60 rounded-[20px] overflow-hidden sticky top-[90px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:block hidden';
export const upSidebarAvatar = 'w-[76px] h-[76px] rounded-full bg-gold-50 border border-gold-500/20 flex items-center justify-center text-[1.8rem] font-semibold text-gold-700 mx-auto mb-4 overflow-hidden shadow-sm';
export const upSidebarItemActive = 'flex items-center gap-3.5 p-[11px_16px] rounded-xl text-[0.92rem] transition-all duration-300 border-none w-full text-left cursor-pointer bg-gradient-to-r from-primary-50 to-primary-light/10 text-primary font-bold border-l-4 border-primary pl-[12px]';
export const upSidebarItemInactive = 'flex items-center gap-3.5 p-[11px_16px] rounded-xl text-[0.92rem] font-medium transition-all duration-300 border-none w-full text-left cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 pl-[16px]';
export const upSidebarIconActive = 'text-primary scale-110';
export const upSidebarIconInactive = 'text-slate-400 group-hover/item:text-slate-900 group-hover/item:scale-110';
export const upSidebarBadgeActive = 'bg-primary text-white';
export const upSidebarBadgeInactive = 'bg-slate-100 text-slate-500 group-hover/item:bg-slate-200';
export const upSidebarLogoutBtn = 'flex items-center gap-3.5 p-[11px_16px] rounded-xl text-[0.92rem] font-semibold transition-all duration-300 border-none w-full text-left cursor-pointer text-rose-600 hover:bg-rose-50/60 pl-[16px] group/logout';
export const upSidebarLogoutIcon = 'text-rose-500 group-hover/logout:translate-x-0.5 transition-transform duration-200';

// Overview
export const upOverviewIconActive = 'bg-gold-50 text-gold-500';

// FavouritesPanel
export const upLoadingSpinner = 'w-10 h-10 border-4 border-gold-100 border-t-gold-500 rounded-full animate-spin mb-4';
export const upExploreButton = 'px-8 py-3 bg-[#0f172a] text-white rounded-xl font-semibold hover:bg-primary transition-all shadow-lg shadow-slate-200';
export const upFavCardContainer = 'group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-gold-200 transition-all duration-300 cursor-pointer flex flex-col';
export const upFavCardTitle = 'text-[0.95rem] font-semibold text-slate-900 mb-1 line-clamp-1 leading-tight group-hover:text-gold-600 transition-colors';
export const upFavCardPrice = 'text-[1.1rem] font-bold text-slate-900 leading-none';
export const upFavCardArrow = 'w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all';

// MessagesPanel
export const upChatUnreadBg = 'bg-gold-50/30';
export const upChatAvatar = 'w-10 h-10 rounded-full bg-gold-50 border border-gold-500/20 flex items-center justify-center text-gold-600 font-semibold shrink-0';
export const upChatActiveHeaderAvatar = 'w-[38px] h-[38px] rounded-full bg-gold-50 border border-gold-500/20 flex items-center justify-center text-[1rem] font-semibold text-gold-600 shrink-0';
export const upChatBubbleUser = 'p-[12px_18px] bg-primary text-white rounded-[18px_18px_4px_18px] text-[0.92rem] leading-[1.5] shadow-[0_4px_12px_rgba(2,53,38,0.15)]';
export const upChatInput = 'flex-1 p-[11px_16px] bg-slate-50 border border-slate-200 rounded-xl text-[0.9rem] outline-none transition-all focus:bg-white focus:border-primary';
export const upChatSendBtn = 'w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-lg shadow-primary/20 active:scale-95';

// NotificationsPanel
export const upNotifUnread = 'bg-gold-50/40 border-gold-100/50';
export const upNotifDot = 'bg-gold shadow-[0_0_8px_rgba(197,168,128,0.5)]';
export const upNotifIconUnread = 'bg-white border-gold-200 text-gold-500';

// SupportPanel
export const upSupportInputFocus = 'focus:border-primary focus:shadow-[0_0_0_3px_rgba(2,53,38,0.1)]';
export const upSupportSubmitBtn = 'px-5 py-2.5 rounded-lg font-semibold text-[0.88rem] bg-primary text-white transition-all hover:bg-primary-dark cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed';
export const upSupportBubbleUser = 'p-[12px_18px] rounded-[18px_18px_4px_18px] text-[0.92rem] leading-[1.5] shadow-sm bg-primary text-white shadow-[0_4px_12px_rgba(2,53,38,0.15)]';
export const upSupportChatInput = 'flex-1 p-[11px_16px] bg-slate-50 border border-slate-200 rounded-xl text-[0.9rem] outline-none transition-all focus:bg-white focus:border-primary';
export const upSupportChatSendBtn = 'w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/20';
export const upSupportRaiseBtn = 'px-4 py-2.5 rounded-lg font-semibold text-[0.88rem] bg-primary text-white transition-all hover:bg-primary-dark cursor-pointer shadow-sm';
export const upSupportBadgeOpen = 'bg-gold text-white';

// SettingsPanel
export const upSettingsSpinner = 'animate-spin rounded-full h-6 w-6 border-b-2 border-primary';
export const upSettingsLegalActive = 'group-hover:text-gold-600';

// ── Vendor dashboard pages (Transactions, Support, etc.) ──
export const vpPage = 'space-y-4 pb-12 font-sans';

export const vpHeader =
  'flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-4 rounded-md border border-slate-100 shadow-sm gap-4';

export const vpHeaderTitle = 'text-xl font-semibold text-slate-900 leading-none';

export const vpHeaderSubtitle = 'text-sm font-medium text-slate-500 mt-1.5';

export const vpStatGrid = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';

export const vpStatGrid3 = 'grid grid-cols-1 md:grid-cols-3 gap-4';

export const vpStatCard =
  'bg-white border border-slate-100 rounded-md p-5 shadow-sm flex items-center gap-4 hover:border-primary/20 transition-colors';

export const vpStatIcon =
  'w-11 h-11 rounded-sm bg-primary/8 text-primary border border-primary/10 flex items-center justify-center shrink-0';

export const vpStatLabel = 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1';

export const vpStatValue = 'text-2xl font-bold text-slate-900 tabular-nums leading-none';

export const vpStatSub = 'text-xs font-medium text-slate-500 mt-1';

export const vpPanel = 'bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden';

export const vpPanelToolbar =
  'flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/40';

export const vpPanelFooter = 'px-5 py-4 bg-slate-50/40 border-t border-slate-100';

export const vpSearchWrap = 'relative flex-1 min-w-0 w-full group';

export const vpSearchIcon =
  'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors';

export const vpSearchInput = `${upInput} pl-10 min-w-0`;

export const vpSelect =
  'px-3 py-2.5 border border-slate-300 rounded-sm text-sm font-medium text-slate-900 bg-white outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none cursor-pointer w-full sm:w-[160px] sm:shrink-0';

export const vpToolbarFilters =
  'flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:shrink-0';

export const vpEmpty = 'px-6 py-16 text-center';

export const vpEmptyIcon =
  'w-14 h-14 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300';

export const vpActionBtn =
  'w-8 h-8 rounded-sm inline-flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors';

export const vpModalOverlay =
  'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm';

export const vpModal = 'bg-white rounded-md border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden';

export const vpModalHeader =
  'px-6 py-4 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50/40';

export const vpModalBody = 'p-6 space-y-4';

export const vpModalFooter = 'flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/40';

export const vpDetailLabel = 'text-xs font-semibold text-slate-500 uppercase tracking-wider';

export const vpDetailValue = 'text-sm font-semibold text-slate-900';

export const vpDetailMuted = 'text-xs font-medium text-slate-500';

export const vpStatusCompleted =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200';

export const vpStatusPending =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200';

export const vpStatusFailed =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-semibold bg-rose-50 text-rose-700 border-rose-200';

export const vpInfoBox = 'rounded-md border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600 leading-relaxed';

// Property details page
export const vpPropMedia =
  'relative rounded-md overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-100 group';

export const vpPropThumb =
  'relative w-[88px] h-14 shrink-0 rounded-sm overflow-hidden border-2 cursor-pointer transition-all';

export const vpPropThumbActive = 'border-primary ring-2 ring-primary/15 scale-[1.02]';

export const vpPropThumbInactive = 'border-slate-200 hover:border-primary/30';

export const vpPropSectionHead =
  'flex items-center gap-2 text-sm font-semibold text-slate-900 pb-3 mb-4 border-b border-slate-100';

export const vpPropSpecRow =
  'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-2.5 border-b border-slate-50 last:border-0';

export const vpPropAlert =
  'rounded-md border px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4';

