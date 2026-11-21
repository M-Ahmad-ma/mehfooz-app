const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--:--';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, '0')}`
    : `0:${String(seconds).padStart(2, '0')}`;
}

export function shortHash(hash: string, edge = 6): string {
  if (!hash) return '';
  if (hash.length <= edge * 2 + 1) return hash;
  return `${hash.slice(0, edge)}…${hash.slice(-edge)}`;
}

export function initials(name: string): string {
  const cleaned = name
    .replace(/^@/, '')
    .replace(/[^A-Za-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]/g, ' ')
    .trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatDateRange(items: { receivedAt: string }[]): string {
  if (items.length === 0) return 'No evidence selected';
  const sorted = [...items].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  );
  const first = formatDate(sorted[0].receivedAt);
  const last = formatDate(sorted[sorted.length - 1].receivedAt);
  return first === last ? first : `${first} – ${last}`;
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`);
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function sourceLabel(source: string, appLabel?: string): string {
  if (source === 'screenshot') return 'Shared screenshot';
  if (source === 'notification') {
    return appLabel ? `Notification · ${appLabel}` : 'Message notification';
  }
  return 'Demo feed';
}

export function fileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

export function classifierSourceLabel(source?: string, model?: string): string {
  if (source === 'gemini') return model ? `Gemini · ${model}` : 'Gemini';
  if (source === 'rules-fallback') return 'Local rules · Gemini fallback';
  return 'Local rules';
}
