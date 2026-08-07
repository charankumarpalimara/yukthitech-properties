import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSearch } from '../../context/SearchContext';
import {
  FOOTER_LINKS,
  APP_STORE_LINKS,
  FOOTER_EXPLORE,
  FOOTER_SOCIAL_LINKS,
  CITIES,
} from '../../data/constants';
import { formatCityName } from '../../utils/formatCityName';
import { FOOTER_SOCIAL_ICON_MAP, LogoIcon } from '../../data/icons';
import { API_URL } from '../../service/api';
import { ShieldCheck, Building2, Send, FileCheck, Crown } from 'lucide-react';

const NEWSLETTER_KEY = 'yukthi_newsletter_subscribed';
const TOAST_STYLE = { background: '#0A0A0A', color: '#fff', borderRadius: '12px' };
const PRIMARY = '#023526';
const GOLD = '#c5a880';
const FOOTER_X = 'px-6 sm:px-8 lg:px-12';

const SOCIAL_FALLBACK = {
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  linkedin: 'https://linkedin.com',
  youtube: 'https://youtube.com',
  twitter: 'https://x.com',
};

function NewsletterForm({ enabled }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(NEWSLETTER_KEY) === '1'
  );
  const [loading, setLoading] = useState(false);

  if (!enabled) return null;

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address', { style: TOAST_STYLE });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/footer/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'footer' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Subscription failed');
      setDone(true);
      setEmail('');
      toast.success(json.message || 'Subscribed successfully.', { style: TOAST_STYLE });
    } catch (err) {
      toast.error(err.message || 'Could not subscribe.', { style: TOAST_STYLE });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 border border-emerald-100/60 mt-1">
        <FileCheck size={15} className="text-[#023526] shrink-0" aria-hidden />
        <p className="m-0 text-[12px] font-semibold text-[#023526]">
          Subscribed! You&apos;re now on our mailing list.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full items-stretch gap-2 mt-1">
      <label htmlFor="footer-email" className="sr-only">
        Newsletter email
      </label>
      <input
        id="footer-email"
        type="email"
        placeholder="Enter your email"
        value={email}
        disabled={loading}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#023526] focus:ring-4 focus:ring-[#023526]/5 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="Subscribe"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#023526] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#023526]/95 active:scale-[0.98] transition shadow-md hover:shadow-[0_4px_12px_rgba(2,53,38,0.12)]"
      >
        <Send size={15} className="text-white" strokeWidth={2.25} />
      </button>
    </form>
  );
}

function ColTitle({ children }) {
  return (
    <div className="relative mb-6 pb-2.5">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#023526]">
        {children}
      </h4>
      <div className="absolute bottom-0 left-0 h-[2px] w-6 rounded-full bg-[#c5a880]" />
    </div>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2 text-[13px] font-normal text-slate-600 no-underline transition-all duration-200 hover:translate-x-1 hover:text-[#023526]"
    >
      <span className="h-1 w-1 rounded-full bg-slate-300 transition-colors group-hover:bg-[#c5a880]" />
      {label}
    </Link>
  );
}

function GooglePlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path
        fill="#34A853"
        d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85C3.34 21.61 3 21.09 3 20.5Z"
      />
      <path fill="#FBBC04" d="M16.81 15.12 6.05 21.34 14.54 12.85 16.81 15.12Z" />
      <path
        fill="#4285F4"
        d="M20.16 10.81C20.5 11.08 20.75 11.5 20.75 12 20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5 15.39 12 17.89 9.5 20.16 10.81Z"
      />
      <path fill="#EA4335" d="M6.05 2.66 16.81 8.88 14.54 11.15 6.05 2.66Z" />
    </svg>
  );
}

function AppleIcon({ className = 'shrink-0 text-slate-900' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function StoreAppLink({ href, platform }) {
  const isAndroid = platform === 'android';
  const label = isAndroid ? 'Google Play' : 'App Store';
  const shell = [
    'inline-flex min-h-[2.75rem] min-w-[9rem] items-center gap-2',
    'rounded-xl border border-slate-200 bg-white px-3.5 py-1.5',
    'shadow-sm',
    'no-underline transition-all duration-200',
    'hover:-translate-y-0.5 hover:border-[#023526] hover:bg-[#023526]/5 hover:shadow-md',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#023526]/50',
  ].join(' ');

  const inner = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        {isAndroid ? <GooglePlayIcon /> : <AppleIcon />}
      </span>
      <span className="text-left leading-none font-sans">
        {isAndroid ? (
          <>
            <span className="block text-[9px] font-medium uppercase tracking-[0.05em] text-slate-500">
              Get it on
            </span>
            <span className="mt-0.5 block text-[14px] font-semibold tracking-tight text-slate-900">
              Google Play
            </span>
          </>
        ) : (
          <>
            <span className="block text-[9px] font-medium tracking-wide text-slate-500">
              Download on the
            </span>
            <span className="mt-0.5 block text-[14px] font-semibold tracking-tight text-slate-900">
              App Store
            </span>
          </>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={shell}>
        {inner}
      </a>
    );
  }

  return (
    <span className={`${shell} cursor-default opacity-60`} title="Add store URL in .env">
      {inner}
    </span>
  );
}

function SocialBtn({ id, label, href }) {
  const Icon = FOOTER_SOCIAL_ICON_MAP[id];
  if (!Icon) return null;
  return (
    <a
      href={href || SOCIAL_FALLBACK[id] || '#'}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#023526] hover:bg-[#023526] hover:text-white hover:shadow-[0_4px_12px_rgba(2,53,38,0.15)]"
    >
      <Icon size={15} strokeWidth={2} />
    </a>
  );
}

export default function Footer() {
  const [config, setConfig] = useState(null);

  const { popularCities, cities: allCities } = useSearch();
  const fallback = allCities?.length ? allCities : CITIES;
  const cities = (popularCities.length ? popularCities : fallback).slice(0, 6);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/footer`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success && json.data) setConfig(json.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const cityLinks =
    cities.length > 0
      ? cities.map((c) => {
          const name = c.name || c;
          return { label: formatCityName(name), path: `/city/${encodeURIComponent(name)}` };
        })
      : FOOTER_LINKS.Explore.filter((l) => l.label.startsWith('Buy')).map((item) => ({
          label: formatCityName(item.label.replace('Buy in ', '')),
          path: item.path,
        }));

  const appLinks = {
    playStore: config?.appLinks?.playStore || APP_STORE_LINKS.playStore,
    appStore: config?.appLinks?.appStore || APP_STORE_LINKS.appStore,
  };
  const social = config?.socialLinks?.length ? config.socialLinks : FOOTER_SOCIAL_LINKS;

  return (
    <footer
      className="relative mt-24 w-full border-t border-slate-200 bg-[#fbfcfc] font-sans text-slate-600"
      role="contentinfo"
    >
      <h2 className="sr-only">Yukthi Properties footer</h2>

      {/* 1. Floating CTA Box */}
      <div className={`mx-auto max-w-[1350px] -translate-y-6 relative z-10 ${FOOTER_X}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-[#023526] px-6 py-4 shadow-[0_8px_24px_rgba(2,53,38,0.15)]">
          <div className="text-center sm:text-left">
            <p className="m-0 text-[15px] font-bold text-white leading-snug">
              List your property and reach verified buyers
            </p>
            <p className="m-0 text-[12px] text-white/55 mt-0.5">
              Post your home, plot, or commercial space — it&apos;s free to get started.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              to="/subscription"
              className="inline-flex items-center gap-1.5 rounded-sm bg-[#c5a880] px-4 py-2 text-[12.5px] font-bold text-slate-900 no-underline hover:bg-[#d4b892] transition-colors whitespace-nowrap"
            >
              <Building2 size={13} strokeWidth={2.5} />
              Post Your Property Free
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main content wrapper */}
      <div className="relative w-full overflow-hidden">
        {/* Luxury atmospheric glow orbs */}
        <div
          className="pointer-events-none absolute left-[15%] top-[-80px] h-64 w-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'rgba(2, 53, 38, 0.25)', filter: 'blur(60px)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-[15%] bottom-[-50px] h-64 w-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'rgba(197, 168, 128, 0.25)', filter: 'blur(60px)' }}
          aria-hidden
        />

        {/* 2. Main Grid Columns */}
        <div
          className={`mx-auto grid max-w-[1350px] grid-cols-1 gap-10 pb-0 pt-6 md:grid-cols-3 lg:grid-cols-6 lg:gap-8 ${FOOTER_X}`}
        >
          <div className="md:col-span-3 lg:col-span-2 space-y-5">
            <Link to="/" className="group inline-flex items-center gap-3 no-underline">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#023526] to-[#011f16] shadow-md group-hover:scale-[1.03] transition duration-300">
                <LogoIcon className="h-6.5 w-6.5 text-white" />
              </div>
              <div>
                <p className="m-0 text-xl font-bold leading-none tracking-tight text-slate-900 group-hover:text-[#023526] transition-colors">
                  Yukthi Properties
                </p>
                <p className="m-0 mt-1 text-[9.5px] font-semibold uppercase tracking-[0.25em] text-[#c5a880]">
                  Elite Real Estate
                </p>
              </div>
            </Link>
            <p className="max-w-xs text-[13.5px] font-normal leading-relaxed text-slate-500">
              Verified luxury homes, premium plots & commercial spaces with trusted builders and
              agents across India.
            </p>
            <div className="flex flex-row flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#023526] bg-[#023526]/5 px-3 py-1.5 rounded-lg border border-[#023526]/10">
                <ShieldCheck size={14} className="text-[#023526]" aria-hidden />
                100% Verified Sellers
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#c5a880] bg-[#c5a880]/10 px-3 py-1.5 rounded-lg border border-[#c5a880]/20">
                <Crown size={14} className="text-[#c5a880]" aria-hidden />
                Elite Standards
              </div>
            </div>
          </div>

          <div>
            <ColTitle>Explore</ColTitle>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {FOOTER_EXPLORE.map((item) => (
                <li key={item.label}>
                  <NavLink to={item.path} label={item.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColTitle>Popular Cities</ColTitle>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {cityLinks.slice(0, 4).map((item) => (
                <li key={item.label}>
                  <NavLink to={item.path} label={item.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColTitle>Company</ColTitle>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {FOOTER_LINKS.Company.map((item) => (
                <li key={item.label}>
                  <NavLink to={item.path} label={item.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColTitle>Legal Area</ColTitle>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {FOOTER_LINKS.Legal.map((item) => (
                <li key={item.label}>
                  <NavLink to={item.path} label={item.label} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Interactive Newsletter, Socials & Apps Panel */}
        <div className={`mx-auto mt-12 max-w-[1350px] px-6 ${FOOTER_X}`}>
          <div className="bg-[#f8fafc] border border-slate-200/50 rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
            {/* Newsletter Box */}
            <div className="w-full lg:max-w-sm space-y-2">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#c5a880]">
                Newsletter Subscription
              </span>
              <h4 className="text-md font-bold text-slate-900 tracking-tight leading-none">
                Stay updated with trends
              </h4>
              <p className="text-[12.5px] text-slate-500 font-light leading-relaxed">
                Get notified of new premium listings, weekly market updates, and exclusive property
                insights.
              </p>
              <NewsletterForm enabled={config?.newsletterEnabled !== false} />
            </div>

            {/* Social Pillars */}
            <div className="flex flex-col items-center space-y-2.5">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#c5a880] text-center">
                Social Media Channels
              </span>
              <h4 className="text-md font-bold text-slate-900 tracking-tight leading-none text-center">
                Connect With Us
              </h4>
              <div className="flex gap-2.5">
                {social.map((item) => (
                  <SocialBtn key={item.id} id={item.id} label={item.label} href={item.href} />
                ))}
              </div>
            </div>

            {/* Mobile App Download */}
            <div className="flex flex-col items-center lg:items-end space-y-2.5 w-full lg:w-auto">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#c5a880] text-center lg:text-right w-full">
                Mobile Application
              </span>
              <h4 className="text-md font-bold text-slate-900 tracking-tight leading-none text-center lg:text-right w-full">
                Yukthi Properties App
              </h4>
              <div className="flex flex-wrap gap-2.5 justify-center lg:justify-end w-full">
                <StoreAppLink href={appLinks.appStore} platform="ios" />
                <StoreAppLink href={appLinks.playStore} platform="android" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Elegant Base Sub-Footer */}
        <div
          className={`mx-auto mb-0 mt-10 max-w-[1350px] border-t border-slate-200/60 py-[22px] ${FOOTER_X}`}
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
            <p className="m-0 max-w-full text-center text-xs font-normal leading-relaxed text-slate-500 sm:text-left">
              © {new Date().getFullYear()}{' '}
              <strong className="font-semibold text-slate-900">Yukthi Properties</strong>
              <span className="text-slate-300 mx-2">|</span>
              All rights reserved by{' '}
              <span className="font-medium text-slate-800">Yukthitech Solutions</span>
            </p>
            <nav
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end"
              aria-label="Legal links"
            >
              {FOOTER_LINKS.Legal.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-xs font-medium text-slate-500 hover:text-[#023526] hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/contact-us"
                className="text-xs font-medium text-slate-500 hover:text-[#023526] hover:underline transition-colors"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
