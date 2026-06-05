const variantClasses = {
  green: 'badge-green',
  amber: 'badge-amber',
  red: 'badge-red',
  blue: 'badge-blue',
  slate: 'badge-slate',
  violet: 'badge-violet',
  rose: 'badge-rose',
  indigo: 'badge-indigo',
  sky: 'badge-sky',
  orange: 'badge-orange',
};

const statusVariants = {
  Active: 'green',
  Inactive: 'slate',
  Suspended: 'red',
  Pending: 'amber',
  Expired: 'red',
  Rejected: 'red',
  Basic: 'slate',
  Standard: 'amber',
  Premium: 'blue',
};

export default function Badge({ children, variant }) {
  const v = variant || statusVariants[children] || 'slate';
  return (
    <span className={variantClasses[v] || 'badge badge-slate'}>
      <span className="w-1 h-1 rounded-full bg-current mr-1 inline-block"></span>
      {children}
    </span>
  );
}
