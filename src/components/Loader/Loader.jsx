import React from 'react';
import './Loader.css';

/**
 * Premium Global Loader Component
 * @param {boolean} fullScreen - Whether to show the loader as a full-screen overlay
 * @param {string} text - Optional text to show below the loader
 */
const Loader = ({ fullScreen = false, text = 'Loading premium experiences...' }) => {
  const loaderContent = (
    <div className={`premium-loader-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="premium-loader-wrapper">
        <div className="premium-loader-ring">
          <div className="ring-inner"></div>
        </div>
        <div className="premium-loader-logo">
          <span className="logo-s">Y</span>
        </div>
      </div>
      {text && <p className="premium-loader-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="premium-loader-overlay">{loaderContent}</div>;
  }

  return loaderContent;
};

export default Loader;
