/** Blog posts — static fallback; live data from `GET /api/website/blogs` */

const img = (base, width) => {
  if (!base || String(base).startsWith('data:')) return base || '';
  const sep = String(base).includes('?') ? '&' : '?';
  return `${base}${sep}w=${width}&q=80`;
};

export const buildBlogImages = (imageBase) => ({
  imageThumb: img(imageBase, 200),
  imageCard: img(imageBase, 480),
  imageLead: img(imageBase, 720),
  image: img(imageBase, 960),
  imageHero: img(imageBase, 1400),
});

/** Map one document from `GET /api/website/blogs` to the same shape as `HOME_BLOG_POSTS` items */
export function mapApiBlogToHomeShape(doc) {
  if (!doc || !doc.slug) return null;
  const id = doc._id != null ? String(doc._id) : String(doc.id || doc.slug);
  let imageBase = (doc.imageBase && String(doc.imageBase).trim()) || '';
  if (!imageBase && Array.isArray(doc.gallery) && doc.gallery.length) {
    imageBase = String(doc.gallery[0]).trim();
  }
  if (!imageBase) {
    imageBase = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop';
  }
  const images = buildBlogImages(imageBase);
  const galleryImages = (doc.gallery || []).map((g, i) => ({
    src: img(g, i === 0 ? 800 : 600),
    thumb: img(g, 320),
  }));

  const wc = plainTextFromHtml(doc.content || '')
    .split(/\s+/)
    .filter(Boolean).length;
  const readMinutes = Math.max(1, Math.min(30, Math.round(wc / 200)));

  return {
    id,
    slug: doc.slug,
    title: doc.title || '',
    excerpt: doc.excerpt || '',
    category: doc.category || 'General',
    author: doc.author || '',
    readMinutes,
    priority: doc.priority != null ? Number(doc.priority) : 100,
    isFeatured: !!doc.isFeatured,
    imageBase,
    ...images,
    galleryImages,
  };
}

function plainTextFromHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Full post for article page (HTML body + dates for byline) */
export function mapApiBlogToDetailShape(doc) {
  const base = mapApiBlogToHomeShape(doc);
  if (!base) return null;
  const dateRaw = doc.publishedAt || doc.updatedAt || doc.createdAt;
  let date = '';
  if (dateRaw) {
    date = typeof dateRaw === 'string' ? dateRaw : new Date(dateRaw).toISOString();
  }
  return {
    ...base,
    content: doc.content || '',
    date: date || undefined,
  };
}

export function formatBlogDate(iso, { short = false } = {}) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(short ? {} : { year: 'numeric' }),
  });
}

const RAW_POSTS = [
  {
    id: '1',
    slug: 'first-time-home-buyer-hyderabad',
    title: 'First-Time Home Buyer Checklist in Hyderabad',
    excerpt:
      'RERA registration, builder reputation, locality shortlists, and every document to keep ready before you pay the token.',
    category: 'Buying',
    priority: 10,
    author: 'Yukthi Editorial',
    imageBase: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop',
    ],
  },
  {
    id: '2',
    slug: 'kphb-vs-miyapur-buying',
    title: 'KPHB vs Miyapur: Which Area Suits Your Budget?',
    excerpt:
      'Metro connectivity, school clusters, hospital access, and how per-sq.ft rates moved in the last 12 months.',
    category: 'Localities',
    priority: 20,
    author: 'Yukthi Editorial',
    imageBase: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1449844908441-8829872d2602?auto=format&fit=crop',
      'https://images.unsplash.com/photo-1477959858617-67f85c4c4c44?auto=format&fit=crop',
    ],
  },
  {
    id: '3',
    slug: 'vastu-tips-modern-apartments',
    title: 'Vastu Tips for Modern Apartments',
    excerpt:
      'Entrance direction, kitchen placement, and balcony light — practical ideas for 2 & 3 BHK layouts.',
    category: 'Tips',
    priority: 30,
    author: 'Priya Sharma',
    imageBase: 'https://images.unsplash.com/photo-1502672260266-1c1ef2cd9361?auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop',
    ],
  },
  {
    id: '4',
    slug: 'home-loan-rates-2026',
    title: 'Home Loans in 2026: What Buyers Should Know',
    excerpt:
      'Floating vs fixed rates, EMI calculators, prepayment rules, and documents banks ask at sanction.',
    category: 'Finance',
    priority: 40,
    author: 'Yukthi Editorial',
    imageBase: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop',
    ],
  },
  {
    id: '5',
    slug: 'gated-community-amenities-guide',
    title: 'Gated Community Amenities Worth Paying For',
    excerpt:
      'Clubhouse, security, power backup, and kids’ play zones — what actually adds resale value.',
    category: 'Buying',
    priority: 50,
    author: 'Yukthi Editorial',
    imageBase: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop',
    ],
  },
  {
    id: '6',
    slug: 'plot-vs-apartment-investment',
    title: 'Plot vs Apartment: What Works in Hyderabad Today?',
    excerpt:
      'HMDA plots, villa communities, and high-rise launches compared for end-use and long-term hold.',
    category: 'Investment',
    priority: 60,
    author: 'Arjun Reddy',
    imageBase: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop',
    ],
  },
];

/** Lower priority number = shown first */
export const sortBlogPostsByPriority = (posts) =>
  [...posts].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

export const HOME_BLOG_POSTS = sortBlogPostsByPriority(RAW_POSTS).map((post) => {
  const images = buildBlogImages(post.imageBase);
  const galleryImages = (post.gallery || []).map((g, i) => ({
    src: img(g, i === 0 ? 800 : 600),
    thumb: img(g, 320),
  }));
  return {
    ...post,
    ...images,
    galleryImages,
  };
});
