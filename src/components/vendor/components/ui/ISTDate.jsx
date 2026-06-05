export default function ISTDate({ dateString, className = '' }) {
  if (!dateString) return <span className={className}>—</span>;
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  return <span className={className}>{formatted}</span>;
}
