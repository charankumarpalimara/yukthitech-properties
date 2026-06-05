import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { ArrowR } from '../../data/icons';
import './InfoLayout.css';

export default function InfoLayout({ title, subtitle, children }) {
  const location = useLocation();
  const currentPath = location.pathname;

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
    <div className="info-page">
      <div className="info-page__container">
        <nav className="info-page__breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="info-page__breadcrumb-link">
            <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
          <span className="info-page__breadcrumb-current">{title}</span>
        </nav>

        <div className="info-page__grid">
          <main className="info-page__main">
            <header className="info-page__header">
              <span className="info-page__eyebrow">Support &amp; Information</span>
              <h1 className="info-page__title">{title}</h1>
              {subtitle && <p className="info-page__subtitle">{subtitle}</p>}
            </header>

            <div className="info-main-panel">{children}</div>
          </main>

          <aside className="info-page__sidebar" aria-label="Related pages">
            {sections.map((section) => (
              <nav key={section.title} className="info-page__nav-card" aria-label={section.title}>
                <h4 className="info-page__nav-title">{section.title}</h4>
                <ul className="info-page__nav-list">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentPath === link.path;
                    return (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className={`info-page__nav-link${isActive ? ' info-page__nav-link--active' : ''}`}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}

            <div className="info-page__cta-card">
              <h3 className="info-page__cta-title">Looking for a property in Hyderabad?</h3>
              <p className="info-page__cta-text">
                Browse verified listings on Yukthi Properties.
              </p>
              <Link to="/properties" className="info-page__cta-btn info-page__cta-btn--primary">
                Search Properties
                <ArrowR className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>

            <div className="info-page__cta-card info-page__cta-card--brand">
              <h3 className="info-page__cta-title info-page__cta-title--accent">
                Are you an Owner or Agent?
              </h3>
              <p className="info-page__cta-text">
                List your property to reach buyers.
              </p>
              <Link to="/subscription" className="info-page__cta-btn info-page__cta-btn--ghost">
                Post Property
                <ArrowR className="h-3.5 w-3.5 text-gold" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
