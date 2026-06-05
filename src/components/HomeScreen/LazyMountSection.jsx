import { useCarouselInView } from '../../hooks/useCarouselInView';

/**
 * Mount children only when near the viewport — cuts initial DOM/images on Home.
 */
export default function LazyMountSection({
  children,
  rootMargin = '280px 0px',
  threshold = 0.01,
  minHeight = '280px',
  fallback = null,
  className = '',
}) {
  const { ref, inView } = useCarouselInView({
    enabled: true,
    rootMargin,
    threshold,
    initialInView: false,
  });

  return (
    <div ref={ref} className={className} style={!inView ? { minHeight } : undefined}>
      {inView ? children : fallback}
    </div>
  );
}
