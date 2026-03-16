/**
 * HTML entity escaping for XSS prevention.
 * All user-supplied strings pass through this before storage or display.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return escapeHtml(input.trim());
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().toLowerCase();
}
