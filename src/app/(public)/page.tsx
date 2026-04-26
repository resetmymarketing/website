import Image from 'next/image';
import { ButtonLink } from '@/components/ui/button-link';
import { ArrowRight } from 'lucide-react';
import { SunBadge } from '@/components/brand/SunBadge';
import { StripeDivider } from '@/components/brand/StripeDivider';
import { StrikethroughCycler } from '@/components/motion/StrikethroughCycler';
import { SunArc } from '@/components/motion/SunArc';
import { NoiseToSignal } from '@/components/motion/NoiseToSignal';
import { AudienceMosaic } from '@/components/motion/AudienceMosaic';
import {
  HERO_COPY,
  NOISE_TO_SIGNAL_COPY,
  AUDIENCE_MOSAIC_COPY,
} from '@/lib/copy/home';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Ambient sun arc — traverses the page on scroll */}
      <SunArc size={140} />

      {/* === Section 1: Hero (Chapter 01) === */}
      <section className="relative overflow-hidden bg-pacific-500 px-4 pt-12 pb-24 sm:px-6 lg:px-8 lg:pt-20 lg:pb-32">
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

      {/* === Section 4: Noise to Signal (pinned) === */}
      <NoiseToSignal
        noise={NOISE_TO_SIGNAL_COPY.noiseChips}
        signalHeadline={NOISE_TO_SIGNAL_COPY.signalHeadline}
        signalBody={NOISE_TO_SIGNAL_COPY.signalBody}
      />

      {/* What you walk away with — staggered, not grid */}
      <section className="bg-brand-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-700">
            What You Walk Away With
          </p>
          <h2 className="mt-2 text-3xl font-bold text-brand-800">
            Clarity, strategy, and a clear next step.
          </h2>

          <div className="mt-16 space-y-16 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16">
            {/* Item 1 — spans left side */}
            <div className="lg:col-span-5">
              <span className="text-5xl font-bold text-brand-200">01</span>
              <h3 className="mt-3 text-xl font-semibold text-brand-800">Clarity on Your Message</h3>
              <p className="mt-2 text-warm-800">
                Know exactly who you are talking to, what to say, and how to stand out
                without sounding like everyone else.
              </p>
            </div>

            {/* Item 2 — offset right */}
            <div className="lg:col-span-5 lg:col-start-7 lg:pt-12">
              <span className="text-5xl font-bold text-sage-200">02</span>
              <h3 className="mt-3 text-xl font-semibold text-brand-800">A Strategy That Fits</h3>
              <p className="mt-2 text-warm-800">
                No cookie-cutter templates. You get a marketing direction built around your
                strengths, your time, and your real capacity.
              </p>
            </div>

            {/* Item 3 — back to center-left */}
            <div className="lg:col-span-5 lg:col-start-2">
              <span className="text-5xl font-bold text-brand-200">03</span>
              <h3 className="mt-3 text-xl font-semibold text-brand-800">A Clear Next Step</h3>
              <p className="mt-2 text-warm-800">
                Walk away knowing what to do first, what to stop doing, and where your
                marketing energy should actually go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === Section 5: Audience Mosaic === */}
      <AudienceMosaic
        tiles={[...AUDIENCE_MOSAIC_COPY.tiles]}
        eyebrow={AUDIENCE_MOSAIC_COPY.eyebrow}
        headline={AUDIENCE_MOSAIC_COPY.headline}
      />

      {/* CTA — bold, dark */}
      <section className="bg-brand-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to get honest about your marketing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-200">
            This is not a course. It is a single, focused engagement
            designed to give you the clarity you have been looking for.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact" size="lg">
              Let us Talk
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
