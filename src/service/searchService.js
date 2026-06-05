import { API_URL } from './api';
import { appendBhkToSearchParams } from '../utils/bhkFilter';

/**
 * Search properties with filters
 */
export const searchProperties = async (searchParams) => {
  try {
    const queryParams = new URLSearchParams();

    // Add search parameters
    if (searchParams.search) queryParams.append('search', searchParams.search);
    if (searchParams.city) queryParams.append('city', searchParams.city);
    if (searchParams.propertyType) queryParams.append('propertyType', searchParams.propertyType);
    if (searchParams.status) queryParams.append('status', searchParams.status);
    const possessionStatuses = searchParams.propertyStatus ?? searchParams.possessionStatus;
    if (possessionStatuses) {
      const list = Array.isArray(possessionStatuses)
        ? possessionStatuses
        : String(possessionStatuses).split(',');
      list
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          queryParams.append('propertyStatus', s);
        });
    }
    if (searchParams.page) queryParams.append('page', searchParams.page);
    if (searchParams.limit) queryParams.append('limit', searchParams.limit);

    // Price filters
    if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);

    // BHK filter — one query param per value (bhk=2&bhk=3)
    if (searchParams.bhk?.length > 0) {
      appendBhkToSearchParams(queryParams, searchParams.bhk);
    }

    // Additional Filters
    if (searchParams.vastuCompliant === true || searchParams.vastuCompliant === 'true') {
      queryParams.append('vastuCompliant', 'true');
    }
    if (searchParams.facing) queryParams.append('facing', searchParams.facing);
    if (searchParams.minArea) queryParams.append('minArea', searchParams.minArea);
    if (searchParams.maxArea) queryParams.append('maxArea', searchParams.maxArea);
    if (searchParams.propertyTypes) queryParams.append('propertyTypes', searchParams.propertyTypes);

    // Sorting
    if (searchParams.sortBy) queryParams.append('sortBy', searchParams.sortBy);

    const response = await fetch(`${API_URL}/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search service error:', error);
    throw error;
  }
};

/**
 * Get search suggestions
 */
export const getSearchSuggestions = async (query) => {
  try {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    const response = await fetch(
      `${API_URL}/search/suggestions?search=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = Array.isArray(data?.suggestions)
      ? data.suggestions
      : Array.isArray(data?.data?.suggestions)
        ? data.data.suggestions
        : Array.isArray(data?.data)
          ? data.data
          : [];
    return { ...data, suggestions };
  } catch (error) {
    console.error('Suggestions service error:', error);
    return { suggestions: [] };
  }
};

/**
 * Get properties by category
 */
export const getPropertiesByCategory = async (categoryId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((value) => queryParams.append(key, value));
        } else {
          queryParams.append(key, filters[key]);
        }
      }
    });

    const response = await fetch(
      `${API_URL}/properties/categories/${categoryId}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Category properties service error:', error);
    throw error;
  }
};

/**
 * Get properties by city (Strict)
 */
export const getPropertiesByCity = async (cityName, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((value) => queryParams.append(key, value));
        } else {
          queryParams.append(key, filters[key]);
        }
      }
    });

    const response = await fetch(
      `${API_URL}/properties/city/${encodeURIComponent(cityName)}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('City properties service error:', error);
    throw error;
  }
};

/**
 * Get nearby properties (Geo-first)
 */
export const getNearbyProperties = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((value) => queryParams.append(key, value));
        } else {
          queryParams.append(key, filters[key]);
        }
      }
    });

    const response = await fetch(`${API_URL}/properties/nearby?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Nearby properties service error:', error);
    throw error;
  }
};

/**
 * Get property details by ID
 */
export const getPropertyById = async (propertyId) => {
  try {
    const response = await fetch(`${API_URL}/properties/${propertyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Property details service error:', error);
    throw error;
  }
};
