import { useState, useEffect } from 'react';
import { pageService } from '../service/pageService';

export function usePageData(slug) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await pageService.getPageBySlug(slug);
        if (isMounted) {
          if (
            response &&
            response.success &&
            response.data &&
            response.data.status === 'published'
          ) {
            setPageData(response.data);
            setError(null);
          } else {
            setError('Page not found');
            setPageData(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load page data');
          setPageData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (pageData) {
      const originalTitle = document.title;
      document.title = pageData.metaTitle || pageData.title;

      let metaDescriptionEl = document.querySelector('meta[name="description"]');
      let originalDescription = metaDescriptionEl ? metaDescriptionEl.getAttribute('content') : '';

      if (pageData.metaDescription) {
        if (!metaDescriptionEl) {
          metaDescriptionEl = document.createElement('meta');
          metaDescriptionEl.setAttribute('name', 'description');
          document.head.appendChild(metaDescriptionEl);
        }
        metaDescriptionEl.setAttribute('content', pageData.metaDescription);
      }

      let metaKeywordsEl = document.querySelector('meta[name="keywords"]');
      let originalKeywords = metaKeywordsEl ? metaKeywordsEl.getAttribute('content') : '';

      const keywordsString = Array.isArray(pageData.metaKeywords)
        ? pageData.metaKeywords.join(', ')
        : '';
      if (keywordsString) {
        if (!metaKeywordsEl) {
          metaKeywordsEl = document.createElement('meta');
          metaKeywordsEl.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywordsEl);
        }
        metaKeywordsEl.setAttribute('content', keywordsString);
      }

      return () => {
        document.title = originalTitle;
        if (metaDescriptionEl) {
          if (originalDescription) {
            metaDescriptionEl.setAttribute('content', originalDescription);
          } else {
            metaDescriptionEl.remove();
          }
        }
        if (metaKeywordsEl) {
          if (originalKeywords) {
            metaKeywordsEl.setAttribute('content', originalKeywords);
          } else {
            metaKeywordsEl.remove();
          }
        }
      };
    }
  }, [pageData]);

  return { pageData, loading, error };
}
