import React, { memo } from 'react';
import './Loader.css';

/**
 * Premium app loader — use this everywhere (Layout, pages, sections).
 * @param {boolean} fullScreen - Full viewport overlay
 * @param {string} text - Message below spinner
 * @param {'sm'|'md'} size - Ring size (section / page)
 */
function Loader({ fullScreen = false, text = 'Loading premium experiences...', size = 'md' }) {
  const loaderContent = (
    <div
      className={`premium-loader-container premium-loader-container--${size} ${fullScreen ? 'full-screen' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="premium-loader-wrapper">
        <div className="premium-loader-ring">
          <div className="ring-inner" />
        </div>
        <div className="premium-loader-logo">
          <span className="logo-s">Y</span>
        </div>
      </div>
      {text ? <p className="premium-loader-text">{text}</p> : null}
    </div>
  );

  if (fullScreen) {
    return <div className="premium-loader-overlay">{loaderContent}</div>;
  }

  return loaderContent;
}

/** Centered loader for page sections (home feed, grids, panels). */
export function SectionLoader({
  text = 'Loading...',
  minHeight = '280px',
  className = '',
  size = 'sm',
}) {
  return (
    <div
      className={`premium-section-loader ${className}`.trim()}
      style={{ minHeight }}
      aria-busy="true"
    >
      <Loader text={text} size={size} />
    </div>
  );
}

export default memo(Loader);
