import { useMemo } from 'react';
import { Star, BadgeCheck, Quote } from 'lucide-react';
import HomeSectionHeader from '../HomeSectionHeader';
import './Testimonials.css';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatReviewDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function StarRating({ rating = 5 }) {
  const safe = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${safe} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={0}
          className={i < safe ? 'fill-[#c5a880] text-[#c5a880]' : 'fill-slate-700 text-slate-700'}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ item }) {
  const name = item.reviewerName || 'Verified buyer';
  const text = item.reviewText || '';
  const rating = Number(item.rating) || 5;
  const dateLabel = formatReviewDate(item.date);

  return (
    <article className="testimonial-card-premium group">
      <div className="testimonial-card-premium__line" aria-hidden />

      <Quote
        size={32}
        strokeWidth={1.5}
        className="testimonial-card-premium__quote"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3 pr-6 z-10">
        <StarRating rating={rating} />
        <span className="testimonial-verified-badge">
          <BadgeCheck size={11} strokeWidth={2.25} aria-hidden />
          Verified
        </span>
      </div>

      <blockquote className="relative mt-4 flex-1 z-10">
        <p className="testimonial-card-premium__text line-clamp-4">
          {text}
        </p>
      </blockquote>

      <footer className="relative mt-5 flex items-center gap-3 border-t border-white/10 pt-4 z-10">
        <div className="testimonial-avatar-badge" aria-hidden>
          {getInitials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="testimonial-card-premium__name truncate">{name}</p>
          {dateLabel && <p className="testimonial-card-premium__date">{dateLabel}</p>}
        </div>
      </footer>
    </article>
  );
}

export default function HomeTestimonials({ testimonials = [] }) {
  const items = useMemo(
    () => (Array.isArray(testimonials) ? testimonials.filter((t) => t?.reviewText) : []),
    [testimonials]
  );

  if (items.length === 0) return null;

  // Split testimonials into two sets for bidirectional rows
  const row1Items = items.filter((_, idx) => idx % 2 === 0);
  const row2Items = items.filter((_, idx) => idx % 2 !== 0);

  // If a row is small, duplicate it to ensure smooth looping layout
  const padItems = (arr) => {
    if (arr.length === 0) return [];
    let result = [...arr];
    while (result.length < 8) {
      result = [...result, ...arr];
    }
    return result;
  };

  const finalRow1 = padItems(row1Items);
  const finalRow2 = padItems(row2Items);

  return (
    <section className="w-full home-section--testimonials" aria-label="Customer testimonials">
      <HomeSectionHeader
        eyebrow="Client stories"
        title="What our clients say"
        subtitle="Real experiences from buyers and sellers on Yukthi Properties"
        compact
      />

      <div className="testimonials-marquee-wrapper">
        {/* Row 1: Leftward marquee */}
        {finalRow1.length > 0 && (
          <div className="testimonials-marquee-row testimonials-marquee-row--left">
            {finalRow1.map((item, idx) => (
              <TestimonialCard key={`row1-${item.id || item._id}-${idx}`} item={item} />
            ))}
            {/* Loop copy */}
            {finalRow1.map((item, idx) => (
              <TestimonialCard key={`row1-copy-${item.id || item._id}-${idx}`} item={item} />
            ))}
          </div>
        )}

        {/* Row 2: Rightward marquee */}
        {finalRow2.length > 0 && (
          <div className="testimonials-marquee-row testimonials-marquee-row--right">
            {finalRow2.map((item, idx) => (
              <TestimonialCard key={`row2-${item.id || item._id}-${idx}`} item={item} />
            ))}
            {/* Loop copy */}
            {finalRow2.map((item, idx) => (
              <TestimonialCard key={`row2-copy-${item.id || item._id}-${idx}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function HomeTestimonialsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-4 space-y-2 sm:mb-5">
        <div className="h-4 w-28 rounded bg-slate-800" />
        <div className="h-8 w-56 rounded bg-slate-800" />
        <div className="h-4 w-full max-w-md rounded bg-slate-800" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[200px] min-w-[330px] shrink-0 rounded-2xl bg-slate-800/50"
            />
          ))}
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[200px] min-w-[330px] shrink-0 rounded-2xl bg-slate-800/50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

