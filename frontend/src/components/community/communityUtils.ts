export function timeAgo(iso: string): string {
  // Ensure the string is treated as UTC if it doesn't have a timezone designator
const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(iso);
const utcIso = hasTimezone ? iso : `${iso}Z`;

  // Date.parse/new Date converts UTC to the user's local system time automatically
  const diff = Date.now() - new Date(utcIso).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  if (minutes < 1 || minutes < 60  || hours < 24) return "Today";
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
