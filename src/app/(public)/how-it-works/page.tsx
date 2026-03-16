import type { Metadata } from 'next';
import Image from 'next/image';
import { ButtonLink } from '@/components/ui/button-link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how The Marketing Reset works: from initial contact to your strategic marketing clarity session and deliverables.',
};

const steps = [
  {
    number: '01',
    title: 'You reach out',
    description:
      'Fill out the contact form and tell me a little about your business and what you are dealing with. No commitment, just a starting point.',
  },
  {
    number: '02',
    title: 'Intake and assessment',
    description:
      'If it looks like a good fit, you will complete a detailed intake form. This gives me everything I need to prepare a thorough analysis before our session.',
  },
  {
    number: '03',
    title: 'Your strategy session',
    description:
      'We meet for a focused, one-on-one session. I walk you through what I found, what is working, what is not, and where your marketing should go from here.',
  },
  {
    number: '04',
    title: 'Your deliverables',
    description:
      'After our session, you receive a personalized set of strategic recommendations, messaging direction, and an action plan you can start using immediately.',
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero — image background with text overlay at bottom */}
      <section className="relative min-h-[50vh] overflow-hidden lg:min-h-[60vh]">
        <Image
          src="/images/cozy-workspace.jpg"
          alt="A minimal workspace with a laptop, planner, and coffee cup on a wooden desk"
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/30 to-transparent" />
        <div className="relative z-10 flex min-h-[50vh] items-end px-4 pb-12 sm:px-6 lg:min-h-[60vh] lg:px-8 lg:pb-16">
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-200">
              The Process
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
              Simple process. Real results.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-100">
              Not a drawn-out engagement. A focused, strategic process designed to give you
              clarity as efficiently as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Steps — vertical timeline feel */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.number} className="relative grid gap-6 pb-16 sm:grid-cols-12 sm:gap-8 last:pb-0">
                {/* Timeline line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[1.35rem] top-14 hidden h-[calc(100%-3.5rem)] w-px bg-brand-200 sm:left-[calc(16.667%-0.5px)] sm:block" />
                )}
                {/* Number */}
                <div className="sm:col-span-2 sm:text-center">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                    {step.number}
                  </span>
                </div>
                {/* Content */}
                <div className="sm:col-span-10">
                  <h3 className="text-xl font-semibold text-brand-800">{step.title}</h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-warm-800">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is included — horizontal scroll feel */}
      <section className="bg-brand-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-300">
            Your Deliverables
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">What is included</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'A comprehensive pre-session analysis of your current marketing presence',
              'A focused one-on-one strategy session',
              'A personalized messaging and positioning guide',
              'Prioritized action items tailored to your capacity and goals',
              'A follow-up check-in to answer questions after you have had time to review',
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-brand-600 bg-brand-700/50 px-5 py-4"
              >
                <span className="text-sm leading-relaxed text-brand-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — clean, no cards */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-brand-800">Common questions</h2>
          <div className="mt-10 divide-y divide-warm-200">
            {[
              {
                q: 'How long does the whole process take?',
                a: 'From intake to deliverables, most clients complete the process within two to three weeks. The session itself is typically 60 to 90 minutes.',
              },
              {
                q: 'Is this an ongoing service?',
                a: 'No. The Marketing Reset is a one-time engagement. You get what you need and move forward on your own. If you want to check in later, that option is available, but there is no subscription or retainer.',
              },
              {
                q: 'What if I am not sure this is what I need?',
                a: 'Start with the contact form. That initial conversation is free and no-pressure. If The Marketing Reset is not the right fit, I will tell you.',
              },
              {
                q: 'Do I need to prepare anything?',
                a: 'Just the intake form. It takes about 30 to 45 minutes and covers everything from your business basics to your current marketing efforts. The more honest you are, the better the output.',
              },
            ].map((faq, i) => (
              <div key={i} className="py-6 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-brand-800">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-warm-800">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — inline */}
      <section className="bg-brand-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-800">Ready to reset your marketing?</h2>
            <p className="mt-1 text-warm-800">It starts with a simple conversation.</p>
          </div>
          <ButtonLink href="/get-started" size="lg" className="flex-shrink-0">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
