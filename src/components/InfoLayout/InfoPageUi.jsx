import parse from 'html-react-parser';
import he from 'he';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { normalizeCmsProseHtml } from '../../utils/normalizeCmsProseHtml';

/** Loading state for CMS-backed info pages */
export function InfoPageBody({ loading, cmsHtml, children }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-medium text-slate-500">Loading…</p>
      </div>
    );
  }

  if (cmsHtml) {
    const cleaned = normalizeCmsProseHtml(he.decode(cmsHtml));
    return <InfoProse>{parse(cleaned)}</InfoProse>;
  }

  return <div className="info-body">{children}</div>;
}

/** CMS HTML from admin */
export function InfoProse({ children, className = '' }) {
  return <div className={`info-prose max-w-none ${className}`}>{children}</div>;
}

export function InfoLead({ children, className = '' }) {
  return (
    <p
      className={`text-base sm:text-lg font-medium text-slate-800 leading-relaxed border-l-4 border-gold pl-4 py-1 bg-primary-light/60 rounded-r-xl ${className}`}
    >
      {children}
    </p>
  );
}

export function InfoText({ children, className = '' }) {
  return (
    <p className={`text-sm sm:text-[0.9375rem] text-slate-600 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function InfoSectionTitle({ children, label, className = '' }) {
  return (
    <div className={`info-section-head ${className}`}>
      {label && <span className="section-label">{label}</span>}
      <h2 className="section-title">{children}</h2>
    </div>
  );
}

export function InfoSubheading({ children, icon: Icon }) {
  return (
    <h3 className="flex items-center gap-2.5 text-base font-semibold text-slate-900">
      {Icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      )}
      {children}
    </h3>
  );
}

export function InfoMetaBadge({ children, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
      {children}
    </span>
  );
}

export function InfoCardGrid({ children, cols = 'md:grid-cols-2' }) {
  return <div className={`grid grid-cols-1 ${cols} gap-4`}>{children}</div>;
}

export function InfoCard({ icon: Icon, title, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-primary/25 hover:shadow-md ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      {title && <h4 className="mb-2 text-base font-semibold text-slate-900">{title}</h4>}
      {children}
    </div>
  );
}

export function InfoListCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-colors hover:border-primary/25">
      {Icon && title && (
        <h3 className="mb-3 flex items-center gap-2.5 text-base font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function InfoQuote({ children, attribution }) {
  return (
    <blockquote className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-primary via-[#034432] to-primary-dark p-6 sm:p-8 text-white shadow-[0_12px_32px_-12px_rgba(2,53,38,0.25)]">
      <div
        className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-gold/20 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-gold to-gold-dark/70"
        aria-hidden
      />
      <p className="relative z-10 pl-2 text-base font-medium italic leading-relaxed text-slate-100">
        {children}
      </p>
      {attribution && (
        <p className="relative z-10 mt-4 pl-2 text-xs font-bold uppercase tracking-widest text-gold">
          {attribution}
        </p>
      )}
    </blockquote>
  );
}

const alertStyles = {
  default: 'border-primary/20 bg-primary/5 text-primary',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
};

export function InfoAlert({ variant = 'default', icon: Icon, title, children }) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border p-4 sm:p-5 ${alertStyles[variant] || alertStyles.default}`}
    >
      {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-80" />}
      <div className="min-w-0 text-sm leading-relaxed">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function InfoHighlightPanel({ children, className = '' }) {
  return (
    <div
      className={`grid gap-6 rounded-2xl border border-gold/20 bg-gradient-to-br from-primary via-[#034432] to-primary-dark p-6 text-white shadow-[0_12px_32px_-12px_rgba(2,53,38,0.2)] sm:grid-cols-2 sm:gap-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function InfoSteps({ steps }) {
  return (
    <div className="space-y-4">
      {steps.map((step, idx) => (
        <div
          key={step.level || idx}
          className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-primary/25"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {idx + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {step.level && (
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {step.level}
                </span>
              )}
              <h4 className="text-base font-semibold text-slate-900">{step.title}</h4>
              {step.resolution && (
                <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {step.resolution}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfoContactLines({ lines }) {
  return (
    <div className="space-y-1">
      {lines.map((line) => (
        <p key={line} className="text-sm text-slate-600 leading-snug">
          {line}
        </p>
      ))}
    </div>
  );
}

export function InfoJobCard({ title, location, type, onApply }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h4 className="text-base font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-500">
          {location} · {type}
        </p>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-95"
      >
        Apply now
      </button>
    </div>
  );
}

export function InfoForm({ onSubmit, children, className = '' }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm ${className}`}
    >
      {children}
    </form>
  );
}

export function InfoFormRow({ children }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>;
}

export function InfoField({ label, icon: Icon, children, className = '', multiline }) {
  const iconTop = multiline ? 'top-3' : 'top-1/2 -translate-y-1/2';
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3 h-[18px] w-[18px] text-slate-400 ${iconTop}`}
          />
        )}
        {children}
      </div>
    </div>
  );
}

const fieldBase =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm focus:border-primary focus:ring-[3px] focus:ring-primary/10';

export function InfoInput({ icon, className = '', ...props }) {
  return (
    <input className={`${fieldBase} ${icon ? 'pl-10' : 'px-3'} ${className}`} {...props} />
  );
}

export function InfoSelect({ icon, className = '', children, ...props }) {
  return (
    <select className={`${fieldBase} ${icon ? 'pl-10' : 'px-3'} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function InfoTextarea({ icon, className = '', rows = 5, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${fieldBase} resize-y min-h-[100px] ${icon ? 'pl-10 pt-3' : 'px-3'} ${className}`}
      {...props}
    />
  );
}

export function InfoSubmit({ children, className = '', ...props }) {
  return (
    <button
      type="submit"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function InfoLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`font-semibold text-primary underline-offset-2 hover:text-primary-dark hover:underline ${className}`}
    >
      {children}
    </Link>
  );
}

export function InfoMailLink({ email, className = '' }) {
  return (
    <a
      href={`mailto:${email}`}
      className={`font-semibold text-primary transition-colors hover:text-primary-dark ${className}`}
    >
      {email}
    </a>
  );
}
