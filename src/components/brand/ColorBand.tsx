type BandColor = 'pacific' | 'lapis' | 'lemonade' | 'limeade' | 'lime' | 'oat';

const BG_VAR: Record<BandColor, string> = {
  pacific: 'var(--pacific-500)',
  lapis: 'var(--lapis-500)',
  lemonade: 'var(--lemonade-400)',
  limeade: 'var(--limeade-500)',
  lime: 'var(--lime-500)',
  oat: 'var(--oat-200)',
};

interface ColorBandProps {
  color?: BandColor;
  height?: number;
  className?: string;
}

/**
 * Solid-color horizontal trim. Used as piping between adjacent sections
 * (e.g. Lemonade band between the Pacific hero and Oat "Who" section).
 */
export function ColorBand({ color = 'lemonade', height = 8, className }: ColorBandProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={className}
      style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: BG_VAR[color],
      }}
    />
  );
}
