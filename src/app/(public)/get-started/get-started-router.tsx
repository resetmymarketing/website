'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ConciergeClient } from './concierge-client';
import { IntakeFormClient } from './intake-form-client';

function GetStartedContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode === 'intake') {
    return (
      <div>
        {/* Hero — editorial, no image */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-700">
              Intake Form
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-brand-800 sm:text-5xl">
              Tell me about your business.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-warm-800">
              This intake form takes about 30 to 45 minutes. The more honest and
              detailed you are, the more value you will get from your strategy
              session. Everything you share stays confidential.
            </p>
            <div className="mt-6 h-1 w-16 rounded-full bg-sage-500" />
          </div>
        </section>

        {/* Form */}
        <section className="bg-brand-50 px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <IntakeFormClient />
          </div>
        </section>
      </div>
    );
  }

  return <ConciergeClient />;
}

export function GetStartedRouter() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-warm-500">Loading...</p>
        </div>
      }
    >
      <GetStartedContent />
    </Suspense>
  );
}
