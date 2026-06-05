/**
 * Blog detail — /blog/:slug
 * Loads from `GET /api/website/blogs/slug/:slug` with static fallback.
 * Listing + home preview: Blogs.jsx
 */
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { ArrowLeft } from 'lucide-react';
import he from 'he';
import {
  HOME_BLOG_POSTS,
  sortBlogPostsByPriority,
  mapApiBlogToDetailShape,
  mapApiBlogToHomeShape,
  formatBlogDate,
} from '../data/homeBlogs';
import { BlogImage } from '../components/HomeScreen/Blogs';
import { ArrowR } from '../data/icons';
import { API_URL, apiClient } from '../service/api';
import '../styles/blogPostBody.css';

function isEffectivelyEmptyArticleHtml(html) {
  if (!html || typeof html !== 'string') return true;
  const text = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length === 0;
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [morePosts, setMorePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || !String(slug).trim()) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setPost(null);

      const fallbackPost = HOME_BLOG_POSTS.find((p) => p.slug === slug);
      const fallbackMore = sortBlogPostsByPriority(
        HOME_BLOG_POSTS.filter((p) => p.id !== fallbackPost?.id && p.slug !== slug)
      ).slice(0, 4);

      try {
        const [detailRes, listRes] = await Promise.all([
          apiClient(`${API_URL}/blogs/slug/${encodeURIComponent(slug)}`),
          apiClient(`${API_URL}/blogs?limit=16`),
        ]);

        const [detailJson, listJson] = await Promise.all([
          detailRes.json().catch(() => ({})),
          listRes.json().catch(() => ({})),
        ]);
        if (cancelled) return;

        if (detailRes.ok && detailJson.success && detailJson.data) {
          const mapped = mapApiBlogToDetailShape(detailJson.data);
          if (mapped) {
            setPost(mapped);

            if (listRes.ok && listJson.success && Array.isArray(listJson.data)) {
              const others = sortBlogPostsByPriority(
                listJson.data
                  .map(mapApiBlogToHomeShape)
                  .filter(Boolean)
                  .filter((p) => p.slug !== slug)
              ).slice(0, 4);
              setMorePosts(others.length ? others : fallbackMore);
            } else {
              setMorePosts(fallbackMore);
            }
            return;
          }
        }

        if (fallbackPost) {
          setPost({ ...fallbackPost, content: '' });
          setMorePosts(fallbackMore);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('BlogPost: API error, using static fallback', e);
          if (fallbackPost) {
            setPost({ ...fallbackPost, content: '' });
            setMorePosts(fallbackMore);
          } else {
            setNotFound(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <article className="bg-white min-h-screen py-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-[1350px] px-[22px] animate-pulse">
          <div className="h-4 w-48 rounded bg-slate-200 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-8 w-3/4 max-w-md rounded bg-slate-200" />
              <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200" />
              <div className="h-24 w-full rounded-xl bg-slate-200" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-64 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-[1350px] px-[22px] py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Article not found</h1>
        <Link
          to="/blogs"
          className="mt-4 inline-block text-sm font-semibold text-amber-600 no-underline"
        >
          Back to articles
        </Link>
      </div>
    );
  }

  const authorInitial = (post.author || 'S').trim().charAt(0).toUpperCase() || 'S';

  const metaParts = [];
  if (post.date) metaParts.push(formatBlogDate(post.date));
  if (post.readMinutes != null) metaParts.push(`${post.readMinutes} min read`);
  const metaLine = metaParts.join(' · ');

  const bodyHtml = DOMPurify.sanitize(he.decode(post.content || ''), {
    ADD_ATTR: ['target', 'rel', 'class'],
  });
  const showArticleBody = Boolean(bodyHtml) && !isEffectivelyEmptyArticleHtml(bodyHtml);

  // Decode title and clean excerpt
  const cleanTitle = he.decode(post.title || '');
  const cleanExcerpt = he
    .decode(post.excerpt || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <article className="bg-white min-h-screen py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-[1350px] px-[22px]">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 no-underline mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to articles
        </Link>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 min-w-0">
              <span className="inline-block bg-amber-50 text-amber-700 text-[11px] font-bold uppercase px-3 py-1 rounded-full mb-3">
                {post.category}
              </span>
              <h1 className="m-0 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
                {cleanTitle}
              </h1>
              <div className="flex items-center gap-3 mt-5 border-b border-slate-100 pb-5">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-bold text-sm flex items-center justify-center">
                  {authorInitial}
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-slate-900">{post.author}</p>
                  <p className="m-0 text-xs text-slate-400">{metaLine || post.category}</p>
                </div>
              </div>

              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50 mt-6 border border-slate-100">
                <BlogImage
                  src={post.imageHero || post.image}
                  thumb={post.imageLead}
                  alt={cleanTitle}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
              </div>

              {cleanExcerpt ? (
                <p className="mt-8 text-base sm:text-lg text-slate-700 italic border-l-4 border-amber-500 pl-4 py-2 bg-amber-50/15 rounded-r-2xl">
                  {cleanExcerpt}
                </p>
              ) : null}

              {post.galleryImages?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-8">
                  {post.galleryImages.map((img, i) => (
                    <figure
                      key={i}
                      className="m-0 rounded-2xl overflow-hidden border border-slate-100 aspect-[16/10] bg-slate-50"
                    >
                      <BlogImage
                        src={img.src}
                        thumb={img.thumb}
                        alt={`${cleanTitle} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </figure>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-4 w-full min-w-0 space-y-6 lg:sticky lg:top-[calc(var(--navbar-height,64px)+1.25rem)] lg:self-start lg:pl-4">
              {morePosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <h3 className="m-0 text-base font-semibold text-slate-900 mb-4">
                    Continue Reading
                  </h3>
                  <div className="flex flex-col gap-4">
                    {morePosts.map((p) => (
                      <article key={p.id} className="group flex gap-3 items-center">
                        <Link
                          to={`/blog/${p.slug}`}
                          className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0"
                        >
                          <BlogImage
                            src={p.imageThumb || p.imageCard}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase text-amber-600">
                            {p.category}
                          </span>
                          <h4 className="m-0 mt-0.5 text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-amber-600">
                            <Link to={`/blog/${p.slug}`} className="no-underline text-inherit">
                              {he.decode(p.title || '')}
                            </Link>
                          </h4>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
                <h3 className="m-0 text-base font-semibold text-slate-900">
                  Looking for a property in Hyderabad?
                </h3>
                <p className="text-xs text-slate-500 mt-2 mb-4">
                  Browse verified listings on Yukthi Properties.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center justify-center gap-1.5 w-full h-10 rounded-lg bg-amber-500 text-slate-900 text-xs font-semibold no-underline"
                >
                  Search Properties <ArrowR className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <h3 className="m-0 text-base font-semibold text-amber-400">
                  Are you an Owner or Agent?
                </h3>
                <p className="text-xs text-slate-300 mt-2 mb-4">
                  List your property to reach buyers.
                </p>
                <Link
                  to="/subscription"
                  className="inline-flex items-center justify-center gap-1.5 w-full h-10 rounded-lg bg-white/10 text-white border border-white/20 text-xs font-semibold no-underline"
                >
                  Post Property <ArrowR className="h-3.5 w-3.5 text-amber-400" />
                </Link>
              </div>
            </aside>
          </div>

          <div className="w-full min-w-0">
            {showArticleBody ? (
              <div
                className="blog-post-body rounded-2xl border border-slate-100 bg-slate-50/40 px-4 py-6 sm:px-7 sm:py-8 w-full"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 sm:p-6 text-sm text-slate-600 leading-relaxed w-full">
                <p className="m-0 font-medium text-slate-700">Article body</p>
                <p className="m-0 mt-2">
                  The full article is being prepared by our editorial team and will be published
                  here soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
