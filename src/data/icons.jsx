// Shared inline SVG icon components
export const Ic = ({ d, size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d={d} />
  </svg>
);

export const SearchIco = (props) => (
  <Ic d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" {...props} />
);
export const PinIco = (props) => (
  <Ic
    d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6"
    {...props}
  />
);
export const LocIco = (props) => (
  <Ic d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" size={14} {...props} />
);
export const BedIco = (props) => (
  <Ic
    d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 14h18M5 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
    {...props}
  />
);
export const BathIco = (props) => (
  <Ic d="M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" {...props} />
);
export const AreaIco = (props) => <Ic d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" {...props} />;
export const ArrowR = (props) => <Ic d="M5 12h14M12 5l7 7-7 7" size={14} {...props} />;
export const FilterIco = (props) => <Ic d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" {...props} />;
export const GpsIco = (props) => (
  <Ic d="M12 2v3M12 19v3M2 12h3M19 12h3M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" {...props} />
);
export const LoaderIco = (props) => (
  <Ic
    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
    size={14}
    {...props}
  />
);
export const BellIco = (props) => (
  <Ic d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" {...props} />
);

export const MenuIco = (props) => <Ic d="M4 6h16M4 12h16M4 18h16" {...props} />;
export const CloseIco = (props) => <Ic d="M18 6L6 18M6 6l12 12" {...props} />;
export const ChevronL = (props) => <Ic d="M15 18l-6-6 6-6" size={18} {...props} />;
export const ChevronR = (props) => <Ic d="M9 18l6-6-6-6" size={18} {...props} />;

export const IconFlats = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
    <path d="M14 22v-4a2 2 0 0 0-4 0v4" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);
export const IconCommercial = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);
export const IconVilla = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
export const IconPlots = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

export const IconTrendingDown = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);
export const IconCheckCircle = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
export const IconStar = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
export const IconSparkles = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
export const IconSearchAlert = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="12" />
    <line x1="11" y1="16" x2="11.01" y2="16" />
  </svg>
);
export const BuyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '14px', height: '14px', flexShrink: 0 }}
  >
    <path d="M3 9l1-5h16l1 5" /> <path d="M3 9h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <path d="M9 9v3a3 3 0 0 0 6 0V9" />
  </svg>
);
export const IconMessage = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
export const DashboardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '14px', height: '14px', flexShrink: 0 }}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const LogoIcon = ({ className = 'w-10 h-10', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Roof */}
    <path d="M3 9l9-6 9 6" />
    {/* House walls */}
    <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
    {/* Stylized Y structure inside */}
    <path d="M7 9l5 5 5-5" />
    <path d="M12 14v7" />
  </svg>
);

/** Footer social icons — `currentColor` (set `text-white` on the button for bright icons) */
const SocialSvg = ({ size = 20, className = '', children, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const FacebookIco = ({ size = 20, className = '', ...props }) => (
  <SocialSvg size={size} className={className} {...props}>
    <path
      fill="currentColor"
      d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V3.5C16.24 3.5 14.94 3 13.5 3 11.01 3 9 4.99 9 7.5V9.5H6.5v4H9v9h5v-9z"
    />
  </SocialSvg>
);

export const InstagramIco = ({ size = 20, className = '', ...props }) => (
  <SocialSvg size={size} className={className} fill="none" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" />
  </SocialSvg>
);

export const LinkedinIco = ({ size = 20, className = '', ...props }) => (
  <SocialSvg size={size} className={className} {...props}>
    <path
      fill="currentColor"
      d="M6.94 6.5A2.12 2.12 0 1 1 6.93 2.5a2.12 2.12 0 0 1 .01 4zM3.5 9h3.5v12H3.5V9zm7 0H14v1.64c.51-.98 1.76-2.02 3.62-2.02 3.88 0 4.6 2.55 4.6 5.87V21h-3.5v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21h-3.5V9z"
    />
  </SocialSvg>
);

export const YoutubeIco = ({ size = 20, className = '', ...props }) => (
  <SocialSvg size={size} className={className} {...props}>
    <path
      fill="currentColor"
      d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"
    />
  </SocialSvg>
);

export const TwitterIco = ({ size = 20, className = '', ...props }) => (
  <SocialSvg size={size} className={className} {...props}>
    <path
      fill="currentColor"
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 3.164-4.126L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
    />
  </SocialSvg>
);

export const FOOTER_SOCIAL_ICON_MAP = {
  facebook: FacebookIco,
  instagram: InstagramIco,
  linkedin: LinkedinIco,
  youtube: YoutubeIco,
  twitter: TwitterIco,
};
