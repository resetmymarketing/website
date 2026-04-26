import { ButtonLink } from '@/components/ui/button-link';
import { ArrowRight } from 'lucide-react';
import { Highlight } from '@/components/motion/Highlight';
import { SunBadge } from '@/components/brand/SunBadge';
import { StripeDivider } from '@/components/brand/StripeDivider';
import { StrikethroughCycler } from '@/components/motion/StrikethroughCycler';
import { SunArc } from '@/components/motion/SunArc';
import { NoiseToSignal } from '@/components/motion/NoiseToSignal';
import { AudienceMosaic } from '@/components/motion/AudienceMosaic';
import {
  HERO_COPY,
  WHO_THIS_IS_FOR_COPY,
  THREE_SHIFTS_COPY,
  NOISE_TO_SIGNAL_COPY,
  AUDIENCE_MOSAIC_COPY,
  FINAL_CTA_COPY,
} from '@/lib/copy/home';

const TAG_BG: Record<'pacific' | 'limeade' | 'lemonade' | 'lapis', string> = {
  pacific: 'bg-pacific-400 text-white',
  limeade: 'bg-limeade-400 text-lapis-800',
  lemonade: 'bg-lemonade-400 text-lapis-800',
  lapis: 'bg-lapis-500 text-white',
};

const PILLAR_NUMBER_COLOR: Record<'lemonade' | 'limeade' | 'lime', string> = {
  lemonade: 'text-lemonade-400',
  limeade: 'text-limeade-500',
  lime: 'text-lime-500',
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* Ambient sun arc — traverses the page on scroll */}
      <SunArc size={140} />

      {/* === Section 1: Hero (Chapter 01 — "The Noise") === */}
      <section className="relative overflow-hidden bg-pacific-500 px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-14 lg:pb-20">
        <StripeDivider color="lemonade" className="mb-10" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lemonade-300"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {HERO_COPY.eyebrow}
          </p>
          <h1
            className="mt-6 max-w-4xl text-4xl leading-tight text-white sm:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <StrikethroughCycler
              tactics={HERO_COPY.cyclerTactics}
              resolution={HERO_COPY.resolution}
              resolutionEmphasis={HERO_COPY.resolutionEmphasis}
            />
          </h1>
          <p
            className="mt-8 max-w-xl text-lg text-pacific-50"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {HERO_COPY.subhead}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink
              href={HERO_COPY.ctaPrimary.href}
              size="lg"
              className="rounded-full !bg-lemonade-400 !text-lapis-800 hover:!bg-lemonade-500"
            >
              {HERO_COPY.ctaPrimary.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href={HERO_COPY.ctaSecondary.href}
              variant="outline"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              {HERO_COPY.ctaSecondary.label}
            </ButtonLink>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-12 -right-12 sm:-top-20 sm:-right-20">
          <SunBadge size={260} />
        </div>
      </section>

      {/* === Section 2: Who this is for (Oat band) === */}
      <section className="relative z-10 isolate bg-oat-200 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lime-700"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {WHO_THIS_IS_FOR_COPY.eyebrow}
          </p>
          <h2
            className="mt-3 max-w-3xl text-3xl leading-tight text-lapis-700 sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            You love the work. You{' '}
            <span className="italic">
              <Highlight color="lemonade">don&rsquo;t love</Highlight>
            </span>{' '}
            figuring out marketing alone.
          </h2>
          <p
            className="mt-6 max-w-2xl text-base text-lapis-800"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {WHO_THIS_IS_FOR_COPY.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {WHO_THIS_IS_FOR_COPY.tags.map((tag) => (
              <span
                key={tag.label}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${TAG_BG[tag.color]}`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === Section 3: Three shifts (Pacific pillar grid) === */}
      <section className="relative z-10 isolate bg-pacific-500 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <StripeDivider color="lemonade" className="mb-8" />
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lemonade-300"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {THREE_SHIFTS_COPY.eyebrow}
          </p>
          <h2
            className="mt-3 max-w-3xl text-3xl leading-tight text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {THREE_SHIFTS_COPY.headline}
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
            {THREE_SHIFTS_COPY.pillars.map((pillar) => (
              <div key={pillar.number}>
                <span
                  className={`text-6xl font-bold ${PILLAR_NUMBER_COLOR[pillar.numberColor]}`}
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {pillar.number}
                </span>
                <h3
                  className="mt-4 text-xl text-white"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="mt-2 text-pacific-50"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Section 4: Noise to Signal (pinned scene) === */}
      <NoiseToSignal
        noise={NOISE_TO_SIGNAL_COPY.noiseChips}
        signalHeadline={NOISE_TO_SIGNAL_COPY.signalHeadline}
        signalBody={NOISE_TO_SIGNAL_COPY.signalBody}
      />

      {/* === Section 5: Audience Mosaic === */}
      <AudienceMosaic
        tiles={[...AUDIENCE_MOSAIC_COPY.tiles]}
        eyebrow={AUDIENCE_MOSAIC_COPY.eyebrow}
        headline={AUDIENCE_MOSAIC_COPY.headline}
      />

      {/* === Section 6: Final CTA (Lapis + Lemonade pill) === */}
      <section className="relative z-10 isolate bg-lapis-700 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl">
          <h2
            className="text-3xl text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {FINAL_CTA_COPY.headline}
          </h2>
          <p
            className="mt-4 text-lg text-pacific-100"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {FINAL_CTA_COPY.body}
          </p>
          <div className="mt-10">
            <ButtonLink
              href={FINAL_CTA_COPY.cta.href}
              size="lg"
              className="rounded-full !bg-lemonade-400 !text-lapis-800 hover:!bg-lemonade-500"
            >
              {FINAL_CTA_COPY.cta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
