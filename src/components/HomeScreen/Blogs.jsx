/**
 * Blogs — /blogs listing + home section exports.
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
import HomeSectionHeader from './HomeSectionHeader';
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


function FeaturedBlogCard({ post }) {
  if (!post) return null;
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all md:grid md:grid-cols-[1.15fr_1fr] md:items-stretch">
      <Link
        to={`/blog/${post.slug}`}
        className="relative block min-h-[240px] overflow-hidden md:min-h-[320px] md:h-full"
      >
        <BlogImage
          src={post.imageHero || post.image}
          thumb={post.imageLead}
          alt={post.title}
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </Link>
      <div className="flex h-full min-h-[220px] flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 line-clamp-4 group-hover:text-primary transition-colors">
            <Link to={`/blog/${post.slug}`} className="no-underline text-inherit">
              {post.title}
            </Link>
          </h2>
          <p className="mt-4 text-sm text-slate-600">{post.excerpt}</p>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-5">
          <span className="text-xs text-slate-400">By {post.author}</span>
          <Link
            to={`/blog/${post.slug}`}
            className="text-sm font-semibold text-primary hover:text-primary-dark no-underline"
          >
            Read article <ArrowR className="inline h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogGridCard({ post }) {
  if (!post) return null;
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden">
      <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-slate-50">
        <BlogImage
          src={post.imageCard || post.image}
          thumb={post.imageThumb}
          alt={post.title}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-[11px] font-bold uppercase text-primary">{post.category}</span>
        <h3 className="mt-2 text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`} className="no-underline text-inherit">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-xs text-slate-500 line-clamp-3 flex-1">{post.excerpt}</p>
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
          <span className="text-[10px] text-slate-400">By {post.author}</span>
          <Link
            to={`/blog/${post.slug}`}
            className="text-xs font-semibold text-primary hover:text-primary-dark no-underline"
          >
            Read story
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogsPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10 animate-pulse" aria-hidden>
      <div className="mx-auto max-w-[1350px] px-[22px]">
        <div className="h-4 w-40 rounded bg-slate-200 mb-8" />
        <div className="space-y-3 mb-10">
          <div className="h-3 w-36 rounded bg-slate-200" />
          <div className="h-10 w-80 max-w-full rounded bg-slate-200" />
          <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden mb-12">
          <div className="aspect-[16/9] bg-slate-200 md:aspect-auto md:min-h-[380px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-5 w-full rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** /blogs — full article list (API + static fallback) */
export default function Blogs() {
  const [posts, setPosts] = useState(HOME_BLOG_POSTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiClient(`${API_URL}/blogs?limit=24`);
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.success && Array.isArray(json.data)) {
          const mapped = json.data.map(mapApiBlogToHomeShape).filter(Boolean);
          if (mapped.length > 0) setPosts(mapped);
        }
      } catch (e) {
        if (!cancelled) console.warn('Blogs page: API unavailable, using static posts', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <BlogsPageSkeleton />;

  const sorted = sortBlogPostsByPriority(posts);
  const [featured, ...rest] = sorted;

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-[1350px] px-[22px]">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark no-underline transition-colors group"
          >
            <ArrowR className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>

        <header className="mb-10 sm:mb-12">
          <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">
            Yukthi Reads &amp; Insights
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 m-0 tracking-tight">
            Latest Articles &amp; Guides
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mt-3 mb-0 leading-relaxed">
            Expert checklists, market trends, and finance tips for home buyers in Hyderabad.
          </p>
        </header>

        {!sorted.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="m-0 text-slate-600 font-medium">No articles published yet.</p>
            <Link
              to="/"
              className="inline-flex mt-4 text-sm font-semibold text-primary no-underline hover:text-primary-dark"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <>
            {featured && (
              <section className="mb-12 sm:mb-14" aria-label="Featured article">
                <span className="text-[11px] font-bold uppercase text-primary block mb-3 tracking-wide">
                  Featured Story
                </span>
                <FeaturedBlogCard post={featured} />
              </section>
            )}

            {rest.length > 0 && (
              <section
                className="border-t border-slate-200/80 pt-10 sm:pt-12"
                aria-label="Latest articles"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                  <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-900">
                    Latest Guides
                  </h2>
                  <p className="m-0 text-sm text-slate-500">{rest.length} articles</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {rest.map((post) => (
                    <BlogGridCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
