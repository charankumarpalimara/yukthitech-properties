import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, apiClient } from '../service/api';
import { ArrowR } from '../data/icons';
import { HOME_BLOG_POSTS, mapApiBlogToHomeShape, sortBlogPostsByPriority } from '../data/homeBlogs';
import { BlogImage } from '../components/HomeScreen/Blogs';

export default function AllBlogs() {
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

  const sorted = sortBlogPostsByPriority(posts);
  const [featured, ...rest] = sorted;

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto max-w-[1350px] px-[22px]">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 no-underline transition-colors group"
          >
            <ArrowR className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>

        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">
          <p className="m-0 text-xs font-bold uppercase tracking-widest text-amber-600">
            All Blogs
          </p>
          <h1 className="m-0 mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
            Real Estate Guides & Insights
          </h1>
          <p className="m-0 mt-2.5 max-w-2xl text-sm text-slate-600">
            Explore all published stories, buyer guides, trends, and expert checklists.
          </p>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Loading blogs...
          </div>
        ) : !sorted.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            No blogs available.
          </div>
        ) : (
          <>
            {featured && (
              <article className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-2">
                <Link
                  to={`/blog/${featured.slug}`}
                  className="block h-[210px] overflow-hidden sm:h-[230px] lg:h-[300px]"
                >
                  <BlogImage
                    src={featured.imageHero || featured.image}
                    thumb={featured.imageLead}
                    alt={featured.title}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex flex-col justify-between p-4 sm:p-5 lg:p-6 lg:min-h-[300px]">
                  <div>
                    <p className="m-0 text-xs font-bold uppercase tracking-wide text-amber-600">
                      {featured.category}
                    </p>
                    <h2 className="m-0 mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                      {featured.title}
                    </h2>
                    <p className="m-0 mt-3 text-sm leading-relaxed text-slate-600 line-clamp-5">
                      {featured.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <Link
                      to={`/blog/${featured.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 no-underline"
                    >
                      Read article <ArrowR className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden">
                    <BlogImage
                      src={post.imageCard || post.image}
                      thumb={post.imageThumb}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-amber-600">
                      {post.category}
                    </p>
                    <h3 className="m-0 mt-2 line-clamp-2 text-base font-semibold text-slate-900">
                      {post.title}
                    </h3>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 no-underline"
                    >
                      Read story <ArrowR className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
