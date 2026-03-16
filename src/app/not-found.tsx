import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold text-brand-800">Page not found</h2>
      <p className="mt-2 text-warm-600">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
      >
        Go home
      </Link>
    </div>
  );
}
