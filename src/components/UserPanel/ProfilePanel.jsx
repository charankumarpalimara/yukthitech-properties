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
  vpPanel,
} from './userPanelStyles';

const isSellerRole = (role) => role && role !== 'buyer';

function RequiredMark() {
  return <span className={upLabelRequired}> *</span>;
}

function FieldLabel({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className={upLabel}>
      {children}
      {required ? <RequiredMark /> : null}
    </label>
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

  return (
    <div className={vpPage}>
      <div className={vpHeader}>
        <div>
          <h2 className={vpHeaderTitle}>My Profile</h2>
          <p className={vpHeaderSubtitle}>
            {isSeller
              ? 'Required contact and business details for your seller account'
              : 'Required personal details for your account'}
          </p>
        </div>
      </div>

      <div className={`${upCard} relative mb-0`}>
      {(saving || deleting) && (
        <Loader fullScreen text={deleting ? 'Deleting account...' : 'Saving profile...'} />
      )}

      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
        <div
          className={upAvatar}
          onClick={handleAvatarClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span>{form.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
          <div className={upAvatarOverlay}>{uploading ? 'Uploading...' : 'Edit'}</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="min-w-0">
          <strong className="block text-base font-semibold text-slate-900 mb-0.5 truncate">
            {form.name || 'User Name'}
          </strong>
          <p className="text-sm font-medium text-slate-500 m-0 capitalize">
            {userRole || 'Member'}
            {user?.subscription?.status === 'active' ? ' · Premium' : ''}
          </p>
        </div>
      </div>

      {isSeller && (
        <div className="mb-6">
          <div className={upSection}>
            <div className={upSectionAccent} />
            <span className={upSectionTitle}>Business Details</span>
            <div className={upSectionLine} />
          </div>

          <div className={upFieldGrid2}>
            <div className={`${upField} sm:col-span-2`}>
              <FieldLabel htmlFor="profile-companyName" required>
                Company / Business Name
              </FieldLabel>
              <input
                id="profile-companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Registered business name"
                className={inputClass('companyName')}
                required
              />
              {errors.companyName && (
                <p className="text-xs font-medium text-rose-600">{errors.companyName}</p>
              )}
            </div>

            <div className={upFieldFull}>
              <FieldLabel htmlFor="profile-address1" required>
                Address Line 1
              </FieldLabel>
              <input
                id="profile-address1"
                name="address1"
                value={form.address1}
                onChange={handleChange}
                placeholder="Street address, area, landmark"
                className={inputClass('address1')}
                required
              />
              {errors.address1 && (
                <p className="text-xs font-medium text-rose-600">{errors.address1}</p>
              )}
            </div>

            <div className={`${upField} relative`} ref={stateDropdownRef}>
              <FieldLabel htmlFor="profile-state" required>
                State
              </FieldLabel>
              <input
                id="profile-state"
                type="text"
                value={stateSearch}
                onChange={handleStateInputChange}
                onFocus={() => setShowStateDropdown(true)}
                onClick={() => setShowStateDropdown(true)}
                placeholder="Search and select state"
                autoComplete="off"
                className={inputClass('state')}
                required
              />
              {errors.state && (
                <p className="text-xs font-medium text-rose-600">{errors.state}</p>
              )}
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

            <div className={`${upField} relative`} ref={cityDropdownRef}>
              <FieldLabel htmlFor="profile-city" required>
                City
              </FieldLabel>
              <input
                id="profile-city"
                ref={cityInputRef}
                type="text"
                value={citySearch}
                onChange={handleCityInputChange}
                onFocus={() => form.state && setShowCityDropdown(true)}
                onClick={() => form.state && setShowCityDropdown(true)}
                placeholder={form.state ? 'Search and select city' : 'Select state first'}
                disabled={!form.state}
                autoComplete="off"
                className={`${inputClass('city')} disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400`}
                required
              />
              {errors.city && (
                <p className="text-xs font-medium text-rose-600">{errors.city}</p>
              )}
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

            <div className={upField}>
              <FieldLabel htmlFor="profile-pincode" required>
                Pincode
              </FieldLabel>
              <input
                id="profile-pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit PIN"
                maxLength={6}
                inputMode="numeric"
                className={inputClass('pincode')}
                required
              />
              {errors.pincode && (
                <p className="text-xs font-medium text-rose-600">{errors.pincode}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className={upSection}>
          <div className={upSectionAccent} />
          <span className={upSectionTitle}>Personal Information</span>
          <div className={upSectionLine} />
        </div>

        <div className={upFieldGrid2}>
          <div className={upField}>
            <FieldLabel htmlFor="profile-name" required>
              Full Name
            </FieldLabel>
            <input
              id="profile-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={inputClass('name')}
              required
            />
            {errors.name && <p className="text-xs font-medium text-rose-600">{errors.name}</p>}
          </div>

          <div className={upField}>
            <FieldLabel htmlFor="profile-email" required>
              Email
            </FieldLabel>
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
            {errors.email && <p className="text-xs font-medium text-rose-600">{errors.email}</p>}
          </div>

          <div className={upField}>
            <FieldLabel htmlFor="profile-phone" required>
              Phone
            </FieldLabel>
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
            {errors.phone && <p className="text-xs font-medium text-rose-600">{errors.phone}</p>}
          </div>
        </div>
      </div>

      <div className={upDivider} />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={upBtnPrimary}
          onClick={handleSave}
          disabled={saving || uploading || deleting}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          className={upBtnSecondary}
          onClick={handleCancel}
          disabled={saving || deleting}
        >
          Cancel
        </button>
      </div>

      <div className={`${upDivider} mt-6`} />

      <div className="rounded-md border border-rose-100 bg-rose-50/40 p-4 sm:p-5">
        <div className={upSection}>
          <div className="w-[3px] h-[18px] bg-rose-500 rounded-full shrink-0" />
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider whitespace-nowrap">
            Delete account
          </span>
          <div className="flex-1 h-px bg-rose-100" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-2xl">
          Permanently remove your account, listings, favourites, and related data. This cannot be
          undone.
        </p>
        <button
          type="button"
          className={upBtnDanger}
          onClick={() => setShowDeleteModal(true)}
          disabled={saving || uploading || deleting}
        >
          Delete my account
        </button>
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-md border border-slate-200 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-account-title" className="text-lg font-semibold text-slate-900 mb-2">
              Delete account?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              All your profile data, saved properties, and activity will be permanently deleted. You
              will be signed out immediately.
            </p>
            <label className={upLabel} htmlFor="delete-reason">
              Reason <span className="text-slate-400 normal-case font-medium">(optional)</span>
            </label>
            <textarea
              id="delete-reason"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Tell us why you are leaving..."
              className={`${upTextarea} mt-1.5 mb-5 min-h-[72px]`}
              disabled={deleting}
            />
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                className={upBtnSecondary}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center px-5 py-2 rounded-sm text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
