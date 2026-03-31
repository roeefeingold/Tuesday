import { STATUSES, PRIORITIES } from './constants';

export function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return '\u05E2\u05DB\u05E9\u05D9\u05D5';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `\u05DC\u05E4\u05E0\u05D9 ${minutes} \u05D3\u05E7\u05D5\u05EA`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `\u05DC\u05E4\u05E0\u05D9 ${hours} \u05E9\u05E2\u05D5\u05EA`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `\u05DC\u05E4\u05E0\u05D9 ${days} \u05D9\u05DE\u05D9\u05DD`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `\u05DC\u05E4\u05E0\u05D9 ${weeks} \u05E9\u05D1\u05D5\u05E2\u05D5\u05EA`;

  const months = Math.floor(days / 30);
  if (months < 12) return `\u05DC\u05E4\u05E0\u05D9 ${months} \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD`;

  const years = Math.floor(days / 365);
  return `\u05DC\u05E4\u05E0\u05D9 ${years} \u05E9\u05E0\u05D9\u05DD`;
}

export function getTicketAge(createdAt) {
  if (!createdAt) return 0;
  const date = new Date(createdAt);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

export function getAgeEmoji(days) {
  if (days <= 2) return '\u{1F60A}';
  if (days <= 5) return '\u{1F610}';
  if (days <= 9) return '\u{1F61F}';
  return '\u{1F620}';
}

export function getAgeLabel(days) {
  if (days === 0) return '\u05D4\u05D9\u05D5\u05DD';
  if (days === 1) return '\u05D9\u05D5\u05DD 1';
  if (days < 7) return `${days} \u05D9\u05DE\u05D9\u05DD`;
  if (days < 14) return '\u05E9\u05D1\u05D5\u05E2';
  if (days < 30) return `${Math.floor(days / 7)} \u05E9\u05D1\u05D5\u05E2\u05D5\u05EA`;
  return `${Math.floor(days / 30)} \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD`;
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
