type StripeColor = 'lime' | 'lapis' | 'pacific' | 'limeade' | 'lemonade';

const STROKE_VAR: Record<StripeColor, string> = {
  lime: 'var(--lime-500)',
  lapis: 'var(--lapis-500)',
  pacific: 'var(--pacific-500)',
  limeade: 'var(--limeade-500)',
  lemonade: 'var(--lemonade-500)',
};

interface StripeDividerProps {
  color?: StripeColor;
  className?: string;
}

/**
 * Hand-drawn stripe divider used to mark chapter starts. Three short ink
 * strokes with subtle vertical jitter. CSS-only animation keeps cost low.
 */
export function StripeDivider({ color = 'lime', className }: StripeDividerProps) {
  const stroke = STROKE_VAR[color];
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`flex items-center gap-2 ${className ?? ''}`}
    >
      <svg width="64" height="14" viewBox="0 0 64 14" fill="none">
        <path
          d="M2 7 L 18 5"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M22 8 L 38 6"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M42 7 L 60 9"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
