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
  initialInView = false,
  eager = false,
}) {
  const { ref, inView } = useCarouselInView({
    enabled: !eager,
    rootMargin,
    threshold,
    initialInView: eager || initialInView,
  });

  const showChildren = eager || inView;

  return (
    <div ref={ref} className={className} style={!showChildren ? { minHeight } : undefined}>
      {showChildren ? children : fallback}
    </div>
  );
}
