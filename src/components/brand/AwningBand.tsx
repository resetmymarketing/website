type AwningColor = 'pacific' | 'lapis' | 'lemonade' | 'limeade' | 'lime' | 'oat';

const FILL_VAR: Record<AwningColor, string> = {
  pacific: 'var(--pacific-500)',
  lapis: 'var(--lapis-500)',
  lemonade: 'var(--lemonade-400)',
  limeade: 'var(--limeade-500)',
  lime: 'var(--lime-500)',
  oat: 'var(--oat-200)',
};

interface AwningBandProps {
  color?: AwningColor;
  stripeWidth?: number;
  bandHeight?: number;
  scallopHeight?: number;
  className?: string;
}

/**
 * Shop-awning trim: alternating white + colored vertical stripes with a
 * scalloped bottom edge. Full-width SVG that tiles in fixed pixels.
 */
export function AwningBand({
  color = 'pacific',
  stripeWidth = 24,
  bandHeight = 18,
  scallopHeight = 10,
  className,
}: AwningBandProps) {
  const fill = FILL_VAR[color];
  const patternWidth = stripeWidth * 2;
  const totalHeight = bandHeight + scallopHeight;
  const radiusX = stripeWidth / 2;
  const patternId = `awning-${color}-${stripeWidth}-${bandHeight}-${scallopHeight}`;

  return (
    <svg
      role="presentation"
      aria-hidden="true"
      width="100%"
      height={totalHeight}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <pattern
          id={patternId}
          width={patternWidth}
          height={totalHeight}
          patternUnits="userSpaceOnUse"
        >
          <rect x={0} y={0} width={stripeWidth} height={bandHeight} fill="#ffffff" />
          <path
            d={`M0,${bandHeight} L${stripeWidth},${bandHeight} A${radiusX},${scallopHeight} 0 0 1 0,${bandHeight} Z`}
            fill="#ffffff"
          />
          <rect x={stripeWidth} y={0} width={stripeWidth} height={bandHeight} fill={fill} />
          <path
            d={`M${stripeWidth},${bandHeight} L${patternWidth},${bandHeight} A${radiusX},${scallopHeight} 0 0 1 ${stripeWidth},${bandHeight} Z`}
            fill={fill}
          />
        </pattern>
      </defs>
      <rect x={0} y={0} width="100%" height={totalHeight} fill={`url(#${patternId})`} />
    </svg>
  );
}
