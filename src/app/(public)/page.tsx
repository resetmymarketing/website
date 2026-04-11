import Image from 'next/image';
import { ButtonLink } from '@/components/ui/button-link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero — full-bleed image with overlay */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <Image
          src="/images/strategy-session.jpg"
          alt="Two people having a focused strategy conversation over coffee and notebooks at a cafe"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-900/70" />
        <div className="relative z-10 flex min-h-[70vh] items-end px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-200">
              Strategic Marketing Clarity
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your marketing should reflect the quality of what you actually do.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-100">
              A one-time strategic clarity service for service-based businesses that need to
              realign their messaging, brand presence, and client attraction strategy.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/get-started" size="lg">
                Start Your Reset
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/how-it-works"
                variant="outline"
                size="lg"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                See How It Works
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Tension statement — big editorial type */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start gap-6">
            <span className="hidden text-7xl font-bold leading-none text-brand-200 sm:block">&ldquo;</span>
            <div>
              <h2 className="text-2xl font-bold leading-relaxed text-brand-800 sm:text-3xl lg:text-4xl">
                You have been posting, tweaking, second-guessing. Maybe you hired someone who
                did not quite get it. The Marketing Reset gives you one focused session to
                cut through the noise.
              </h2>
              <div className="mt-8 h-1 w-16 rounded-full bg-sage-500" />
            </div>
          </div>
        </div>
      </section>

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

      {/* Image break — notebook, edge-to-edge on left */}
      <section className="lg:grid lg:grid-cols-2">
        <div className="relative aspect-[4/3] lg:aspect-auto">
          <Image
            src="/images/notebook-pen.jpg"
            alt="An open lined notebook with a pen resting on it, ready for planning"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="flex items-center px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-700">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brand-800">
              One engagement. No retainer. Just clarity.
            </h2>
            <p className="mt-4 text-warm-800">
              You complete a consultation, we meet for a focused strategy session, and you
              walk away with a personalized action plan. The whole process takes two to three weeks.
            </p>
            <div className="mt-8">
              <ButtonLink href="/how-it-works" variant="outline" size="lg">
                See the Full Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

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
