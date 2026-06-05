import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pageService } from '../service/pageService';

export default function Page() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await pageService.getPageBySlug(slug);

        if (response.success && response.data) {
          setPage(response.data);
        } else {
          setError('Page not found');
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <span className="ml-2 text-slate-500">Loading page...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <a href="/" className="hover:text-slate-700">
                Home
              </a>
              <span className="text-slate-400">/</span>
              <span className="text-slate-900 font-medium">{page.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">{page.title}</h1>

            {/* Render content with proper HTML */}
            <div
              className="text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
