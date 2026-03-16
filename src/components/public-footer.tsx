import Link from 'next/link';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold text-brand-800">The Marketing Reset</p>
            <p className="mt-2 text-sm text-warm-800">
              Strategic marketing clarity for service-based businesses. One session. Real direction.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-warm-700">
              Navigate
            </p>
            <ul className="mt-3 space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-800 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-warm-700">
              Get in Touch
            </p>
            <p className="mt-3 text-sm text-warm-800">
              Ready to get honest about your marketing?
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-block text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              Start a conversation
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-warm-700">
          <p>&copy; {currentYear} The Marketing Reset. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
