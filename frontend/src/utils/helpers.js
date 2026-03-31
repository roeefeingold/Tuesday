import { STATUSES, PRIORITIES } from './constants';

export function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'עכשיו';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `לפני ${minutes} דקות`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} שעות`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'לפני יום';
  if (days < 7) return `לפני ${days} ימים`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'לפני שבוע';
  if (weeks < 4) return `לפני ${weeks} שבועות`;

  const months = Math.floor(days / 30);
  if (months === 1) return 'לפני חודש';
  if (months < 12) return `לפני ${months} חודשים`;

  const years = Math.floor(days / 365);
  return `לפני ${years} שנים`;
}

export function getTicketAge(createdAt) {
  if (!createdAt) return 0;
  const date = new Date(createdAt);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

export function getAgeLabel(days) {
  if (days === 0) return 'היום';
  if (days === 1) return 'יום 1';
  if (days < 7) return `${days} ימים`;
  if (days < 14) return 'שבוע';
  if (days < 30) return `${Math.floor(days / 7)} שבועות`;
  return `${Math.floor(days / 30)} חודשים`;
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getStatusInfo(status) {
  const found = STATUSES.find((s) => s.value === status);
  return found || { label: status, color: '#999' };
}

export function getPriorityInfo(priority) {
  const found = PRIORITIES.find((p) => p.value === priority);
  return found || { label: priority, color: '#999' };
}
