/**
 * Fit assessment scoring engine.
 *
 * Evaluates a client's intake data against weighted criteria to produce
 * a fit rating (green / yellow / red) and a human-readable summary.
 *
 * Criteria:
 *  - Has a clear service offering (q02)
 *  - Has been in business 1+ years (q03)
 *  - Can articulate an ideal client (q04)
 *  - Currently doing some marketing (q06)
 *  - Can commit time to marketing (q09)
 *  - Has clear success metrics (q11)
 */

type FitRating = 'green' | 'yellow' | 'red';

export interface FitResult {
  rating: FitRating;
  score: number; // 0-100
  flags: FitFlag[];
  summary: string;
}

export interface FitFlag {
  field: string;
  label: string;
  weight: number;
  met: boolean;
  reason: string;
}

interface FitCriterion {
  field: string;
  label: string;
  weight: number;
  evaluate: (value: string | undefined) => { met: boolean; reason: string };
}

const MIN_LENGTH = 10;

function hasSubstantiveAnswer(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length >= MIN_LENGTH;
}

const criteria: FitCriterion[] = [
  {
    field: 'q02',
    label: 'Clear service offering',
    weight: 20,
    evaluate: (v) =>
      hasSubstantiveAnswer(v)
        ? { met: true, reason: 'Client described their services' }
        : { met: false, reason: 'No clear service description provided' },
  },
  {
    field: 'q03',
    label: 'Business experience',
    weight: 10,
    evaluate: (v) =>
      hasSubstantiveAnswer(v)
        ? { met: true, reason: 'Business experience provided' }
        : { met: false, reason: 'No business experience information' },
  },
  {
    field: 'q04',
    label: 'Knows their ideal client',
    weight: 20,
    evaluate: (v) =>
      hasSubstantiveAnswer(v)
        ? { met: true, reason: 'Can articulate their ideal client' }
        : { met: false, reason: 'Cannot articulate ideal client' },
  },
  {
    field: 'q06',
    label: 'Current marketing activity',
    weight: 15,
    evaluate: (v) =>
      hasSubstantiveAnswer(v)
        ? { met: true, reason: 'Currently doing some marketing' }
        : { met: false, reason: 'No current marketing activity described' },
  },
  {
    field: 'q09',
    label: 'Time commitment',
    weight: 15,
    evaluate: (v) =>
      typeof v === 'string' && v.trim().length > 0
        ? { met: true, reason: 'Has indicated time availability' }
        : { met: false, reason: 'No time commitment indicated' },
  },
  {
    field: 'q11',
    label: 'Clear success vision',
    weight: 20,
    evaluate: (v) =>
      hasSubstantiveAnswer(v)
        ? { met: true, reason: 'Has a clear vision of success' }
        : { met: false, reason: 'No clear success metrics defined' },
  },
];

export function assessFit(intakeData: Record<string, string | string[]> | null): FitResult {
  if (!intakeData) {
    return {
      rating: 'red',
      score: 0,
      flags: [],
      summary: 'No intake data available for assessment.',
    };
  }

  const flags: FitFlag[] = [];
  let totalScore = 0;

  for (const criterion of criteria) {
    const rawValue = intakeData[criterion.field];
    const value = Array.isArray(rawValue) ? rawValue.join(', ') : rawValue;
    const result = criterion.evaluate(value);

    flags.push({
      field: criterion.field,
      label: criterion.label,
      weight: criterion.weight,
      met: result.met,
      reason: result.reason,
    });

    if (result.met) {
      totalScore += criterion.weight;
    }
  }

  const rating: FitRating = totalScore >= 70 ? 'green' : totalScore >= 40 ? 'yellow' : 'red';

  const metCount = flags.filter((f) => f.met).length;
  const summary =
    rating === 'green'
      ? `Strong fit. ${metCount} of ${flags.length} criteria met (score: ${totalScore}/100).`
      : rating === 'yellow'
        ? `Potential fit with gaps. ${metCount} of ${flags.length} criteria met (score: ${totalScore}/100). Review flagged items.`
        : `Weak fit. ${metCount} of ${flags.length} criteria met (score: ${totalScore}/100). Consider whether this client is ready for a reset.`;

  return { rating, score: totalScore, flags, summary };
}
