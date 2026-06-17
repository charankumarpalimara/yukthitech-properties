import { create } from 'zustand';
import { API_URL, apiClient } from '../service/api';
import { slugOrId } from '../utils/slugOrId';

const getPropertyShareUrl = (property) => {
  const segment = slugOrId(property);
  if (!segment) return window.location.href;
  return `${window.location.origin}/property/${segment}`;
};

const resolvePropertyId = (propertyOrId) => {
  if (propertyOrId == null) return null;
  if (typeof propertyOrId === 'string' || typeof propertyOrId === 'number') {
    return String(propertyOrId);
  }
  const id = propertyOrId.id || propertyOrId._id;
  return id != null ? String(id) : null;
};

const resolveUserId = (explicitUserId) => {
  if (explicitUserId) return explicitUserId;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return undefined;
    const user = JSON.parse(raw);
    return user?._id || user?.id;
  } catch {
    return undefined;
  }
};

export const selectShareCount =
  (propertyOrId, fallback = 0) =>
  (state) => {
    const id = resolvePropertyId(propertyOrId);
    if (!id) return fallback;
    const stored = state.shareCounts[id];
    return stored != null ? stored : fallback;
  };

export const usePropertiesStore = create((set, get) => ({
  wishlist: [],
  wishlistItems: [],
  wishlistLoading: false,
  shareCounts: {},
  shareLoading: false,
  error: null,

  setWishlist: (wishlist) => set({ wishlist }),
  setWishlistItems: (wishlistItems) => set({ wishlistItems }),

  setShareCount: (propertyId, count) => {
    const id = resolvePropertyId(propertyId);
    if (!id || count == null) return;
    set((state) => ({
      shareCounts: { ...state.shareCounts, [id]: count },
    }));
  },

  mergeShareCountsFromProperties: (properties) => {
    if (!Array.isArray(properties) || properties.length === 0) return;
    const patch = {};
    properties.forEach((p) => {
      const id = resolvePropertyId(p);
      if (id != null && typeof p.shareCount === 'number') {
        patch[id] = p.shareCount;
      }
    });
    if (Object.keys(patch).length === 0) return;
    set((state) => ({
      shareCounts: { ...state.shareCounts, ...patch },
    }));
  },

  fetchShareCount: async (propertyId) => {
    const id = resolvePropertyId(propertyId);
    if (!id) return 0;

    set({ shareLoading: true, error: null });
    try {
      const res = await apiClient(`${API_URL}/share/${id}/count`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load share count');

      const count = json.shareCount ?? 0;
      set((state) => ({
        shareCounts: { ...state.shareCounts, [id]: count },
        shareLoading: false,
      }));
      return count;
    } catch (e) {
      set({ error: e.message, shareLoading: false });
      return get().shareCounts[id] ?? 0;
    }
  },

  recordShare: async (propertyOrId, userId) => {
    const propertyId = resolvePropertyId(propertyOrId);
    if (!propertyId) return null;

    try {
      const uid = resolveUserId(userId);
      const res = await apiClient(`${API_URL}/share/${propertyId}`, {
        method: 'POST',
        body: JSON.stringify(uid ? { userId: uid } : {}),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to record share');

      const count = json.shareCount;
      if (count != null) {
        set((state) => ({
          shareCounts: { ...state.shareCounts, [propertyId]: count },
        }));
      }
      return count ?? null;
    } catch (e) {
      set({ error: e.message });
      return null;
    }
  },

  shareProperty: async (property, { onCopied } = {}) => {
    const title = property?.title || property?.projectName || 'Property';
    const shareUrl = getPropertyShareUrl(property);
    const shareData = {
      title,
      text: `Check out this property: ${title} — ${property?.price} in ${property?.loc}`,
      url: shareUrl,
    };

    let shared = false;

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        if (typeof onCopied === 'function') {
          onCopied(true);
          setTimeout(() => onCopied(false), 2000);
        }
        shared = true;
      } catch {
        console.warn('Clipboard write failed');
      }
    }

    if (shared) {
      await get().recordShare(property);
    }

    return shared;
  },

  fetchWishlist: async (userId) => {
    if (!userId || !localStorage.getItem('token')) return;
    set({ wishlistLoading: true, error: null });
    try {
      const res = await apiClient(`${API_URL}/wishlist/${userId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const items = json.data || [];
      const ids = items.map((item) => item.propertyId?._id || item.propertyId);

      set({ wishlistItems: items, wishlist: ids, wishlistLoading: false });
    } catch (e) {
      set({ error: e.message, wishlistLoading: false });
    }
  },

  toggleWishlist: async (propertyId, userId) => {
    if (!userId || !localStorage.getItem('token')) return false;
    try {
      const res = await apiClient(`${API_URL}/wishlist/toggle/${propertyId}`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const isWishlisted = json.isWishlisted;
      const { wishlist, wishlistItems } = get();

      if (isWishlisted) {
        set({
          wishlist: [...wishlist, propertyId],
        });
      } else {
        set({
          wishlist: wishlist.filter((id) => id !== propertyId),
          wishlistItems: wishlistItems.filter(
            (item) => (item.propertyId?._id || item.propertyId) !== propertyId
          ),
        });
      }
      return true;
    } catch (e) {
      set({ error: e.message });
      return false;
    }
  },

  toggleWishlistLocal: (propertyId) => {
    const { wishlist } = get();
    const isPresent = wishlist.includes(propertyId);
    set({
      wishlist: isPresent ? wishlist.filter((id) => id !== propertyId) : [...wishlist, propertyId],
    });
  },
}));
