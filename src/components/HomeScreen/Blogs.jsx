/**
 * Home blog section + shared BlogImage.
 * Full listing pages: pages/Blogs.jsx (/blogs), pages/AllBlogs.jsx (/all-blogs)
 * Detail screen: BlogPost.jsx (/blog/:slug)
 */
import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HOME_BLOG_POSTS,
  mapApiBlogToHomeShape,
  sortBlogPostsByPriority,
} from '../../data/homeBlogs';
import { ArrowR } from '../../data/icons';
import { API_URL, apiClient } from '../../service/api';

export const BlogImage = memo(function BlogImage({
  src,
  thumb,
  alt = '',
  className = '',
  loading = 'lazy',
  sizes,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const resolvedSizes = sizes || (thumb ? '(max-width: 1024px) 240px, 720px' : undefined);
  const resolvedSrcSet = thumb ? `${thumb} 240w, ${src} 720w` : undefined;

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {!isLoaded && !hasError && thumb && (
        <img
          src={thumb}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover blur-md scale-[1.05]"
        />
      )}
      {!isLoaded && !hasError && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
          No image
        </div>
      ) : (
        <img
          src={src}
          srcSet={resolvedSrcSet}
          sizes={resolvedSizes}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-all duration-[700ms] ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          {...props}
        />
      )}
    </div>
  );
});

import './Blogs.css';

export function HomeBlogsSkeleton() {
  return (
    <div className="home-blog-premium animate-pulse" aria-hidden>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-slate-800" />
          <div className="h-8 w-56 rounded bg-slate-800" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-800" />
        </div>
        <div className="h-11 w-36 rounded-full bg-slate-800 shrink-0" />
      </div>
      <div className="blog-accordion-container">
        {[1, 2, 3].map((i) => (
          <div key={i} className="blog-skeleton-card" />
        ))}
      </div>
    </div>
  );
}

/**
 * Home page blog preview with dynamic interactive accordion storystrip design.
 */
export function HomeBlogs({ posts: postsFromHome = [], homeLoading = false }) {
  const [posts, setPosts] = useState(postsFromHome?.length ? postsFromHome : HOME_BLOG_POSTS);

  useEffect(() => {
    if (postsFromHome?.length) {
      setPosts(postsFromHome);
    }
  }, [postsFromHome]);

  useEffect(() => {
    if (homeLoading || postsFromHome?.length) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiClient(`${API_URL}/blogs?limit=8`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success || !Array.isArray(json.data)) return;
        const mapped = json.data.map(mapApiBlogToHomeShape).filter(Boolean);
        if (mapped.length > 0) setPosts(mapped);
      } catch (e) {
        if (!cancelled) console.warn('HomeBlogs: API unavailable, using static posts', e);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [homeLoading, postsFromHome]);

  const items = sortBlogPostsByPriority(posts).slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="home-blog-premium" aria-label="Property articles">
      <div className="home-blog-premium__panel">
        {/* Glow Effects */}
        <div className="blog-glow-orb blog-glow-orb--1" aria-hidden />
        <div className="blog-glow-orb blog-glow-orb--2" aria-hidden />
        <div className="blog-grid-mesh" aria-hidden />

        {/* Premium Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 relative z-10">
          <div>
            <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">
              Yukthi Reads &amp; insights
            </span>
            <h2 className="m-0 text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Know Before You Buy
            </h2>
            <p className="mt-2 max-w-xl text-xs md:text-sm font-medium leading-relaxed text-slate-300/80">
              Guides, price trends, Vastu checklists, and home loan advice for smart buyers in Hyderabad
            </p>
          </div>
          <Link to="/all-blogs" className="blog-view-all-premium shrink-0">
            View all articles
            <ArrowR className="blog-view-all-premium__icon" />
          </Link>
        </div>

        {/* Interactive Accordion Storystrip */}
        <div className="blog-accordion-container">
          {items.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="blog-accordion-card">
              <div className="blog-accordion-card__bg">
                <BlogImage
                  src={post.imageLead || post.image}
                  thumb={post.imageCard}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="blog-accordion-card__overlay" />
              <div className="blog-accordion-card__content">
                <div>
                  <span className="blog-card__category">{post.category}</span>
                  <h3 className="blog-card__title line-clamp-2">{post.title}</h3>
                  <p className="blog-accordion-card__excerpt">{post.excerpt}</p>
                </div>
                <div className="blog-card__meta">
                  <span className="blog-card__author">By {post.author}</span>
                  <span className="blog-btn-action">
                    Read Story
                    <span className="blog-btn-action__arrow-circle">
                      <ArrowR className="blog-btn-action__icon" />
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
