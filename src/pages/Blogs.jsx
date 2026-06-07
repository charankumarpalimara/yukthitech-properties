import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Filter, Search, Sparkles } from 'lucide-react';
import { API_URL, apiClient } from '../service/api';
import { ArrowR } from '../data/icons';
import { HOME_BLOG_POSTS, mapApiBlogToHomeShape, sortBlogPostsByPriority } from '../data/homeBlogs';
import { BlogImage } from '../components/HomeScreen/Blogs';

export { HomeBlogs, HomeBlogsSkeleton, BlogImage } from '../components/HomeScreen/Blogs';

function useBlogPosts() {
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

  return { posts: sortBlogPostsByPriority(posts), loading };
}

function EditorialCard({ post, featured = false }) {
  if (!post) return null;

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:shadow-card-hover ${
        featured
          ? 'border-gold/30 shadow-[0_24px_60px_-24px_rgba(2,53,38,0.35)]'
          : 'border-slate-200/80 shadow-sm hover:-translate-y-0.5 hover:border-primary/20'
      }`}
    >
      <div className={`flex flex-col ${featured ? 'lg:flex-row' : 'md:flex-row'}`}>
        <Link
          to={`/blog/${post.slug}`}
          className={`relative shrink-0 overflow-hidden bg-slate-100 ${
            featured ? 'min-h-[220px] lg:w-[48%] lg:min-h-[320px]' : 'min-h-[200px] md:w-[240px] lg:w-[300px]'
          }`}
        >
          <BlogImage
            src={featured ? post.imageHero || post.image : post.imageCard || post.image}
            thumb={featured ? post.imageLead : post.imageThumb}
            alt={post.title}
            loading={featured ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {featured ? (
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
              Featured
            </span>
          ) : null}
        </Link>

        <div className={`flex flex-1 flex-col justify-between ${featured ? 'p-6 sm:p-8 lg:p-10' : 'p-5 sm:p-6'}`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{post.category}</span>
            <h2
              className={`m-0 mt-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary ${
                featured ? 'text-2xl sm:text-3xl line-clamp-3' : 'text-lg sm:text-xl line-clamp-2'
              }`}
            >
              <Link to={`/blog/${post.slug}`} className="no-underline text-inherit">
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p
                className={`m-0 mt-3 leading-relaxed text-slate-500 ${
                  featured ? 'text-sm sm:text-base line-clamp-4' : 'text-sm line-clamp-3'
                }`}
              >
                {post.excerpt}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
              {post.author ? <span>{post.author}</span> : null}
              {post.readMinutes ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gold/80" />
                  {post.readMinutes} min read
                </span>
              ) : null}
            </div>
            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline transition-colors hover:text-primary-900"
            >
              Read article
              <ArrowR className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function CompactArticleLink({ post, rank }) {
  if (!post) return null;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 no-underline transition-colors hover:border-primary/10 hover:bg-primary/[0.03]"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-xs font-extrabold text-primary">
        {rank}
      </span>
      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold">{post.category}</span>
        <p className="m-0 mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">
          {post.title}
        </p>
      </div>
    </Link>
  );
}

function BlogsPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="min-h-[180px] rounded-2xl bg-slate-200 sm:min-h-[220px]" />
      <div className="h-12 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col md:flex-row">
                <div className="min-h-[200px] bg-slate-200 md:w-[240px]" />
                <div className="flex-1 space-y-3 p-5">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="h-6 w-full rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden h-80 rounded-2xl bg-slate-200 lg:block" />
      </div>
    </div>
  );
}

export default function Blogs() {
  const { posts, loading } = useBlogPosts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
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

  const [featured, ...rest] = filtered;
  const sidebarPosts = rest.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-br from-[#011f16] via-primary to-[#012319] px-[22px] py-10 sm:py-12">
        <div className="pointer-events-none absolute top-[-20%] right-[-8%] h-[360px] w-[360px] rounded-full bg-gold/10 blur-[90px]" aria-hidden />
        <div className="pointer-events-none absolute bottom-[-30%] left-[-5%] h-[280px] w-[280px] rounded-full bg-white/5 blur-[70px]" aria-hidden />

        <div className="relative z-10 mx-auto max-w-[1350px]">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/70 no-underline transition-colors hover:text-gold"
          >
            <ArrowR className="h-4 w-4 rotate-180" />
            Back to home
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                Yukthi Reads
              </span>
              <h1 className="m-0 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                Latest Articles &amp; Guides
              </h1>
              <p className="m-0 mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                Expert checklists, market trends, finance tips, and locality insights for home buyers in
                Hyderabad.
              </p>
            </div>

            {!loading && posts.length > 0 ? (
              <div className="flex shrink-0 items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur-sm">
                  <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-white/50">Articles</p>
                  <p className="m-0 mt-1 text-3xl font-extrabold text-gold">{posts.length}</p>
                </div>
                <Link
                  to="/all-blogs"
                  className="inline-flex h-full min-h-[76px] items-center gap-2 rounded-2xl bg-gold px-5 text-sm font-bold text-primary no-underline transition-colors hover:bg-gold-400"
                >
                  Full library
                  <ArrowR className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="sticky top-[var(--navbar-height)] z-20 border-b border-slate-200 bg-white/95 px-[22px] py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1350px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 lg:max-w-md">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="h-full w-full border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <Filter className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1350px] px-[22px] py-8 sm:py-10 lg:py-12">
        {loading ? (
          <BlogsPageSkeleton />
        ) : !posts.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="m-0 text-base font-medium text-slate-600">No articles published yet.</p>
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
            <p className="m-0 text-base font-semibold text-slate-800">No articles match your search.</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setQuery('');
              }}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
            <main className="space-y-5 sm:space-y-6">
              {featured ? <EditorialCard post={featured} featured /> : null}
              {rest.map((post) => (
                <EditorialCard key={post.id} post={post} />
              ))}
            </main>

            <aside className="hidden lg:block">
              <div className="sticky top-[calc(var(--navbar-height)+5.5rem)] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  More to explore
                </p>
                <h2 className="m-0 mt-1 text-lg font-bold text-slate-900">Popular reads</h2>
                <div className="mt-4 space-y-1">
                  {sidebarPosts.map((post, i) => (
                    <CompactArticleLink key={post.id} post={post} rank={i + 1} />
                  ))}
                </div>
                <Link
                  to="/all-blogs"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm font-semibold text-primary no-underline transition-colors hover:bg-primary hover:text-white"
                >
                  View all blogs
                  <ArrowR className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="mt-10 flex justify-center lg:hidden">
            <Link
              to="/all-blogs"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-primary-900"
            >
              Browse full insights library
              <ArrowR className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
