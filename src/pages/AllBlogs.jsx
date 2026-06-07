import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { API_URL, apiClient } from '../service/api';
import { ArrowR } from '../data/icons';
import { HOME_BLOG_POSTS, mapApiBlogToHomeShape, sortBlogPostsByPriority } from '../data/homeBlogs';
import { BlogImage } from '../components/HomeScreen/Blogs';

function useBlogPosts() {
  const [posts, setPosts] = useState(HOME_BLOG_POSTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiClient(`${API_URL}/blogs?limit=30`);
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.success && Array.isArray(json.data)) {
          const mapped = json.data.map(mapApiBlogToHomeShape).filter(Boolean);
          if (mapped.length > 0) setPosts(mapped);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts: sortBlogPostsByPriority(posts), loading };
}

function ArticleCard({ post }) {
  if (!post) return null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card">
      <Link to={`/blog/${post.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <BlogImage
          src={post.imageCard || post.image}
          thumb={post.imageThumb}
          alt={post.title}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{post.category}</span>
        </div>

        <h3 className="m-0 mt-2 line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
          <Link to={`/blog/${post.slug}`} className="no-underline text-inherit">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? (
          <p className="m-0 mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
        ) : (
          <span className="flex-1" />
        )}

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span className="truncate">{post.author || `${post.readMinutes || ''} min`}</span>
          <Link
            to={`/blog/${post.slug}`}
            className="shrink-0 font-semibold text-primary no-underline hover:text-primary-900"
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}

function AllBlogsSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="mb-6 h-5 w-32 rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="space-y-2 p-5">
              <div className="h-3 w-16 rounded bg-slate-200" />
              <div className="h-5 w-full rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AllBlogs() {
  const { posts, loading } = useBlogPosts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return Array.from(set)
      .filter((cat) => cat.toLowerCase() !== 'general')
      .sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [post.title, post.excerpt, post.category, post.author]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, activeCategory, query]);

  const sectionLabel =
    activeCategory === 'all'
      ? 'All articles'
      : categories.includes(activeCategory)
        ? activeCategory
        : 'Articles';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1350px] px-[22px] py-6 sm:py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 no-underline transition-colors hover:text-primary"
          >
            <ArrowR className="h-4 w-4 rotate-180" />
            Back to home
          </Link>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Yukthi Reads</p>
              <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                All Articles
              </h1>
              <p className="m-0 mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Browse every guide, checklist, and market insight — organised by topic for easy reading.
              </p>
            </div>

            <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 lg:max-w-sm">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles…"
                className="h-full w-full border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 border-b-2 px-1 pb-2 text-sm font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              General
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 border-b-2 px-1 pb-2 text-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1350px] px-[22px] py-8 sm:py-10 lg:py-12">
        {loading ? (
          <AllBlogsSkeleton />
        ) : !posts.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="m-0 text-base font-medium text-slate-600">No blogs available yet.</p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:text-primary-900"
            >
              Back to home
              <ArrowR className="h-4 w-4" />
            </Link>
          </div>
        ) : !filtered.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="m-0 text-base font-semibold text-slate-800">No articles match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setQuery('');
              }}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <section aria-label={sectionLabel}>
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <h2 className="m-0 text-lg font-bold text-slate-900 sm:text-xl">{sectionLabel}</h2>
                <p className="m-0 mt-1 text-sm text-slate-500">
                  {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {filtered.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
