import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './SupportButton.css';

/** Phone / call — clear contact-support affordance */
const SupportIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const WHATSAPP_NUMBER = '919804293293';
const HERO_SELECTOR = '.hero';

const SupportButton = () => {
  const location = useLocation();
  const [isPastHero, setIsPastHero] = useState(false);
  const { isLoggedIn, openLoginModal } = useAuthStore();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const updatePastHero = () => {
      const hero = document.querySelector(HERO_SELECTOR);
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
        setIsPastHero(window.scrollY >= heroBottom - 72);
        return;
      }
      setIsPastHero(window.scrollY > 120);
    };

    updatePastHero();
    window.addEventListener('scroll', updatePastHero, { passive: true });
    window.addEventListener('resize', updatePastHero);
    return () => {
      window.removeEventListener('scroll', updatePastHero);
      window.removeEventListener('resize', updatePastHero);
    };
  }, [location.pathname]);

  const handleSupportClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openLoginModal('Please login to contact support.');
      return;
    }
    const text =
      'Hi Yukthi Properties, I need help with property services. Please connect me with your support team.';
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (!isHomePage) {
    return null;
  }

  return (
    <div className={`support-wrapper ${isPastHero ? 'is-visible' : ''}`}>
      <button
        type="button"
        className="support-float-btn"
        onClick={handleSupportClick}
        aria-label="Call support"
      >
        <span className="btn-icon-wrap">
          <SupportIcon />
        </span>
        <span className="support-float-label" aria-hidden>
          Support
        </span>
      </button>
    </div>
  );
};

export default SupportButton;
