import Image from 'next/image';

interface AudienceTileProps {
  label: string;
  testimonial: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Index used to pick a fallback color when no image is provided. */
  index?: number;
}

const FALLBACK_COLORS = [
  'var(--pacific-400)',
  'var(--limeade-400)',
  'var(--lemonade-400)',
  'var(--oat-300)',
  'var(--pacific-600)',
  'var(--lime-400)',
  'var(--lemonade-300)',
  'var(--limeade-500)',
] as const;

/**
 * Single tile in the Audience Mosaic. Default style is a square photo or
 * color-block with the label visible at all times; on hover/focus the
 * testimonial overlay slides up.
 *
 * Server component — no client JS needed (hover is pure CSS).
 */
export function AudienceTile({
  label,
  testimonial,
  imageSrc,
  imageAlt,
  index = 0,
}: AudienceTileProps) {
  const fallback = FALLBACK_COLORS[index % FALLBACK_COLORS.length];

  return (
    <article
      tabIndex={0}
      className="group relative aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lemonade-400"
      style={imageSrc ? undefined : { background: fallback }}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt ?? ''}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p
          className="text-base font-semibold text-white drop-shadow-md"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {label}
        </p>
      </div>
      <div className="absolute inset-0 flex items-end bg-lapis-900/85 p-4 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        <p
          className="text-sm leading-relaxed text-oat-100"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {testimonial}
        </p>
      </div>
    </article>
  );
}
