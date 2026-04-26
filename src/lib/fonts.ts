import { Fraunces, Inter } from 'next/font/google';

/**
 * Fraunces — display face for editorial moments (H1-H3, italic emphasis).
 * Bound to CSS variable --font-fraunces, exposed as Tailwind `font-display`.
 */
export const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

/**
 * Inter — body and UI text.
 * Bound to CSS variable --font-inter, exposed as Tailwind `font-body`.
 */
export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
