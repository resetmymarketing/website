'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold text-brand-800">Something went wrong</h2>
      <p className="mt-2 text-warm-600">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
