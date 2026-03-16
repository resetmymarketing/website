import type { Metadata } from 'next';
import Image from 'next/image';
import { ButtonLink } from '@/components/ui/button-link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet Karli Rosario, the strategist behind The Marketing Reset. Learn why this service exists and who it is for.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero — asymmetric, text-heavy */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-700">
            About The Marketing Reset
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-brand-800 sm:text-5xl lg:text-6xl">
            Built by someone who gets it.
          </h1>
          <div className="mt-6 h-1 w-16 rounded-full bg-sage-500" />
        </div>
      </section>

      {/* Story — image bleeds left, text right */}
      <section className="lg:grid lg:grid-cols-5">
        <div className="relative aspect-[3/4] lg:col-span-2 lg:aspect-auto">
          <Image
            src="/images/bookshelf-nook.jpg"
            alt="A cozy reading nook with a full bookshelf, plants on the windowsill, and warm cushions"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        </div>
        <div className="flex items-center px-4 py-16 sm:px-6 lg:col-span-3 lg:px-16 lg:py-24">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-brand-800">Why This Exists</h2>
            <div className="mt-6 space-y-4 text-warm-900 leading-relaxed">
              <p>
                Too many service-based businesses are stuck in a cycle of guessing, posting
                without a plan, or following advice that was never designed for their situation.
              </p>
              <p>
                You are not bad at marketing. You just have not had someone sit down with you,
                look at the full picture, and give you honest, strategic direction based on
                where you actually are, not where some template assumes you should be.
              </p>
              <p>
                That is what The Marketing Reset does. One focused engagement. No ongoing
                retainer. No fluff. Just clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it is for — dark band */}
      <section className="bg-brand-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-300">
            Who This Is For
          </p>
          <ul className="mt-8 space-y-6">
            {[
              'Service-based business owners who know their work is strong but their marketing does not show it.',
              'Solo operators or small teams who are tired of guessing what to post, say, or prioritize.',
              'People who have tried templates, courses, or hired help that did not quite land.',
              'Anyone who wants a clear, honest assessment and a realistic plan they can actually follow.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-sage-400" />
                <span className="text-lg text-brand-100 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Values — offset grid */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-700">
            Guiding Principles
          </p>
          <h2 className="mt-2 text-3xl font-bold text-brand-800">What Guides This Work</h2>

          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Honesty over hype',
                desc: 'You deserve real feedback, not validation for the sake of a sale.',
              },
              {
                title: 'Strategy over tactics',
                desc: 'Knowing why matters more than knowing how. Tactics come after clarity.',
              },
              {
                title: 'Your pace, not a formula',
                desc: 'A good strategy accounts for your real capacity, not an ideal one.',
              },
              {
                title: 'Respect for your expertise',
                desc: 'You built something real. Your marketing should reflect that.',
              },
            ].map((value) => (
              <div key={value.title} className="border-t-2 border-brand-200 pt-6">
                <h3 className="font-semibold text-brand-800">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-warm-800">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — warm accent band */}
      <section className="bg-brand-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-800">Sound like what you need?</h2>
            <p className="mt-1 text-warm-800">
              Let us start with a conversation. No pressure, no pitch.
            </p>
          </div>
          <ButtonLink href="/contact" size="lg" className="flex-shrink-0">
            Get in Touch
            <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
