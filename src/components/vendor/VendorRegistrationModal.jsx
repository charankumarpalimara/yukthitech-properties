import { useSubscriptionStore, registerVendor } from '../../store/subscriptionStore';
import { useAuthStore, openLoginModal, getMe } from '../../store/authStore';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchStore } from '../../store/searchStore';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Plus,
  Trash2,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import Modal from './components/ui/Modal';
import { State, City } from 'country-state-city';

const INDIAN_MOBILE_REGEX = /^[5-9]\d{9}$/;
const INDIAN_PINCODE_REGEX = /^[1-9]\d{5}$/;

function sanitizeDigits(value, maxLen) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLen);
}

function sanitizeIndianMobile(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length > 10) {
    if (digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
  }
  return digits.slice(0, 10);
}

function sanitizePincode(value) {
  return sanitizeDigits(value, 6);
}

function isValidIndianMobile(value) {
  return INDIAN_MOBILE_REGEX.test(sanitizeIndianMobile(value));
}

function isValidIndianPincode(value) {
  return INDIAN_PINCODE_REGEX.test(sanitizePincode(value));
}

export default function VendorRegistrationModal({ isOpen, onClose, onComplete, introMessage }) {
  const user = useAuthStore((s) => s.user);
  const categories = useSearchStore((s) => s.categories);
  const initLoaded = useSearchStore((s) => s.initLoaded);
  const fetchSearchInitData = useSearchStore((s) => s.fetchSearchInitData);

  useEffect(() => {
    if (isOpen && !initLoaded) {
      fetchSearchInitData();
    }
  }, [isOpen, initLoaded, fetchSearchInitData]);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressAutocompleteRef = useRef(null);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const cityInputRef = useRef(null);

  const [registrationData, setRegistrationData] = useState({
    companyName: '',
    gst: '',
    businessMobile: '',
    contactPersonName: '',
    mobile: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    userRole: 'Owner',
    aboutCompany: '',
    hasPreviousProjects: false,
    previousProjects: [{ name: '', location: '', type: '' }],
  });

  // Pre-fill profile details if user is logged in
  useEffect(() => {
    if (user) {
      setRegistrationData((prev) => ({
        ...prev,
        contactPersonName: user.name || '',
        email: user.email || '',
        mobile: sanitizeIndianMobile(user.mobile || user.phone || ''),
        companyName: user.companyName || '',
        gst: user.gst || '',
        businessMobile: sanitizeIndianMobile(user.businessMobile || ''),
        address1: user.address1 || '',
        address2: user.address2 || '',
        city: user.city || '',
        state: user.state || '',
        pincode: sanitizePincode(user.pincode || ''),
        userRole:
          user.type &&
          typeof user.type === 'string' &&
          ['owner', 'agent', 'builder'].includes(user.type.toLowerCase())
            ? user.type.charAt(0).toUpperCase() + user.type.slice(1).toLowerCase()
            : 'Owner',
        aboutCompany: user.aboutCompany || '',
        hasPreviousProjects:
          (Array.isArray(user.previousProjects) && user.previousProjects.length > 0) || false,
        previousProjects:
          Array.isArray(user.previousProjects) && user.previousProjects.length > 0
            ? user.previousProjects.map((p) => ({
                name: p?.name || '',
                location: p?.location || '',
                type: p?.type || '',
                image: p?.image || '',
              }))
            : [{ name: '', location: '', type: '' }],
      }));
      setStateSearch(user.state || '');
      setCitySearch(user.city || '');
    }
  }, [user]);

  // Reset registration step on modal open
  useEffect(() => {
    if (isOpen) {
      setRegistrationStep(1);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addressAutocompleteRef.current &&
        !addressAutocompleteRef.current.contains(event.target)
      ) {
        setShowAddressSuggestions(false);
      }
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Google Places Autocomplete API search
  useEffect(() => {
    // if (!registrationData.address1 || registrationData.address1.length < 3 || !showAddressSuggestions) {
    //   setAddressSuggestions([]);
    //   return;
    // }

    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: registrationData.address1,
            componentRestrictions: { country: 'in' },
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setAddressSuggestions(predictions.map((p) => p.description));
            } else {
              setAddressSuggestions([]);
            }
          }
        );
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      }
    }
  }, [registrationData.address1, showAddressSuggestions]);

  const handleSelectAddress = (address) => {
    const parts = address.split(',').map((p) => p.trim());
    let city = '';
    let state = '';
    let pincode = '';

    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1];
      if (lastPart.toLowerCase() === 'india') {
        parts.pop();
      }

      if (parts.length > 0) {
        const statePart = parts.pop();
        const pincodeMatch = statePart.match(/\b\d{6}\b/);
        if (pincodeMatch) {
          pincode = pincodeMatch[0];
          state = statePart.replace(pincode, '').trim();
        } else {
          state = statePart;
        }
      }

      if (parts.length > 0) {
        city = parts.pop();
      }
    }

    setRegistrationData((prev) => {
      const finalState = state || prev.state;
      const finalCity = city || prev.city;
      setStateSearch(finalState);
      setCitySearch(finalCity);
      return {
        ...prev,
        address1: address,
        city: finalCity,
        state: finalState,
        pincode: sanitizePincode(pincode || prev.pincode),
      };
    });
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleAddress1Change = (e) => {
    const val = e.target.value;
    setRegistrationData((prev) => ({ ...prev, address1: val }));
    setShowAddressSuggestions(true);
  };

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'pincode') {
      next = sanitizePincode(value);
    } else if (name === 'businessMobile' || name === 'mobile') {
      next = sanitizeIndianMobile(value);
    }
    setRegistrationData((prev) => ({ ...prev, [name]: next }));
  };

  const statesList = useMemo(() => State.getStatesOfCountry('IN'), []);

  const cityList = useMemo(() => {
    if (!registrationData.state) return [];
    const stateObj = statesList.find(
      (s) =>
        s.name.toLowerCase() === registrationData.state.toLowerCase() ||
        s.isoCode.toLowerCase() === registrationData.state.toLowerCase()
    );
    return stateObj ? City.getCitiesOfState('IN', stateObj.isoCode) : [];
  }, [registrationData.state, statesList]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return statesList;
    return statesList.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [statesList, stateSearch]);

  const filteredCities = useMemo(() => {
    if (!cityList) return [];
    if (!citySearch.trim()) return cityList;
    return cityList.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  }, [cityList, citySearch]);

  const handleSelectState = (selectedState) => {
    setRegistrationData((prev) => ({
      ...prev,
      state: selectedState.name,
      city: '',
    }));
    setStateSearch(selectedState.name);
    setCitySearch('');
    setShowStateDropdown(false);
    setShowCityDropdown(true);

    // Focus the city input so that it opens and allows immediate typing
    if (cityInputRef.current) {
      setTimeout(() => {
        cityInputRef.current.focus();
      }, 50);
    }
  };

  const handleSelectCity = (cityName) => {
    setRegistrationData((prev) => ({
      ...prev,
      city: cityName,
    }));
    setCitySearch(cityName);
    setShowCityDropdown(false);
  };

  const handleStateInputChange = (e) => {
    const val = e.target.value;
    setStateSearch(val);
    setRegistrationData((prev) => ({ ...prev, state: val, city: '' }));
    setCitySearch('');
    setShowStateDropdown(true);
  };

  const handleCityInputChange = (e) => {
    const val = e.target.value;
    setCitySearch(val);
    setRegistrationData((prev) => ({ ...prev, city: val }));
    setShowCityDropdown(true);
  };

  const handlePreviousProjectChange = (index, field, value) => {
    const updatedProjects = [...registrationData.previousProjects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setRegistrationData((prev) => ({ ...prev, previousProjects: updatedProjects }));
  };

  const handleImageUpload = (index, file) => {
    if (file) {
      const updatedProjects = [...registrationData.previousProjects];
      updatedProjects[index] = { ...updatedProjects[index], imageFile: file, imageName: file.name };
      setRegistrationData((prev) => ({ ...prev, previousProjects: updatedProjects }));
    }
  };

  const addPreviousProject = () => {
    setRegistrationData((prev) => ({
      ...prev,
      previousProjects: [...prev.previousProjects, { name: '', location: '', type: '' }],
    }));
  };

  const removePreviousProject = (index) => {
    if (registrationData.previousProjects.length > 1) {
      const updatedProjects = registrationData.previousProjects.filter((_, i) => i !== index);
      setRegistrationData((prev) => ({ ...prev, previousProjects: updatedProjects }));
    }
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();

    if (!isValidIndianMobile(registrationData.mobile)) {
      toast.error('Contact number must be a valid 10-digit Indian mobile number');
      return;
    }
    if (registrationData.pincode && !isValidIndianPincode(registrationData.pincode)) {
      toast.error('Pincode must be exactly 6 digits and cannot start with 0');
      return;
    }
    if (registrationData.businessMobile && !isValidIndianMobile(registrationData.businessMobile)) {
      toast.error('Business contact must be a valid 10-digit Indian mobile number');
      return;
    }

    const formData = new FormData();
    // Append standard fields
    Object.keys(registrationData).forEach((key) => {
      if (key !== 'previousProjects' && key !== 'hasPreviousProjects') {
        formData.append(key, registrationData[key]);
      }
    });

    // Append previous projects as JSON string
    if (registrationData.hasPreviousProjects) {
      formData.append(
        'previousProjects',
        JSON.stringify(
          registrationData.previousProjects.map(({ imageFile, imageName, ...rest }) => rest)
        )
      );

      // Append files separately with unique fieldnames
      registrationData.previousProjects.forEach((project, index) => {
        if (project.imageFile) {
          formData.append(`projectImage_${index}`, project.imageFile);
        }
      });
    }

    toast.promise(
      registerVendor(formData)
        .then(() => getMe())
        .then(() => {
          onComplete?.();
        }),
      {
        loading: 'Updating your profile...',
        success: 'Profile updated successfully!',
        error: (err) => `Failed to update profile: ${err}`,
      }
    );
  };

  const handleNextStep = () => {
    if (registrationData.userRole !== 'Owner' && !registrationData.companyName.trim()) {
      toast.error('Company Name is required');
      return;
    }
    if (registrationData.pincode && !isValidIndianPincode(registrationData.pincode)) {
      toast.error('Pincode must be exactly 6 digits and cannot start with 0');
      return;
    }
    if (registrationData.businessMobile && !isValidIndianMobile(registrationData.businessMobile)) {
      toast.error('Business contact must be a valid 10-digit Indian mobile number');
      return;
    }
    setRegistrationStep(2);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Seller Profile"
      size="lg"
      hideScrollbar={true}
    >
      {introMessage ? (
        <p className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-md px-4 py-3 mb-4 font-medium">
          {introMessage}
        </p>
      ) : null}
      <form onSubmit={handleRegistrationSubmit} className="space-y-6 py-2">
        {registrationStep === 1 && (
          <div className="space-y-6">
            <div className="mb-2">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                Business Details
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-5">
              <div className="space-y-2 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Company / Business Name
                </label>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    name="companyName"
                    required={registrationData.userRole !== 'Owner'}
                    value={registrationData.companyName || ''}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder={
                      registrationData.userRole === 'Owner'
                        ? 'Enter company or business name (optional)'
                        : 'Enter company name'
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  GST Number (Optional)
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    name="gst"
                    value={registrationData.gst || ''}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Enter GST number"
                  />
                </div>
              </div>

              {/* <div className="space-y-2 col-span-2 relative" ref={addressAutocompleteRef}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Address Line 1 (Search Location)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      name="address1"
                      required
                      value={registrationData.address1 || ''}
                      onChange={handleAddress1Change}
                      onFocus={() => setShowAddressSuggestions(true)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Search and select street address..."
                      autoComplete="off"
                    />
                  </div>
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-[3px] shadow-lg z-[200] max-h-[180px] overflow-y-auto mt-1">
                      {addressSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAddress(suggestion)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 border-none bg-transparent cursor-pointer block truncate border-b border-slate-100 last:border-none"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div> */}
              <div className="space-y-2 col-span-1 relative" ref={stateDropdownRef}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  State
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    name="state"
                    value={stateSearch}
                    onChange={handleStateInputChange}
                    onFocus={() => setShowStateDropdown(true)}
                    onClick={() => setShowStateDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Search and select state..."
                    autoComplete="off"
                  />
                </div>
                {showStateDropdown && filteredStates.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-[3px] shadow-lg z-[200] max-h-[180px] overflow-y-auto mt-1 custom-scrollbar">
                    {filteredStates.map((st, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectState(st)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 border-none bg-transparent cursor-pointer block truncate border-b border-slate-100 last:border-none"
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 col-span-1 relative" ref={cityDropdownRef}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  City
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    ref={cityInputRef}
                    type="text"
                    name="city"
                    value={citySearch}
                    onChange={handleCityInputChange}
                    onFocus={() => setShowCityDropdown(true)}
                    onClick={() => registrationData.state && setShowCityDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder={
                      registrationData.state ? 'Search and select city...' : 'Select state first'
                    }
                    disabled={!registrationData.state}
                    autoComplete="off"
                  />
                </div>
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-[3px] shadow-lg z-[200] max-h-[180px] overflow-y-auto mt-1 custom-scrollbar">
                    {filteredCities.map((ct, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCity(ct.name)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 border-none bg-transparent cursor-pointer block truncate border-b border-slate-100 last:border-none"
                      >
                        {ct.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Pincode
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="tel"
                    name="pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    title="Enter a valid 6-digit Indian pincode"
                    value={registrationData.pincode || ''}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Address Line (optional)
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    name="address2"
                    value={registrationData.address2 || ''}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Apartment, suite, unit, building, floor"
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Business Contact Number (Optional)
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="tel"
                    name="businessMobile"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={15}
                    value={registrationData.businessMobile || ''}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                Short Writeup (Min 1000 words space provided)
              </label>
              <textarea
                name="aboutCompany"
                value={registrationData.aboutCompany || ''}
                onChange={handleRegistrationChange}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
                placeholder="Enter details about your company, achievements, and vision..."
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {(registrationData.aboutCompany || '').split(/\s+/).filter(Boolean).length} / 1000
                  words recommended
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-2.5 bg-amber-500 text-white rounded-none text-sm font-bold hover:bg-amber-600 shadow-md shadow-amber-200 transition-all flex items-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {registrationStep === 2 && (
          <div className="space-y-6">
            <div className="mb-2">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                Contact & Personal Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  I am a
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <select
                    name="userRole"
                    value={registrationData.userRole}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({ ...prev, userRole: e.target.value }))
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Agent">Agent</option>
                    <option value="Builder">Builder</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Contact Person Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    name="contactPersonName"
                    required
                    value={registrationData.contactPersonName}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="tel"
                    name="mobile"
                    required
                    disabled
                    inputMode="numeric"
                    maxLength={15}
                    value={registrationData.mobile}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-[3px] text-sm font-medium outline-none transition-all cursor-not-allowed"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled
                    value={registrationData.email}
                    onChange={handleRegistrationChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-[3px] text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>

            {/* Previous Projects Section */}
            {/* {registrationData.userRole !== 'Owner' && ( */}
            <div className="bg-primary/[0.03] border border-primary/10 rounded-[4px] p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  Previous Projects Completed if Any
                </h3>
                <div className="flex gap-2 shrink-0">
                  {['Yes', 'No'].map((choice) => {
                    const isSelected =
                      (choice === 'Yes' && registrationData.hasPreviousProjects) ||
                      (choice === 'No' && !registrationData.hasPreviousProjects);
                    return (
                      <label
                        key={choice}
                        className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border transition-all cursor-pointer ${isSelected ? 'border-primary text-primary bg-primary/[0.08] shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white'}`}
                      >
                        <input
                          type="radio"
                          name="hasPreviousProjects"
                          className="hidden"
                          checked={isSelected}
                          onChange={() =>
                            setRegistrationData((prev) => ({
                              ...prev,
                              hasPreviousProjects: choice === 'Yes',
                            }))
                          }
                        />
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'border-primary' : 'border-slate-300'}`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <span className="text-xs font-semibold">{choice}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {registrationData.hasPreviousProjects && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-500">
                  {registrationData.previousProjects.map((project, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white border border-slate-200/85 rounded-[4px] space-y-4 relative group shadow-sm"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) =>
                              handlePreviousProjectChange(index, 'name', e.target.value)
                            }
                            className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-800 focus:border-primary rounded-[3px] text-xs font-medium outline-none"
                            placeholder="Project name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={project.location}
                            onChange={(e) =>
                              handlePreviousProjectChange(index, 'location', e.target.value)
                            }
                            className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-800 focus:border-primary rounded-[3px] text-xs font-medium outline-none"
                            placeholder="City, Area"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                            Project Type
                          </label>
                          <select
                            value={project.type}
                            onChange={(e) =>
                              handlePreviousProjectChange(index, 'type', e.target.value)
                            }
                            className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-800 focus:border-primary rounded-[3px] text-xs font-medium outline-none"
                          >
                            <option value="">Select Type</option>
                            {categories.map((category) => (
                              <option key={category._id || category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                            Project Image (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, e.target.files[0])}
                              className="hidden"
                              id={`project-image-${index}`}
                            />
                            <label
                              htmlFor={`project-image-${index}`}
                              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border-2 border-dashed border-slate-200 text-slate-500 rounded-[3px] text-xs font-bold hover:border-primary hover:text-primary transition-all cursor-pointer overflow-hidden"
                            >
                              {project.imageFile ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                  <span className="truncate max-w-[100px]">
                                    {project.imageName}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <Plus size={14} /> Upload Image
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                      {registrationData.previousProjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePreviousProject(index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-rose-500 rounded-full hover:bg-rose-50 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPreviousProject}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-all"
                  >
                    <Plus size={14} /> Add Another Project
                  </button>
                </div>
              )}
            </div>
            {/* )} */}

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRegistrationStep(1)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-none text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex gap-3">
                {/* <button
                    type="button"
                    onClick={() => onClose?.()}
                    className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-none text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    Skip for Now
                  </button> */}
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-amber-500 text-white rounded-none text-sm font-bold hover:bg-amber-600 shadow-md shadow-amber-200 transition-all flex items-center gap-2"
                >
                  Complete Registration <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
