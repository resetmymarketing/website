type SunVariant = 'solid' | 'ringed';

interface SunBadgeProps {
  size?: number;
  variant?: SunVariant;
  className?: string;
}

/**
 * The Lemonade sun motif. Reused as hero ornament, section marker, and
 * loading indicator. Pure SVG — no JS, no client boundary required.
 */
export function SunBadge({ size = 80, variant = 'solid', className }: SunBadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Lemonade sun"
      className={className}
    >
      {variant === 'ringed' && (
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--lapis-500)"
          strokeWidth="2"
          strokeDasharray="3 4"
        />
      )}
      <circle cx="50" cy="50" r="40" fill="var(--lemonade-400)" />
    </svg>
  );
}
