import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  Info,
  Mail,
  Scale,
  Shield,
  FileText,
  AlertTriangle,
  Trash2,
  Compass,
} from 'lucide-react';
import { ArrowR } from '../../data/icons';

const navLinkBase =
  'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium text-slate-600 no-underline transition-all duration-200';

const navLinkActive =
  'border-primary/20 bg-gradient-to-r from-primary/10 to-primary-light/80 font-semibold text-primary shadow-[inset_3px_0_0_#C5A880]';

const navLinkInactive =
  'border-transparent hover:border-primary/10 hover:bg-primary/5 hover:text-primary';

const navIconBase =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200';

const navIconActive = 'bg-primary text-white shadow-md';

const navIconInactive =
  'bg-primary/5 text-primary group-hover:scale-105 group-hover:bg-primary/10';

const navArrowBase = 'h-3.5 w-3.5 shrink-0 transition-all duration-200';

const navArrowActive = 'translate-x-0 text-gold opacity-100';

const navArrowInactive =
  '-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100';

export default function InfoLayout({ title, subtitle, children }) {
  const sections = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about-us', icon: Info },
        { label: 'Contact Us', path: '/contact-us', icon: Mail },
        { label: 'Grievances', path: '/grievances', icon: Scale },
      ],
    },
    {
      title: 'Legal & Security',
      links: [
        { label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
        { label: 'Terms & Conditions', path: '/terms-conditions', icon: FileText },
        { label: 'Disclaimer', path: '/disclaimer', icon: AlertTriangle },
        { label: 'Delete Account', path: '/delete-account', icon: Trash2 },
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-surface px-[22px] pt-6 pb-14 antialiased sm:pt-8 sm:pb-16 lg:pt-10">
      <div className="mx-auto w-full max-w-[1350px]">
        <nav
          className="mb-6 flex flex-wrap items-center gap-1.5 text-[0.8125rem] font-semibold"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-primary no-underline transition-colors hover:text-primary-dark"
          >
            <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
          <span className="text-slate-900">{title}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <main className="min-w-0">
            <header className="mb-5 border-b border-slate-200 pb-5">
              <span className="mb-3 inline-block rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-widest text-primary">
                Support &amp; Information
              </span>
              <h1 className="m-0 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-[2.125rem] md:leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-relaxed text-slate-500">
                  {subtitle}
                </p>
              )}
            </header>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 leading-relaxed shadow-sm sm:px-7 sm:py-6 md:px-8 md:py-7">
              {children}
            </div>
          </main>

          <aside
            className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-[calc(var(--navbar-height)+1.25rem)] lg:pl-2"
            aria-label="Related pages"
          >
            <nav
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-primary/5"
              aria-label="Site information"
            >
              <div className="flex items-center gap-3.5 border-b border-primary/10 bg-gradient-to-br from-primary/5 to-gold/5 px-5 pb-4 pt-5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/20"
                  aria-hidden
                >
                  <Compass className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 text-[0.9375rem] font-bold tracking-tight text-slate-900">
                    Related Pages
                  </h3>
                  <p className="m-0 mt-0.5 text-xs leading-snug text-slate-500">
                    Company info, support &amp; legal
                  </p>
                </div>
              </div>

              <div className="p-3">
                {sections.map((section, sectionIdx) => (
                  <div
                    key={section.title}
                    className={sectionIdx > 0 ? 'mt-2 border-t border-slate-100 pt-3' : ''}
                  >
                    <p className="mb-2 px-2 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-gold">
                      {section.title}
                    </p>
                    <ul className="m-0 flex list-none flex-col gap-1 p-0">
                      {section.links.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.path}>
                            <NavLink
                              to={link.path}
                              end
                              className={({ isActive }) =>
                                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <span
                                    className={`${navIconBase} ${isActive ? navIconActive : navIconInactive}`}
                                    aria-hidden
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1 leading-snug">{link.label}</span>
                                  <ChevronRight
                                    className={`${navArrowBase} ${isActive ? navArrowActive : navArrowInactive}`}
                                    aria-hidden
                                  />
                                </>
                              )}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>

            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-white p-5 shadow-md shadow-primary/10">
              <span className="mb-2.5 inline-block rounded-full border border-primary/15 bg-primary/10 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-widest text-primary">
                For Buyers
              </span>
              <h3 className="m-0 text-base font-bold leading-snug tracking-tight text-slate-900">
                Looking for a property in Hyderabad?
              </h3>
              <p className="mb-4 mt-2 text-[0.8125rem] leading-relaxed text-slate-500">
                Browse verified listings on Yukthi Properties.
              </p>
              <Link
                to="/properties"
                className="inline-flex h-[2.625rem] w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-[0.8125rem] font-bold text-white no-underline shadow-md shadow-primary/20 transition-all duration-200 hover:bg-[#034432] hover:shadow-lg active:scale-[0.98]"
              >
                Search Properties
                <ArrowR className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-primary via-[#034432] to-primary-dark p-5 text-white shadow-xl shadow-primary/30">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/20 blur-2xl"
                aria-hidden
              />
              <span className="relative z-10 mb-2.5 inline-block rounded-full border border-gold/35 bg-gold/15 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-widest text-gold">
                For Sellers
              </span>
              <h3 className="relative z-10 m-0 text-base font-bold leading-snug tracking-tight text-white">
                Are you an Owner or Agent?
              </h3>
              <p className="relative z-10 mb-4 mt-2 text-[0.8125rem] leading-relaxed text-white/70">
                List your property to reach buyers across Hyderabad.
              </p>
              <Link
                to="/subscription"
                className="relative z-10 inline-flex h-[2.625rem] w-full items-center justify-center gap-1.5 rounded-xl border border-gold/40 bg-white/10 text-[0.8125rem] font-bold text-white no-underline backdrop-blur-sm transition-all duration-200 hover:border-gold hover:bg-white/15 active:scale-[0.98]"
              >
                Post Property
                <ArrowR className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
