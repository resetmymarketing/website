/**
 * Source-of-truth for all home page copy. Components and tests import from
 * here so any copy change lands in one place.
 *
 * Karli reviews and edits this file directly when refining wording.
 */

export const HERO_COPY = {
  eyebrow: 'For service businesses',
  cyclerTactics: ['Post every day.', 'Start a TikTok.', 'Run more ads.'] as const,
  resolution: 'Start with clarity.',
  resolutionEmphasis: 'clarity', // word inside the resolution that gets <Highlight>
  subhead:
    'One strategic session. A plan shaped around your real work, not someone else’s playbook.',
  ctaPrimary: { label: 'Start your reset', href: '/get-started' },
  ctaSecondary: { label: 'How it works', href: '/how-it-works' },
} as const;

export const WHO_THIS_IS_FOR_COPY = {
  eyebrow: 'Who this is for',
  headline: 'You love the work. You don’t love figuring out marketing alone.',
  emphasisWords: ['don’t love'] as const, // wrapped with <Highlight color="lemonade">
  body: 'If you run a service business, salon, tattoo studio, bakery, spa, florist, bookkeeper, coach, this is for you. Not for product brands, not for agencies, not for funnel hackers.',
  tags: [
    { label: 'Salons & studios', color: 'pacific' as const },
    { label: 'Wellness & beauty', color: 'limeade' as const },
    { label: 'Food & hospitality', color: 'lemonade' as const },
    { label: 'Consultants & coaches', color: 'lapis' as const },
  ],
} as const;

export const THREE_SHIFTS_COPY = {
  eyebrow: 'Three shifts',
  headline: 'What changes after one Reset.',
  pillars: [
    {
      number: '01',
      numberColor: 'lemonade' as const,
      title: 'Clarity on your message',
      body: 'You know exactly who you’re talking to, what to say, and how to stand out without sounding like everyone else.',
    },
    {
      number: '02',
      numberColor: 'limeade' as const,
      title: 'A strategy that fits',
      body: 'No cookie-cutter templates. A direction built around your strengths, your time, and your real capacity.',
    },
    {
      number: '03',
      numberColor: 'lime' as const,
      title: 'A clear next step',
      body: 'You walk away knowing what to do first, what to stop doing, and where your marketing energy should actually go.',
    },
  ],
} as const;

export const NOISE_TO_SIGNAL_COPY = {
  eyebrow: 'Noise to signal',
  noiseChips: [
    'Post twice a day',
    'Run Meta ads',
    'Start a podcast',
    'Build a funnel',
    'Email weekly',
    'Get on TikTok',
    'Hire an agency',
    'Brand kit refresh',
    'New website',
    'Lead magnet',
  ] as const,
  signalHeadline: 'One sentence. The one that fits you.',
  signalBody:
    'The Reset cuts through the noise of every tactic you’ve been told to try, and leaves you with the one direction that actually fits your business.',
} as const;

export const AUDIENCE_MOSAIC_COPY = {
  eyebrow: 'You’re in good company',
  headline: 'Built for the businesses people actually love.',
  tiles: [
    { label: 'Salons', testimonial: 'Stylists who care about the chair, not the algorithm.' },
    { label: 'Bakeries', testimonial: 'Real flour, real ovens, real customers.' },
    { label: 'Florists', testimonial: 'You arrange beauty for a living. Marketing should reflect that.' },
    { label: 'Spas & Wellness', testimonial: 'Calm spaces deserve calm marketing.' },
    { label: 'Tattoo Studios', testimonial: 'Your portfolio speaks. Your strategy should match.' },
    { label: 'Coffee Shops', testimonial: 'The third place. Marketing that respects it.' },
    { label: 'Bookkeepers', testimonial: 'Trust is the product. Show it that way.' },
    { label: 'Coaches & Consultants', testimonial: 'Your work changes lives. Your marketing can too.' },
  ],
} as const;

export const FINAL_CTA_COPY = {
  headline: 'Ready to stop guessing?',
  body: 'One Reset. One plan. No retainer.',
  cta: { label: 'Start your reset', href: '/get-started' },
} as const;
