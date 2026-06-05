import { API_URL } from './api';

export const pageService = {
  // Get all pages
  async getAllPages(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/pages${queryString ? `?${queryString}` : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  },

  // Get fixed pages only
  async getFixedPages(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/pages/fixed${queryString ? `?${queryString}` : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch fixed pages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fixed pages:', error);
      throw error;
    }
  },

  // Get page by slug
  async getPageBySlug(slug) {
    try {
      const response = await fetch(`${API_URL}/pages/slug/${slug}`);

      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      throw error;
    }
  },

  // Get pages by type
  async getPagesByType(type, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_URL}/pages/type/${type}${queryString ? `?${queryString}` : ''}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pages by type');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pages by type:', error);
      throw error;
    }
  },

  // Get page list
  async getPageList(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/pages/list${queryString ? `?${queryString}` : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch page list');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching page list:', error);
      throw error;
    }
  },

  // Search pages
  async searchPages(query, params = {}) {
    try {
      const searchParams = new URLSearchParams({ q: query, ...params }).toString();
      const response = await fetch(`${API_URL}/pages/search?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to search pages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching pages:', error);
      throw error;
    }
  },
};
