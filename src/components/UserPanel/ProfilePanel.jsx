import {
  useAuthStore,
  updateUserProfile,
  uploadAvatar,
  getMe,
  deleteAccount,
} from '../../store/authStore';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';
import { State, City } from 'country-state-city';
import {
  upCard,
  upSection,
  upSectionAccent,
  upSectionTitle,
  upSectionLine,
  upFieldGrid2,
  upField,
  upFieldFull,
  upLabel,
  upLabelRequired,
  upInput,
  upInputError,
  upTextarea,
  upDropdown,
  upDropdownItem,
  upAvatar,
  upAvatarOverlay,
  upBtnPrimary,
  upBtnSecondary,
  upBtnDanger,
  upDivider,
  vpPage,
  vpHeader,
  vpHeaderTitle,
  vpHeaderSubtitle,
} from './userPanelStyles';

const isSellerRole = (role) => role && role !== 'buyer';

/* ── tiny inline icons ─────────────────────────────────────── */
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
  </svg>
);
const IconMail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);
const IconPhone = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);
const IconBuilding = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const IconMapPin = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);
const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);
const IconHash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-11.625-15 -3.375 19.5m7.875-19.5L11.625 21" />
  </svg>
);
const IconCamera = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);
const IconCity = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
);
const IconWarning = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);
const IconSave = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

/* ── helpers ────────────────────────────────────────────────── */
function RequiredMark() {
  return <span className={upLabelRequired}>*</span>;
}

function FieldLabel({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className={upLabel}>
      {children}
      {required ? <RequiredMark /> : null}
    </label>
  );
}

/** Wraps an input with a left icon and optional right element */
function InputWithIcon({ icon, children, rightEl }) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3.5 text-slate-400 pointer-events-none z-10">{icon}</span>
      {React.cloneElement(children, {
        className: `${children.props.className} pl-10 ${rightEl ? 'pr-10' : ''}`,
      })}
      {rightEl && (
        <span className="absolute right-3.5 text-slate-400 pointer-events-none">{rightEl}</span>
      )}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-0.5">
      <IconWarning />
      {msg}
    </p>
  );
}

function userToForm(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.mobile || user?.phone || '',
    companyName: user?.companyName || '',
    address1: user?.address1 || '',
    state: user?.state || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  };
}

/* ── section header ─────────────────────────────────────────── */
function SectionHeader({ accent = 'gold', icon, title }) {
  const accentColor = accent === 'rose'
    ? 'bg-rose-500'
    : 'bg-gradient-to-b from-amber-400 to-amber-600';
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-[3px] h-5 ${accentColor} rounded-full shrink-0`} />
      {icon && (
        <span className="text-slate-400">{icon}</span>
      )}
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function ProfilePanel() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.type || '';
  const isSeller = isSellerRole(userRole);

  const [form, setForm] = useState(userToForm(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const [stateSearch, setStateSearch] = useState(user?.state || '');
  const [citySearch, setCitySearch] = useState(user?.city || '');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const cityInputRef = useRef(null);

  const statesList = useMemo(() => State.getStatesOfCountry('IN'), []);

  const cityList = useMemo(() => {
    if (!form.state) return [];
    const stateObj = statesList.find(
      (s) =>
        s.name.toLowerCase() === form.state.toLowerCase() ||
        s.isoCode.toLowerCase() === form.state.toLowerCase()
    );
    return stateObj ? City.getCitiesOfState('IN', stateObj.isoCode) : [];
  }, [form.state, statesList]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return statesList;
    return statesList.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [statesList, stateSearch]);

  const filteredCities = useMemo(() => {
    if (!cityList) return [];
    if (!citySearch.trim()) return cityList;
    return cityList.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  }, [cityList, citySearch]);

  const inputClass = (field) =>
    `${upInput}${errors[field] ? ` ${upInputError}` : ''}`;

  const handleSelectState = (selectedState) => {
    setForm((f) => ({ ...f, state: selectedState.name, city: '' }));
    setStateSearch(selectedState.name);
    setCitySearch('');
    setShowStateDropdown(false);
    setShowCityDropdown(true);
    setErrors((e) => ({ ...e, state: '', city: '' }));
    if (cityInputRef.current) {
      setTimeout(() => cityInputRef.current.focus(), 50);
    }
  };

  const handleSelectCity = (cityName) => {
    setForm((f) => ({ ...f, city: cityName }));
    setCitySearch(cityName);
    setShowCityDropdown(false);
    setErrors((e) => ({ ...e, city: '' }));
  };

  const handleStateInputChange = (e) => {
    const val = e.target.value;
    setStateSearch(val);
    setForm((f) => ({ ...f, state: val, city: '' }));
    setCitySearch('');
    setShowStateDropdown(true);
    setErrors((e) => ({ ...e, state: '', city: '' }));
  };

  const handleCityInputChange = (e) => {
    const val = e.target.value;
    setCitySearch(val);
    setForm((f) => ({ ...f, city: val }));
    setShowCityDropdown(true);
    setErrors((e) => ({ ...e, city: '' }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setForm(userToForm(user));
      setStateSearch(user.state || '');
      setCitySearch(user.city || '');
      setErrors({});
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    setUploading(true);
    try {
      await uploadAvatar(file);
      await getMe();
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const next = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name) next.name = 'Full name is required';
    if (!email) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';
    if (!phone) next.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10)))
      next.phone = 'Enter a valid 10-digit mobile number';

    if (isSeller) {
      if (!form.companyName.trim()) next.companyName = 'Company name is required';
      if (!form.address1.trim()) next.address1 = 'Address is required';
      if (!form.state.trim()) next.state = 'State is required';
      if (!form.city.trim()) next.city = 'City is required';
      if (!form.pincode.trim()) next.pincode = 'Pincode is required';
      else if (!/^[1-9]\d{5}$/.test(form.pincode.trim()))
        next.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildProfilePayload = () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      mobile: form.phone.trim(),
    };
    if (isSeller) {
      Object.assign(payload, {
        companyName: form.companyName.trim(),
        address1: form.address1.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
      });
    }
    return payload;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(buildProfilePayload());
      await getMe();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount(deleteReason.trim() || 'Deleted from profile settings');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('fcmToken');
      toast.success('Your account has been deleted');
      setShowDeleteModal(false);
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setForm(userToForm(user));
    setStateSearch(user.state || '');
    setCitySearch(user.city || '');
    setErrors({});
  };

  /* ── initials ─────────────────────────────────────────────── */
  const initials = form.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

  /* ══════════════════════  RENDER  ═══════════════════════════ */
  return (
    <div className={vpPage}>
      {/* ── Page header ── */}
      <div className={vpHeader}>
        <div>
          <h2 className={vpHeaderTitle}>My Profile</h2>
          <p className={vpHeaderSubtitle}>
            {isSeller
              ? 'Manage your contact and business details'
              : 'Manage your personal account details'}
          </p>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.07)] overflow-hidden relative">
        {(saving || deleting) && (
          <Loader fullScreen text={deleting ? 'Deleting account…' : 'Saving profile…'} />
        )}

        {/* ── Avatar / hero strip ── */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 sm:px-8 sm:py-7">
          {/* subtle pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div
              className="relative w-[72px] h-[72px] rounded-xl shrink-0 cursor-pointer group/av overflow-hidden border-2 border-white/20 shadow-lg"
              onClick={handleAvatarClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
              aria-label="Change profile photo"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              {/* hover overlay */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover/av:opacity-100 transition-all duration-200">
                <IconCamera />
                <span className="text-white text-[10px] font-semibold">
                  {uploading ? 'Uploading…' : 'Change'}
                </span>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white truncate leading-tight">
                {form.name || 'Your Name'}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/80 text-xs font-semibold capitalize">
                  {userRole || 'Member'}
                </span>
                {user?.subscription?.status === 'active' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                    ✦ Premium
                  </span>
                )}
              </div>
              <p className="text-white/50 text-xs mt-1.5">
                Click the avatar to change your photo
              </p>
            </div>
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="px-6 py-7 sm:px-8 space-y-8">

          {/* ── Business Details (sellers only) ── */}
          {isSeller && (
            <section>
              <SectionHeader
                icon={<IconBuilding />}
                title="Business Details"
              />
              <div className={upFieldGrid2}>
                {/* Company name */}
                <div className={upField}>
                  <FieldLabel htmlFor="profile-companyName" required>
                    Company / Business Name
                  </FieldLabel>
                  <InputWithIcon icon={<IconBuilding />}>
                    <input
                      id="profile-companyName"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="Registered business name"
                      className={inputClass('companyName')}
                      required
                    />
                  </InputWithIcon>
                  <FieldError msg={errors.companyName} />
                </div>


                {/* State */}
                <div className={`${upField} relative`} ref={stateDropdownRef}>
                  <FieldLabel htmlFor="profile-state" required>State</FieldLabel>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 pointer-events-none z-10">
                      <IconMapPin />
                    </span>
                    <input
                      id="profile-state"
                      type="text"
                      value={stateSearch}
                      onChange={handleStateInputChange}
                      onFocus={() => setShowStateDropdown(true)}
                      onClick={() => setShowStateDropdown(true)}
                      placeholder="Search state…"
                      autoComplete="off"
                      className={`${inputClass('state')} pl-10 pr-10`}
                      required
                    />
                    <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                      <IconChevronDown />
                    </span>
                  </div>
                  <FieldError msg={errors.state} />
                  {showStateDropdown && filteredStates.length > 0 && (
                    <div className={upDropdown}>
                      {filteredStates.map((st) => (
                        <button
                          key={st.isoCode}
                          type="button"
                          onClick={() => handleSelectState(st)}
                          className={upDropdownItem}
                        >
                          {st.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* City */}
                <div className={`${upField} relative`} ref={cityDropdownRef}>
                  <FieldLabel htmlFor="profile-city" required>City</FieldLabel>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 pointer-events-none z-10">
                      <IconCity />
                    </span>
                    <input
                      id="profile-city"
                      ref={cityInputRef}
                      type="text"
                      value={citySearch}
                      onChange={handleCityInputChange}
                      onFocus={() => form.state && setShowCityDropdown(true)}
                      onClick={() => form.state && setShowCityDropdown(true)}
                      placeholder={form.state ? 'Search city…' : 'Select state first'}
                      disabled={!form.state}
                      autoComplete="off"
                      className={`${inputClass('city')} pl-10 pr-10 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400`}
                      required
                    />
                    <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                      <IconChevronDown />
                    </span>
                  </div>
                  <FieldError msg={errors.city} />
                  {showCityDropdown && filteredCities.length > 0 && (
                    <div className={upDropdown}>
                      {filteredCities.map((ct) => (
                        <button
                          key={ct.name}
                          type="button"
                          onClick={() => handleSelectCity(ct.name)}
                          className={upDropdownItem}
                        >
                          {ct.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>


                {/* Address */}
                <div className={upField}>
                  <FieldLabel htmlFor="profile-address1" required>
                    Address Line 1
                  </FieldLabel>
                  <InputWithIcon icon={<IconMapPin />}>
                    <input
                      id="profile-address1"
                      name="address1"
                      value={form.address1}
                      onChange={handleChange}
                      placeholder="Street address, area, landmark"
                      className={inputClass('address1')}
                      required
                    />
                  </InputWithIcon>
                  <FieldError msg={errors.address1} />
                </div>

                {/* Pincode */}
                <div className={upField}>
                  <FieldLabel htmlFor="profile-pincode" required>Pincode</FieldLabel>
                  <InputWithIcon
                    icon={<IconHash />}
                    rightEl={
                      form.pincode.length === 6 && /^[1-9]\d{5}$/.test(form.pincode) ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : null
                    }
                  >
                    <input
                      id="profile-pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={(e) => {
                        // only allow digits
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setForm((f) => ({ ...f, pincode: digits }));
                        // inline validation
                        if (!digits) {
                          setErrors((prev) => ({ ...prev, pincode: 'Pincode is required' }));
                        } else if (digits.length < 6) {
                          setErrors((prev) => ({ ...prev, pincode: 'Pincode must be 6 digits' }));
                        } else if (!/^[1-9]\d{5}$/.test(digits)) {
                          setErrors((prev) => ({ ...prev, pincode: 'Pincode cannot start with 0' }));
                        } else {
                          setErrors((prev) => ({ ...prev, pincode: '' }));
                        }
                      }}
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      inputMode="numeric"
                      className={inputClass('pincode')}
                      required
                    />
                  </InputWithIcon>
                  <FieldError msg={errors.pincode} />
                  {/* character counter */}
                  {form.pincode.length > 0 && form.pincode.length < 6 && !errors.pincode && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      {6 - form.pincode.length} more digit{6 - form.pincode.length !== 1 ? 's' : ''} needed
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── Personal Information ── */}
          <section>
            <SectionHeader
              icon={<IconUser />}
              title="Personal Information"
            />
            <div className={upFieldGrid2}>
              {/* Full name */}
              <div className={upField}>
                <FieldLabel htmlFor="profile-name" required>Full Name</FieldLabel>
                <InputWithIcon icon={<IconUser />}>
                  <input
                    id="profile-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClass('name')}
                    required
                  />
                </InputWithIcon>
                <FieldError msg={errors.name} />
              </div>

              {/* Email */}
              <div className={upField}>
                <FieldLabel htmlFor="profile-email" required>Email Address</FieldLabel>
                <InputWithIcon icon={<IconMail />}>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass('email')}
                    required
                  />
                </InputWithIcon>
                <FieldError msg={errors.email} />
              </div>

              {/* Phone */}
              <div className={upField}>
                <FieldLabel htmlFor="profile-phone" required>Phone Number</FieldLabel>
                <InputWithIcon icon={<IconPhone />}>
                  <input
                    id="profile-phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="numeric"
                    className={inputClass('phone')}
                    required
                  />
                </InputWithIcon>
                <FieldError msg={errors.phone} />
              </div>
            </div>
          </section>

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading || deleting}
              className="inline-flex items-center gap-2 min-w-[140px] justify-center px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <IconSave />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving || deleting}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 disabled:opacity-50"
            >
              Discard Changes
            </button>
          </div>

          {/* ── Danger zone ── */}
          <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-rose-50/20 p-5">
            <SectionHeader accent="rose" icon={<IconTrash />} title="Danger Zone" />
            <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-xl">
              Permanently remove your account, all listings, saved properties, and related data.
              <strong className="text-slate-700 font-semibold"> This action cannot be undone.</strong>
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={saving || uploading || deleting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash />
              Delete my account
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <IconTrash />
              </div>
              <div>
                <h3 id="delete-account-title" className="text-base font-bold text-slate-900">
                  Delete your account?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">This action is permanent and irreversible.</p>
              </div>
            </div>

            {/* modal body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                All your profile data, saved properties, messages, and activity will be
                permanently deleted and you will be signed out immediately.
              </p>
              <div className="flex flex-col gap-2">
                <label className={`${upLabel} text-slate-500`} htmlFor="delete-reason">
                  Reason{' '}
                  <span className="normal-case font-medium text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="delete-reason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Tell us why you're leaving…"
                  className={`${upTextarea} min-h-[80px]`}
                  disabled={deleting}
                />
              </div>
            </div>

            {/* modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-2 justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <IconTrash />
                    Yes, delete account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
