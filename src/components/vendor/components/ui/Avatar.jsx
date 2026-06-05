const sizeClasses = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-24 h-24 text-2xl',
  '3xl': 'w-32 h-32 text-3xl',
};

const colorPalette = [
  'from-amber-400 to-amber-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
  'from-teal-400 to-teal-600',
  'from-orange-400 to-orange-600',
  'from-indigo-400 to-indigo-600',
];

function getColor(initials) {
  if (!initials) return colorPalette[0];
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  return colorPalette[code % colorPalette.length];
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({ initials, name, size = 'md', className = '' }) {
  const avatarInitials = initials || getInitials(name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const gradient = getColor(avatarInitials);

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 ${className} overflow-hidden`}
    >
      <span className="text-white font-bold uppercase">{avatarInitials}</span>
    </div>
  );
}
