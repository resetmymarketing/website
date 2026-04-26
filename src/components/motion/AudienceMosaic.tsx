import { AudienceTile } from './AudienceTile';

interface MosaicTile {
  label: string;
  testimonial: string;
  imageSrc?: string;
  imageAlt?: string;
}

interface AudienceMosaicProps {
  tiles: readonly MosaicTile[];
  eyebrow?: string;
  headline?: string;
  className?: string;
}

/**
 * Grid of <AudienceTile> components on a Lapis background. Each tile shows
 * a label at all times and reveals its testimonial on hover/focus. Server
 * component — no client JS required.
 */
export function AudienceMosaic({
  tiles,
  eyebrow,
  headline,
  className,
}: AudienceMosaicProps) {
  return (
    <section className={`bg-lapis-700 px-4 py-24 sm:px-6 lg:px-8 ${className ?? ''}`}>
      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lemonade-300"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {eyebrow}
          </p>
        )}
        {headline && (
          <h2
            className="mt-2 max-w-3xl text-3xl text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {headline}
          </h2>
        )}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((tile, i) => (
            <AudienceTile key={tile.label} {...tile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
