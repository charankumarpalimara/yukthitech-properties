/**
 * Blog detail — /blog/:slug
 */
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Clock } from 'lucide-react';
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
import { normalizeCmsProseHtml } from '../utils/normalizeCmsProseHtml';
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

function stripHtmlToText(html) {
  return he
    .decode(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function prepareArticleHtml(content, excerpt) {
  const decoded = he.decode(content || '').trim();
  let html = decoded ? normalizeCmsProseHtml(decoded) : '';

  if (!html || isEffectivelyEmptyArticleHtml(html)) {
    const plainExcerpt = stripHtmlToText(excerpt);
    if (plainExcerpt) {
      html = `<p>${he.encode(plainExcerpt)}</p>`;
    }
  }

  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel', 'class', 'colspan', 'rowspan', 'align', 'width', 'height'],
  });
}

function RelatedCard({ post }) {
  if (!post) return null;
  const title = he.decode(post.title || '');

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <BlogImage
          src={post.imageCard || post.image}
          thumb={post.imageThumb}
          alt={title}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold">{post.category}</span>
        <h3 className="m-0 mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-primary">
          {title}
        </h3>
      </div>
    </Link>
  );
}

function BlogPostSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-white" aria-hidden>
      <div className="border-b border-slate-200 px-[22px] py-6">
        <div className="mx-auto max-w-[1350px] space-y-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-9 w-full max-w-2xl rounded bg-slate-200" />
        </div>
      </div>
      <div className="mx-auto max-w-[1350px] px-[22px] pt-6">
        <div className="h-[180px] w-full rounded-xl bg-slate-200 sm:h-[220px]" />
      </div>
      <div className="mx-auto max-w-3xl px-[22px] py-10">
        <div className="h-48 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
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
      ).slice(0, 3);

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
              ).slice(0, 3);
              setMorePosts(others.length ? others : fallbackMore);
            } else {
              setMorePosts(fallbackMore);
            }
            return;
          }
        }

        if (fallbackPost) {
          setPost({ ...fallbackPost, content: fallbackPost.content || '' });
          setMorePosts(fallbackMore);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('BlogPost: API error, using static fallback', e);
          if (fallbackPost) {
            setPost({ ...fallbackPost, content: fallbackPost.content || '' });
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

  if (loading) return <BlogPostSkeleton />;

  if (notFound || !post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-[22px] py-16 text-center">
        <h1 className="m-0 text-2xl font-extrabold text-slate-900">Article not found</h1>
        <p className="m-0 mt-2 max-w-md text-sm text-slate-500">
          This story may have been moved or is not published yet.
        </p>
        <Link
          to="/all-blogs"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-primary-900"
        >
          Browse articles
          <ArrowR className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const authorInitial = (post.author || 'S').trim().charAt(0).toUpperCase() || 'S';

  const metaParts = [];
  if (post.date) metaParts.push(formatBlogDate(post.date));
  if (post.readMinutes != null) metaParts.push(`${post.readMinutes} min read`);
  const metaLine = metaParts.join(' · ');

  const bodyHtml = prepareArticleHtml(post.content, post.excerpt);
  const showArticleBody = Boolean(bodyHtml) && !isEffectivelyEmptyArticleHtml(bodyHtml);

  const cleanTitle = he.decode(post.title || '');
  const cleanExcerpt = stripHtmlToText(post.excerpt);
  const showLeadExcerpt = Boolean(cleanExcerpt) && !showArticleBody;

  return (
    <article className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-[1350px] px-[22px] py-5 sm:py-6">
          <Link
            to="/all-blogs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 no-underline transition-colors hover:text-primary"
          >
            <ArrowR className="h-4 w-4 rotate-180" />
            Back to articles
          </Link>

          <div className="mt-4 max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{post.category}</span>
            <h1 className="m-0 mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {cleanTitle}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {authorInitial}
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-slate-900">{post.author}</p>
                  {metaLine ? <p className="m-0 text-xs text-slate-400">{metaLine}</p> : null}
                </div>
              </div>
              {post.readMinutes ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-gold" />
                  {post.readMinutes} min read
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1350px] px-[22px] pt-5 sm:pt-6">
        <div className="relative h-[180px] w-full overflow-hidden rounded-xl bg-slate-100 sm:h-[220px] lg:h-[260px]">
          <BlogImage
            src={post.imageHero || post.image}
            thumb={post.imageLead}
            alt={cleanTitle}
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            sizes="(max-width: 1350px) 100vw, 1350px"
          />
        </div>
      </div>

      {showLeadExcerpt ? (
        <div className="mx-auto mt-5 max-w-3xl px-[22px] sm:mt-6">
          <p className="m-0 border-l-4 border-gold bg-gold/5 px-4 py-3 text-base leading-relaxed text-slate-600">
            {cleanExcerpt}
          </p>
        </div>
      ) : null}

      {/* Reading layout */}
      <div className="mx-auto max-w-[1350px] px-[22px] py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <div className="min-w-0">
            {showArticleBody ? (
              <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
                <div
                  className="blog-post-body"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm leading-relaxed text-slate-600">
                <p className="m-0 font-semibold text-slate-800">Full article coming soon</p>
                <p className="m-0 mt-2">
                  Our editorial team is preparing the complete story. Check back shortly.
                </p>
              </div>
            )}

            {post.galleryImages?.length > 0 ? (
              <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                {post.galleryImages.map((img, i) => (
                  <figure key={i} className="m-0 overflow-hidden rounded-xl bg-slate-100">
                    <div className="relative aspect-[16/10]">
                      <BlogImage
                        src={img.src}
                        thumb={img.thumb}
                        alt={`${cleanTitle} ${i + 1}`}
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  </figure>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex w-full flex-wrap gap-3 border-t border-slate-100 pt-6">
              <Link
                to="/all-blogs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:text-primary-900"
              >
                <ArrowR className="h-4 w-4 rotate-180" />
                All articles
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 no-underline hover:text-primary"
              >
                Search properties
                <ArrowR className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--navbar-height)+1.5rem)] lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
              {morePosts.length > 0 ? (
                <>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                    Keep reading
                  </p>
                  <h2 className="m-0 mt-1 text-lg font-bold text-slate-900">More guides</h2>
                  <ul className="m-0 mt-4 list-none space-y-4 p-0">
                    {morePosts.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/blog/${p.slug}`}
                          className="group block no-underline"
                        >
                          <div className="relative mb-2 aspect-[16/10] overflow-hidden rounded-lg bg-slate-200">
                            <BlogImage
                              src={p.imageCard || p.image}
                              thumb={p.imageThumb}
                              alt=""
                              className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            {p.category}
                          </span>
                          <p className="m-0 mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">
                            {he.decode(p.title || '')}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <div className={`${morePosts.length ? 'mt-6 border-t border-slate-200 pt-6' : ''}`}>
                <p className="m-0 text-sm font-bold text-slate-900">Own a property?</p>
                <p className="m-0 mt-1 text-xs leading-relaxed text-slate-500">
                  List on Yukthi Properties and reach verified buyers.
                </p>
                <Link
                  to="/subscription"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-white no-underline hover:bg-primary-900"
                >
                  Post your listing
                  <ArrowR className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {morePosts.length > 0 ? (
          <section className="mt-14 border-t border-slate-200 pt-10 lg:hidden" aria-label="Related articles">
            <h2 className="m-0 text-lg font-bold text-slate-900">Related articles</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {morePosts.map((p) => (
                <RelatedCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
