import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, logout, openLoginModal } from '../../store/authStore';
import {
  useNotificationsStore,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../store/notificationsStore';
import { NAV_LINKS, MEGA_MENUS } from '../../data/constants';
import {
  MenuIco,
  CloseIco,
  PinIco,
  LocIco,
  IconFlats,
  SearchIco,
  BuyIcon,
  DashboardIcon,
  GpsIco,
  LogoIcon,
} from '../../data/icons';
import SearchBar from '../SearchBar/SearchBar';
import { useSearch } from '../../context/SearchContext';
import {
  GOOGLE_MAPS_API_KEY,
  prefetchLocationThumbnails,
  resolveCityThumbnailUrl,
} from '../../utils/cityImage';
import { requestNotificationPermission, removeFcmToken } from '../../service/firebaseNotifications';
import { API_URL } from '../../service/api';
import { BellIco } from '../../data/icons';
import { isSellerUserType } from '../../utils/isSellerUserType';
import { preloadUserPanelPage } from '../../utils/preloadRoutes';
import {
  buildAutocompleteFetchParams,
  buildAutocompleteSdkRequest,
  buildPlacesAutocompleteBias,
  buildSelectedLocationLabel,
  fetchCoordsForCitySelection,
  formatUserLocationDisplay,
  hasValidCoordinates,
  locationsMatch,
  parsePlacePredictions,
  rankLocationSuggestions,
} from '../../utils/locationDisplay';
import { useSearchStore } from '../../store/searchStore';
import {
  HOME_EYEBROW,
  HOME_SECTION_TITLE,
  HOME_SECTION_SUBTITLE,
  HOME_VIEW_ALL_BTN,
} from '../HomeScreen/homeTypographyStyles';
import {
  upSectionTitle,
  vpSearchIcon,
  vpSearchInput,
  vpSearchWrap,
} from '../UserPanel/userPanelStyles';

const formatCityWord = (word) =>
  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '';

const formatCityLabel = (name) =>
  (name || '').split(' ').filter(Boolean).map(formatCityWord).join(' ');

/** Comma-separated location with title case per part (e.g. "hyderabad, telangana" → "Hyderabad, Telangana") */
const formatLocationString = (raw) => {
  const text = (raw || '').trim();
  if (!text) return '';
  return text
    .split(',')
    .map((part) => formatCityLabel(part.trim()))
    .filter(Boolean)
    .join(', ');
};

/** Full location string with each segment capitalized (e.g. "Hyderabad, Telangana, India") */
const formatLocationFullName = (city) => {
  const raw = (city?.fullName || city?.name || '').trim();
  if (!raw) return 'India';
  return formatLocationString(raw);
};

const getLocationRowLabels = (city) => {
  const full = formatLocationFullName(city);
  const primary = formatCityLabel(city?.name) || full.split(',')[0] || full;
  const secondary =
    (city?.state && String(city.state).trim()) ||
    full
      .split(',')
      .slice(1)
      .map((p) => p.trim())
      .filter(Boolean)
      .join(', ');
  return { primary, secondary };
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locSearch, setLocSearch] = useState('');
  const [locSuggestions, setLocSuggestions] = useState([]);
  const [locationImageCache, setLocationImageCache] = useState({});
  const locationImageCacheRef = useRef({});
  const [locationBiasPoint, setLocationBiasPoint] = useState(null);
  const locationSearchContextRef = useRef({
    coordinates: null,
    locationBiasPoint: null,
    userLocation: null,
  });
  const locSearchRequestIdRef = useRef(0);
  const locSearchInitialRef = useRef('');
  const [activeMenuKey, setActiveMenuKey] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationList = useNotificationsStore((s) => s.list);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const locationRef = useRef(null);
  const locationCloseTimerRef = useRef(null);
  const locationPanelPinnedRef = useRef(false);

  const isDesktopViewport = () => window.innerWidth > 900;

  const clearLocationCloseTimer = () => {
    if (locationCloseTimerRef.current) {
      clearTimeout(locationCloseTimerRef.current);
      locationCloseTimerRef.current = null;
    }
  };

  const seedLocationSearchFromSelection = () => {
    const display =
      userLocation && userLocation !== 'All India' ? formatUserLocationDisplay(userLocation) : '';
    locSearchInitialRef.current = display;
    setLocSearch(display);
    setLocSuggestions([]);
  };

  const resetLocationSearchInput = () => {
    locSearchInitialRef.current = '';
    setLocSearch('');
    setLocSuggestions([]);
  };

  const dismissLocationPanel = () => {
    clearLocationCloseTimer();
    locationPanelPinnedRef.current = false;
    setIsLocationModalOpen(false);
    resetLocationSearchInput();
  };

  const openLocationPanel = () => {
    clearLocationCloseTimer();
    setIsLocationModalOpen(true);
    seedLocationSearchFromSelection();
  };

  const handleLocationMouseLeave = (e) => {
    if (!isDesktopViewport() || locationPanelPinnedRef.current) return;
    const root = locationRef.current;
    const next = e.relatedTarget;
    if (root && next instanceof Node && root.contains(next)) return;
    scheduleCloseLocationPanel();
  };

  const scheduleCloseLocationPanel = () => {
    if (locationPanelPinnedRef.current) return;
    clearLocationCloseTimer();
    locationCloseTimerRef.current = setTimeout(() => {
      const root = locationRef.current;
      if (locationPanelPinnedRef.current || root?.matches(':hover')) return;
      setIsLocationModalOpen(false);
      resetLocationSearchInput();
    }, 250);
  };

  const toggleLocationPanel = () => {
    clearLocationCloseTimer();
    setIsLocationModalOpen((prev) => {
      if (prev) {
        locationPanelPinnedRef.current = false;
        resetLocationSearchInput();
        return false;
      }
      locationPanelPinnedRef.current = true;
      seedLocationSearchFromSelection();
      return true;
    });
  };

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userFromStore = useAuthStore((s) => s.user);
  const {
    query,
    location,
    userLocation,
    coordinates,
    suggestions,
    popularCities,
    cities,
    handleSearch: executeSearch,
    updateQuery,
    updateLocation,
    updateUserLocation,
    detectUserLocation,
    isDetecting,
    setQuery,
    setLocation,
    setUserLocation,
    setCoordinates,
    clearSuggestions,
  } = useSearch();

  const handleSearch = (e, paramsOverride) => {
    executeSearch(e, paramsOverride);
    setIsMenuOpen(false);
  };
  const navigate = useNavigate();
  const locationPath = useLocation();

  const isHomePage = locationPath.pathname === '/';
  const isnotHomePage = locationPath.pathname !== '/';

  const isAuthenticated = isLoggedIn;

  const userDetails = {
    name: userFromStore?.name || 'User',
    email: userFromStore?.email || '',
    subscribed: userFromStore?.subscribed || false,
    avatar: userFromStore?.avatar || '',
    type: userFromStore?.type || '',
  };

  // Resolve a lat/lng bias point for location search (not used for popular cities list)
  useEffect(() => {
    if (hasValidCoordinates(coordinates)) {
      setLocationBiasPoint({
        lat: Number(coordinates.lat),
        lng: Number(coordinates.lng),
      });
      return;
    }

    if (!userLocation || userLocation === 'All India') {
      setLocationBiasPoint(null);
      return;
    }

    if (!window.google?.maps?.Geocoder) {
      setLocationBiasPoint(null);
      return;
    }

    let cancelled = false;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: userLocation, region: 'IN' }, (results, status) => {
      if (cancelled) return;
      if (status === window.google.maps.GeocoderStatus.OK && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        setLocationBiasPoint({ lat: loc.lat(), lng: loc.lng() });
      } else {
        setLocationBiasPoint(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [coordinates, userLocation]);

  locationSearchContextRef.current = { coordinates, locationBiasPoint, userLocation };

  const fetchLocSuggestions = (query, requestId, useBias = true) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      if (requestId === locSearchRequestIdRef.current) setLocSuggestions([]);
      return;
    }

    const bias = useBias ? buildPlacesAutocompleteBias(locationSearchContextRef.current) : null;
    const PlacesStatus = window.google?.maps?.places?.PlacesServiceStatus;

    const applyResults = (predictions) => {
      if (requestId !== locSearchRequestIdRef.current) return;
      const parsed = parsePlacePredictions(predictions);
      const ranked = rankLocationSuggestions(parsed, trimmed, locationSearchContextRef.current);
      setLocSuggestions(ranked);

      // Places Photo API (JS SDK): load image per search row using placeId
      prefetchLocationThumbnails(ranked, (cacheKey, url) => {
        if (requestId !== locSearchRequestIdRef.current) return;
        setLocationImageCache((prev) =>
          prev[cacheKey] === url ? prev : { ...prev, [cacheKey]: url }
        );
      });
    };

    const fetchViaHttp = async (withBias) => {
      if (!GOOGLE_MAPS_API_KEY) return false;
      const activeBias = withBias
        ? buildPlacesAutocompleteBias(locationSearchContextRef.current)
        : null;
      const params = buildAutocompleteFetchParams(trimmed, GOOGLE_MAPS_API_KEY, activeBias);
      if (!params) return false;

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
        );
        const data = await response.json();
        if (requestId !== locSearchRequestIdRef.current) return true;

        if (data.status === 'OK' && data.predictions?.length > 0) {
          applyResults(data.predictions);
          return true;
        }
        if (withBias && activeBias) return fetchViaHttp(false);
        if (requestId === locSearchRequestIdRef.current) setLocSuggestions([]);
        return true;
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        return false;
      }
    };

    if (window.google?.maps?.places) {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        const request = buildAutocompleteSdkRequest(trimmed, bias, window.google.maps);
        if (!request) return;

        service.getPlacePredictions(request, (predictions, status) => {
          if (requestId !== locSearchRequestIdRef.current) return;

          if (status === PlacesStatus?.OK && predictions?.length > 0) {
            applyResults(predictions);
            return;
          }

          if (useBias && bias) {
            fetchLocSuggestions(trimmed, requestId, false);
            return;
          }

          fetchViaHttp(false);
        });
        return;
      } catch (error) {
        console.error('AutocompleteService error, trying HTTP fallback:', error);
      }
    }

    fetchViaHttp(useBias);
  };

  useEffect(() => {
    const query = locSearch.trim();
    if (query.length < 2) {
      setLocSuggestions([]);
      return undefined;
    }

    const requestId = ++locSearchRequestIdRef.current;
    const timeoutId = setTimeout(() => fetchLocSuggestions(query, requestId, true), 400);
    return () => clearTimeout(timeoutId);
  }, [locSearch]);

  // Re-run search when bias point becomes available (user already typing)
  useEffect(() => {
    const query = locSearch.trim();
    if (query.length < 2 || !isLocationModalOpen) return undefined;

    const requestId = ++locSearchRequestIdRef.current;
    const timeoutId = setTimeout(() => fetchLocSuggestions(query, requestId, true), 100);
    return () => clearTimeout(timeoutId);
  }, [locationBiasPoint, coordinates, isLocationModalOpen]);

  useEffect(() => {
    locationImageCacheRef.current = locationImageCache;
  }, [locationImageCache]);

  // Popular cities grid: load Google photos when not actively searching
  useEffect(() => {
    if (!isLocationModalOpen) return undefined;

    const trimmed = locSearch.trim();
    const initial = (locSearchInitialRef.current || '').trim();
    const isSearchingNow = trimmed.length >= 2 && trimmed !== initial;
    if (isSearchingNow || !popularCities?.length) return undefined;

    prefetchLocationThumbnails(popularCities, (cacheKey, url) => {
      setLocationImageCache((prev) =>
        prev[cacheKey] === url ? prev : { ...prev, [cacheKey]: url }
      );
    });
  }, [isLocationModalOpen, locSearch, popularCities]);

  const applyNavbarLocationSelection = useSearchStore((s) => s.applyNavbarLocationSelection);

  const renderLocationThumbnail = (city) => {
    const thumbUrl = resolveCityThumbnailUrl(city, locationImageCache);
    if (thumbUrl) {
      return <img src={thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />;
    }
    return (
      <span className="flex h-full w-full items-center justify-center text-primary">
        <LocIco size={16} />
      </span>
    );
  };

  const handleLocationSelect = async (city) => {
    locationPanelPinnedRef.current = false;
    setIsLocationModalOpen(false);
    resetLocationSearchInput();

    const label = buildSelectedLocationLabel(city);
    const coords = await fetchCoordsForCitySelection(city);

    applyNavbarLocationSelection({
      label,
      coordinates: coords ?? { lat: null, lng: null },
    });
  };

  useEffect(() => {
    if (!userLocation || userLocation === 'All India') {
      detectUserLocation();
    }
  }, []);

  useEffect(() => () => clearLocationCloseTimer(), []);

  useEffect(() => {
    if (!isLocationModalOpen) return undefined;

    const handlePointerDown = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        dismissLocationPanel();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isLocationModalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setIsScrolled(scrollPos > 40);
      setIsPastHero(scrollPos > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile: location trigger hides when navbar is scrolled — close panel only then
  useEffect(() => {
    if (!isScrolled || isDesktopViewport()) return;
    dismissLocationPanel();
  }, [isScrolled]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(() => fetchNotifications(), 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        clearSuggestions();
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        clearSuggestions();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const markAsRead = (id) => {
    markNotificationRead(id);
  };

  const markAllAsRead = () => {
    markAllNotificationsRead();
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  const handleLogout = async () => {
    const jwtToken = localStorage.getItem('token');

    // Remove FCM token on backend first (requires auth token).
    if (jwtToken) {
      try {
        await fetch(`${API_URL}/auth/fcm-token`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
      } catch (err) {
        console.warn('Failed to delete FCM token on backend during logout:', err);
      }
    }

    // Remove browser Firebase token + local fcmToken cache.
    try {
      await removeFcmToken();
    } catch (err) {
      console.warn('Failed to delete Firebase token during logout:', err);
    }

    localStorage.removeItem('fcmToken');
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    logout();
    navigate('/');
  };

  const handleSelectSuggestion = (s) => {
    setIsMenuOpen(false);
    clearSuggestions();

    const overrides = {};
    if (s.type === 'city') {
      setQuery('');
      setLocation(s.text);
      overrides.search = '';
      overrides.city = s.text;
    } else if (s.type === 'project' || s.type === 'property') {
      setQuery(s.text);
      overrides.search = s.text;
      if (s.id) {
        navigate(`/property/${s.id}`);
        return;
      }
    } else {
      setQuery(s.text);
      overrides.search = s.text;
      if (s.subtext) {
        setLocation(s.subtext);
        overrides.city = s.subtext;
      }
    }

    // Trigger immediate search navigation
    handleSearch(null, overrides);
  };

  return (
    <>
      <nav
        className={`fixed w-full left-0 top-0 z-[1000] lg:px-10 flex items-center h-[72px] max-sm:h-[56px] transition-all duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${isScrolled
          ? 'bg-white lg:rounded-b-[60px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:rounded-none'
          : isHomePage
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md'
          }`}
      >
        <div className="max-w-[1350px] w-full mx-auto px-5 flex items-center gap-3 relative">
          {/* Left: Logo, Location (top) / Mobile search (scrolled) */}
          <div
            className={`flex items-center gap-5 max-md:gap-1 min-w-0 ${isScrolled ? 'max-md:flex-1' : 'flex-none'}`}
          >
            <Link
              to="/"
              className="flex items-center gap-2 max-md:gap-1.5 md:gap-2.5 font-outfit text-xl font-bold shrink-0 tracking-tight min-w-0"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogoIcon
                className="w-9 h-9 md:w-10 md:h-10 shrink-0 text-[#023526]"
              />
              <span
                className={`hidden md:inline-flex font-bold text-sm sm:text-base md:text-[1.25rem] tracking-tight whitespace-nowrap truncate ${isScrolled || isnotHomePage ? 'text-slate-900' : 'text-black'
                  }`}
              >
                Yukthi Properties
              </span>
            </Link>

            <div
              ref={locationRef}
              className={`relative h-full flex items-center min-w-0 ${isScrolled ? 'max-md:hidden' : ''}`}
              onMouseEnter={() => isDesktopViewport() && openLocationPanel()}
              onMouseLeave={handleLocationMouseLeave}
            >
              <div
                className="flex items-center gap-1 cursor-pointer py-1.5 px-2 rounded-md transition-colors border border-transparent hover:bg-slate-50 hover:border-slate-200 group min-w-0"
                onClick={toggleLocationPanel}
              >
                <PinIco className="w-3.5 h-3.5 text-primary shrink-0" />
                <span
                  className={`text-[13px] font-medium whitespace-nowrap max-w-[120px] sm:max-w-[180px] md:max-w-[240px] truncate ${isScrolled || isnotHomePage ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-800 md:text-black group-hover:text-slate-900'}`}
                >
                  {formatUserLocationDisplay(userLocation)}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`w-3.5 h-3.5 shrink-0 ${isScrolled || isnotHomePage ? 'text-slate-400 group-hover:text-slate-900' : 'text-slate-500 md:text-black group-hover:text-slate-900'}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Location Popover */}
              {isLocationModalOpen &&
                (() => {
                  const popularList = popularCities?.length > 0 ? popularCities : [];
                  const isSearching =
                    locSearch.trim().length >= 2 &&
                    locSearch.trim() !== (locSearchInitialRef.current || '').trim();
                  const locationList = isSearching ? locSuggestions : [];
                  const sectionTitle = isSearching
                    && 'Search results'
                  
                      
                  const isAllIndiaSelected = userLocation === 'All India';
                  const rowBase =
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-left transition-colors border-none cursor-pointer';
                  const rowSelected = 'bg-primary/5 text-primary';
                  const rowIdle = 'bg-transparent hover:bg-slate-50 text-slate-900';

                  return (
                    <>
                      {/* pt-2 bridge: keeps hover alive when moving from trigger into the panel */}
                      <div className="absolute top-full left-0 z-[2005] pt-2 w-[min(100vw-20px,380px)] max-md:fixed max-md:top-[56px] max-md:left-2.5 max-md:right-2.5 max-md:w-auto max-md:pt-0">
                        <div
                          className="bg-white rounded-md shadow-[0_8px_30px_rgba(15,23,42,0.1)] border border-slate-200/80 overflow-hidden flex flex-col max-h-[min(65vh,440px)] max-md:max-h-[min(68vh,480px)]"
                          onMouseDown={() => {
                            if (isDesktopViewport()) locationPanelPinnedRef.current = true;
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <PinIco size={14} className="text-primary shrink-0" />
                              <h3 className="text-sm font-semibold text-slate-900 m-0 leading-none">
                                Location
                              </h3>
                            </div>
                            <button
                              type="button"
                              className="shrink-0 p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              onClick={dismissLocationPanel}
                              aria-label="Close location picker"
                            >
                              <CloseIco />
                            </button>
                          </div>

                          <div className="px-3 py-2.5 border-b border-slate-100 shrink-0 flex items-center gap-2">
                            <div className={vpSearchWrap}>
                              <SearchIco size={15} className={vpSearchIcon} />
                              <input
                                type="text"
                                className={`${vpSearchInput} h-9 text-sm pr-8 bg-slate-50/80`}
                                placeholder="Search city or area"
                                value={locSearch}
                                onChange={(e) => setLocSearch(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                autoFocus
                              />
                              {locSearch && (
                                <button
                                  type="button"
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-slate-400 hover:text-slate-600 transition-colors"
                                  onClick={resetLocationSearchInput}
                                  aria-label="Clear search"
                                >
                                  <CloseIco />
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={detectUserLocation}
                              disabled={isDetecting}
                              title="Use my current location"
                              aria-label="Use my current location"
                              className="shrink-0 flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-primary hover:bg-primary/5 hover:border-primary/25 transition-colors disabled:opacity-50"
                            >
                              {isDetecting ? (
                                <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <GpsIco size={15} />
                              )}
                            </button>
                          </div>

                          <div
                            className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain custom-scrollbar py-1"
                            onWheel={(e) => {
                              const el = e.currentTarget;
                              const { scrollTop, scrollHeight, clientHeight } = el;
                              const goingUp = e.deltaY < 0;
                              const goingDown = e.deltaY > 0;
                              const atTop = scrollTop <= 0;
                              const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
                              if ((goingUp && !atTop) || (goingDown && !atBottom)) {
                                e.stopPropagation();
                              }
                            }}
                          >
                            {!isSearching && (
                              <div className="px-2 pb-1">
                                <button
                                  type="button"
                                  className={`${rowBase} ${isAllIndiaSelected ? rowSelected : rowIdle}`}
                                  onClick={() => {
                                    applyNavbarLocationSelection({
                                      label: 'All India',
                                      coordinates: { lat: null, lng: null },
                                    });
                                    dismissLocationPanel();
                                  }}
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-primary">
                                    <PinIco size={13} />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium leading-tight">
                                      All India
                                    </span>
                                    <span className="block text-[11px] text-slate-500 mt-0.5">
                                      Nationwide
                                    </span>
                                  </span>
                                  {isAllIndiaSelected && (
                                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                                      Active
                                    </span>
                                  )}
                                </button>
                              </div>
                            )}

                            {sectionTitle ? (
                              <p className={`${upSectionTitle} px-3 pt-1.5 pb-1 m-0 normal-case tracking-normal text-slate-400 font-medium`}>
                                {sectionTitle}
                              </p>
                            ) : null}

                            {locationList.length > 0 ? (
                              <ul className="m-0 px-2 pb-2 list-none">
                                {locationList.map((city) => {
                                  const { primary, secondary } = getLocationRowLabels(city);
                                  const key =
                                    city.placeId || city.fullName || city.name || primary;
                                  const rowLabel = buildSelectedLocationLabel(city);
                                  const isSelected = locationsMatch(userLocation, rowLabel);
                                  const metaLabel =
                                    !isSearching &&
                                    city.propertyCount != null &&
                                    city.propertyCount !== ''
                                      ? `${city.propertyCount} listings`
                                      : secondary;
                                  return (
                                    <li key={key}>
                                      <button
                                        type="button"
                                        className={`${rowBase} ${isSelected ? rowSelected : rowIdle}`}
                                        onClick={() => handleLocationSelect(city)}
                                      >
                                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-slate-100">
                                          {renderLocationThumbnail(city)}
                                        </div>
                                        <span className="min-w-0 flex-1">
                                          <span className="block text-sm font-medium truncate leading-tight">
                                            {primary}
                                          </span>
                                          {metaLabel ? (
                                            <span className="block text-[11px] text-slate-500 mt-0.5 truncate">
                                              {metaLabel}
                                            </span>
                                          ) : null}
                                        </span>
                                        {isSelected && (
                                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wide shrink-0">
                                            Active
                                          </span>
                                        )}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : isSearching ? (
                              <p className="px-4 py-8 text-center text-sm text-slate-500 m-0">
                                No locations found for &ldquo;{locSearch.trim()}&rdquo;
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div
                        className="fixed inset-0 bg-slate-900/30 z-[1500] max-md:block hidden"
                        onClick={dismissLocationPanel}
                        aria-hidden="true"
                      />
                    </>
                  );
                })()}
            </div>

            {/* Mobile: search replaces location when scrolled */}
            <div
              className={`md:hidden flex-1 min-w-0 ${isScrolled ? 'flex' : 'hidden'}`}
              ref={mobileSearchRef}
            >
              <SearchBar isNavbar={true} />
            </div>
          </div>

          {/* Center Space & Desktop Search */}
          <div className="flex-1 flex items-center justify-center min-w-0 max-md:hidden">
            {/* Scrolled Search Desktop */}
            <div
              className={`hidden md:flex flex-col relative w-full max-w-[500px] transition-all duration-300 ${!isScrolled || !isPastHero ? 'hidden opacity-0 invisible w-0 pointer-events-none' : 'opacity-100 visible'}`}
              ref={searchRef}
            >
              <form
                className="flex items-center w-full bg-[#f8fafc] border-[1.5px] border-[#e8edf2] rounded-[10px] px-3 h-[42px] gap-2.5 transition-all duration-200 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 focus-within:bg-white"
                onSubmit={handleSearch}
              >
                <svg
                  className="w-[17px] h-[17px] text-slate-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="flex-1 h-full border-none bg-transparent text-[0.88rem] text-slate-900 font-sans outline-none min-w-0 placeholder:text-slate-400 font-normal focus:ring-0"
                  placeholder={
                    location
                      ? `Search in ${formatUserLocationDisplay(location)}...`
                      : 'Search city, locality, project…'
                  }
                  value={query}
                  onChange={(e) => updateQuery(e.target.value)}
                  autoComplete="off"
                />
                {/* <button type="submit" className="bg-primary text-white border-none px-4 py-1.5 rounded-[7px] text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-dark shrink-0 whitespace-nowrap font-sans flex items-center justify-center">Search</button> */}
              </form>

              {suggestions && suggestions.length > 0 && isScrolled && (
                <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-white rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-slate-200 z-[100] overflow-hidden">
                  <div className="px-4 py-2.5 pb-1.5 text-[0.7rem] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Quick Matches
                  </div>
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2.5 px-4 cursor-pointer transition-colors hover:bg-slate-50"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(s);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(s);
                      }}
                    >
                      <div className="w-[30px] h-[30px] bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        {s.type === 'city' && <PinIco />}
                        {s.type === 'locality' && <LocIco />}
                        {s.type === 'project' && <IconFlats />}
                        {s.type === 'property' && <SearchIco />}
                        {s.type === 'type' && <IconFlats />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.88rem] font-medium text-slate-900">{s.text}</span>
                        <span className="text-[0.7rem] text-slate-400 capitalize mt-px">
                          {s.type === 'property'
                            ? 'Property Name'
                            : s.type === 'type'
                              ? 'Property Type'
                              : s.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            className="md:hidden flex items-center justify-center w-[38px] h-[38px] rounded-lg border-[1.5px] border-slate-200 bg-white text-slate-500 p-0 transition-colors ml-auto hover:border-primary hover:text-primary shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? '' : <MenuIco />}
          </button>

          {/* Right Actions */}
          <div className="hidden md:flex flex-none items-center justify-end gap-[10px]">
            <Link
              to="/properties"
              className={`flex items-center gap-[6px] px-[14px] py-[7px] bg-primary text-white font-semibold text-[0.82rem] rounded-sm transition-all duration-200 hover:bg-primary-dark hover:-translate-y-px whitespace-nowrap no-underline ${isScrolled ? 'hidden' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BuyIcon /> Buy Properties
            </Link>
            {isAuthenticated && !isSellerUserType(userDetails?.type) && (
              <Link
              to="/subscription"
              className="flex items-center gap-[6px] px-[14px] py-[7px] bg-primary text-white font-semibold text-[0.82rem] transition-all duration-200 hover:bg-primary-dark hover:-translate-y-px whitespace-nowrap no-underline"
            >
              Post Property
            </Link>
            )}

            {isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="w-[34px] h-[34px] rounded-lg border-[1.5px] border-slate-200 bg-white text-slate-500 p-0 transition-all hover:border-primary hover:text-primary hover:bg-primary/10 flex items-center justify-center cursor-pointer group relative"
                  title="Notifications"
                >
                  <BellIco
                    className={`w-4.5 h-4.5 transition-transform group-hover:rotate-[15deg] ${unreadCount > 0 ? 'text-primary' : ''}`}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary border-2 border-white animate-pulse" />
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute top-[calc(100%+10px)] right-0 w-[320px] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[500] animate-in slide-in-from-top-2">
                    <div className="p-3.5 px-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-md font-bold text-slate-900  m-0">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[0.65rem] font-bold text-primary hover:underline uppercase tracking-tight bg-transparent border-none cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notificationList.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                          {notificationList.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => markAsRead(notif._id)}
                              className={`p-3.5 px-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!notif.isRead ? 'bg-primary/10' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${notif.type === 'property_verification' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                                >
                                  {notif.type === 'property_verification' ? '✓' : '🔔'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-0.5">
                                    <h4
                                      className={`text-[0.8rem] font-bold truncate m-0 ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}
                                    >
                                      {notif.title}
                                    </h4>
                                    <span className="text-[0.65rem] text-slate-400 font-medium whitespace-nowrap">
                                      {getTimeAgo(notif.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[0.72rem] text-slate-500 line-clamp-2 leading-relaxed m-0">
                                    {notif.message}
                                  </p>
                                  <button
                                    onClick={(e) => handleDeleteNotification(notif._id, e)}
                                    className="absolute right-2 bottom-2 text-[0.65rem] font-bold text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center px-6">
                          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                            <BellIco className="w-5 h-5 text-slate-200" />
                          </div>
                          <p className="text-[0.75rem] text-slate-400 font-medium m-0">
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-50/50 text-center border-t border-slate-50">
                      <button
                        className="text-[0.65rem] font-semibold text-slate-400 uppercase hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                        onClick={() => navigate('/profile/notifications')}
                      >
                        View All Activity
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="bg-transparent border-none cursor-pointer p-[2px] flex items-center group"
                  title="My Profile"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="w-[34px] h-[34px] bg-primary text-white text-[0.88rem] font-bold rounded-full flex items-center justify-center shrink-0 transition-shadow duration-200 group-hover:shadow-[0_0_0_3px_rgba(249,180,27,0.25)] overflow-hidden">
                    {userDetails.avatar ? (
                      <img
                        src={userDetails.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userDetails.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute top-[calc(100%+10px)] right-0 w-[220px] bg-white rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-[#e2e8f0] overflow-hidden z-[500] animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 p-3.5 px-4 bg-[#fafafa] border-b border-[#e2e8f0]">
                      <div className="w-[36px] h-[36px] bg-primary text-white text-[0.9rem] font-bold rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                        {userDetails.avatar ? (
                          <img
                            src={userDetails.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          userDetails.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[0.9rem] font-semibold text-slate-900 leading-none mb-[3px]">
                          {userDetails.name}
                        </div>
                        <div className="text-[0.72rem] text-slate-400 truncate max-w-[130px]">
                          {userDetails.email}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile/profile"
                      className="flex items-center gap-3 p-3 px-4 text-[0.9rem] font-medium text-slate-600 font-outfit transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 w-full no-underline"
                      onMouseEnter={preloadUserPanelPage}
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg
                        className="w-4 h-4 text-slate-400 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/profile/settings"
                      className="flex items-center gap-3 p-3 px-4 text-[0.9rem] font-medium text-slate-600 font-outfit transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 w-full no-underline"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg
                        className="w-4 h-4 text-slate-400 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.07 4.93l-1.41 1.41M21 12h-2M19.07 19.07l-1.41-1.41M12 21v-2M4.93 19.07l1.41-1.41M3 12h2M4.93 4.93l1.41 1.41" />
                      </svg>
                      Settings
                    </Link>
                    <div className="h-px bg-[#e2e8f0] my-1 mx-0" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 px-4 text-[0.9rem] font-medium text-red-500 font-outfit transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 w-full bg-transparent border-none cursor-pointer text-left"
                    >
                      <svg
                        className="w-4 h-4 text-red-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className={`flex items-center gap-[7px] py-[7px] px-[18px] border-[1.5px] rounded-lg text-[0.85rem] font-semibold bg-transparent backdrop-blur-[4px] transition-all duration-300 whitespace-nowrap group focus:outline-none no-underline leading-normal cursor-pointer ${!isScrolled && isHomePage ? 'border-black text-black hover:bg-white/10 hover:border-white' : 'border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]'}`}
              >
                <span className="flex items-center leading-none">
                  <svg
                    className="w-4 h-4 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                Login / Register
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 w-[300px] h-screen bg-white flex flex-col transition-all duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] shadow-[-8px_0_30px_rgba(0,0,0,0.1)] z-[2000] overflow-y-auto ${isMenuOpen ? 'right-0 visible' : '-right-[320px] invisible'}`}
      >
        <div className="flex w-full items-center justify-between p-3.5 px-4 border-b border-slate-200 bg-white shrink-0 sticky top-0 z-[2]">
          <Link
            to="/"
            className="flex items-center gap-2 font-outfit text-xl font-bold text-slate-900"
            onClick={() => setIsMenuOpen(false)}
          >
            <LogoIcon
              className="h-9 w-9 shrink-0 text-[#023526]"
            />
            <span>
              Yukthi<span className="text-primary"> Properties</span>
            </span>
          </Link>
          <button
            className="bg-slate-50 border-none p-1.5 rounded-lg text-slate-600 cursor-pointer flex items-center justify-center transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <CloseIco />
          </button>
        </div>

        {isPastHero && (
          <div className="p-3.5 px-4 border-b border-slate-200" ref={mobileSearchRef}>
            <SearchBar isNavbar={true} />
          </div>
        )}

        {/* <div className="flex-1 flex flex-col py-1.5">
          {NAV_LINKS.map(link => (
            <Link key={link.label} to={link.path} className="flex items-center justify-between p-[13px] px-[18px] text-[0.9rem] font-medium text-slate-600 border-b border-slate-50 transition-colors hover:bg-primary/10 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              {link.label}
              <svg className="w-[15px] h-[15px] text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          ))}
        </div> */}

        <div className="flex flex-col gap-2 p-4 border-t border-slate-200 bg-slate-50">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 py-1 pb-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white text-base font-bold flex items-center justify-center shrink-0 overflow-hidden">
                  {userDetails?.avatar ? (
                    <img
                      src={userDetails.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userDetails.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-[0.9rem] font-semibold text-slate-900">
                    {userDetails.name}
                  </div>
                  <div className="text-[0.75rem] text-slate-400 mt-[1px]">
                    {userDetails.email || 'Member'}
                  </div>
                </div>
              </div>
              <Link
                to="/profile"
                className="flex items-center justify-center gap-2 p-2.5 px-4 border-[1.5px] border-slate-200 rounded-lg text-[0.88rem] font-medium text-slate-600 bg-white font-sans transition-colors hover:border-primary hover:text-primary-dark w-full"
                onMouseEnter={preloadUserPanelPage}
                onClick={() => setIsMenuOpen(false)}
              >
                View Profile
              </Link>
              <button
                className="flex items-center justify-center gap-2 p-2.5 px-4 border-[1.5px] border-slate-200 rounded-lg text-[0.88rem] font-medium text-slate-600 bg-white font-sans transition-colors hover:border-primary hover:text-primary-dark w-full"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="flex items-center justify-center gap-2 p-2.5 px-4 border-[1.5px] border-slate-200 rounded-lg text-[0.88rem] font-medium text-slate-600 bg-white font-sans transition-colors hover:border-primary hover:text-primary-dark w-full cursor-pointer"
              onClick={() => {
                setIsMenuOpen(false);
                openLoginModal();
              }}
            >
              Login
            </button>
          )}

          <Link
            to="/properties"
            className="flex items-center justify-center gap-2 p-2.5 px-4 bg-primary text-white rounded-sm text-[0.88rem] font-semibold font-sans transition-colors hover:bg-primary-dark border-none w-full mt-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <BuyIcon /> Buy Properties
          </Link>
          {isAuthenticated && !isSellerUserType(userDetails?.type) && (
            <Link
            to="/subscription"
            className="flex items-center justify-center gap-2 p-2.5 px-4 bg-primary text-white rounded-sm text-[0.88rem] font-semibold font-sans transition-colors hover:bg-primary-dark border-none w-full"
            onClick={() => setIsMenuOpen(false)}
          >
            Post Property
          </Link>
          )}
        </div>
      </div>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[1499]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
