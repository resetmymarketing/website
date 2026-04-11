import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button-link';

export const metadata: Metadata = {
  title: 'Not Ready Yet -- And That Is Okay',
  description: 'The Marketing Reset works best when you are ready to implement. Come back when you are certain.',
};

export default function NotReadyPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 dark:bg-sage-900/30">
          <svg className="h-7 w-7 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-brand-800 dark:text-brand-100">
          Not ready yet -- and that is completely okay.
        </h1>

        <p className="mt-4 text-warm-800 dark:text-warm-300 leading-relaxed">
          Thank you for being honest with yourself. The Marketing Reset works best when you are truly ready to implement what we build together. There is no rush and no pressure.
        </p>

        <div className="mt-8 rounded-xl bg-brand-50 p-6 text-left dark:bg-dark-800">
          <h2 className="text-lg font-semibold text-brand-800 dark:text-brand-100 mb-3">
            Here is what you can do in the meantime:
          </h2>
          <ol className="space-y-2 text-sm text-warm-800 dark:text-warm-300 list-decimal list-inside">
            <li>Pick 2 social media platforms and start showing up consistently</li>
            <li>Post at least once a week -- even if it feels imperfect</li>
            <li>Track what gets the most engagement over the next 3 months</li>
          </ol>
          <p className="mt-4 text-sm text-warm-600 dark:text-warm-400">
            When you come back, you will have real data to work with -- and that makes the reset even more powerful.
          </p>
        </div>

        <p className="mt-6 text-sm text-warm-600 dark:text-warm-400">
          A $20 discount code will be waiting for you when you are ready.
        </p>

        <div className="mt-8">
          <ButtonLink href="/" variant="outline">
            Back to Home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
