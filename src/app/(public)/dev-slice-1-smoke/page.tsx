import { Highlight } from '@/components/motion/Highlight';
import { SunBadge } from '@/components/brand/SunBadge';
import { StripeDivider } from '@/components/brand/StripeDivider';

const SWATCHES = [
  { name: 'lapis', shades: ['50', '100', '300', '500', '700', '900'] },
  { name: 'pacific', shades: ['50', '100', '300', '400', '500', '700'] },
  { name: 'oat', shades: ['50', '100', '200', '300', '500', '700'] },
  { name: 'lemonade', shades: ['100', '200', '300', '400', '500', '700'] },
  { name: 'limeade', shades: ['100', '200', '300', '400', '500', '700'] },
  { name: 'lime', shades: ['100', '200', '300', '400', '500', '700'] },
] as const;

export default function SliceOneSmoke() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-lapis-700">
        Slice 1 Smoke · Design System Foundation
      </h1>
      <p className="mt-2 text-pacific-700">
        Live verification that Lemonade tokens, Fraunces + Inter fonts, and the
        three new components render correctly in the production-pipeline-built
        app.
      </p>

      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-lime-700">
          Lemonade swatches via Tailwind utilities
        </h2>
        <div className="mt-4 space-y-3">
          {SWATCHES.map((row) => (
            <div key={row.name} className="flex items-center gap-3">
              <span className="w-20 text-sm font-mono text-lapis-700">
                {row.name}
              </span>
              <div className="flex flex-1 gap-2">
                {row.shades.map((shade) => (
                  <div
                    key={shade}
                    className="flex h-12 flex-1 items-end justify-center rounded pb-1 font-mono text-[10px]"
                    style={{
                      background: `var(--${row.name}-${shade})`,
                      color:
                        Number(shade) >= 500 ? 'white' : 'var(--lapis-800)',
                    }}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-lime-700">
          Typography
        </h2>
        <div className="mt-4 space-y-4">
          <p
            className="text-5xl text-lapis-700"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Fraunces · Display · 48px
          </p>
          <p
            className="text-5xl italic text-pacific-700"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Fraunces italic · 48px
          </p>
          <p
            className="text-base text-lapis-800"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Inter · Body · 16px · The quick brown fox jumps over the lazy dog,
            then sips lemonade in the shade.
          </p>
          <p
            className="text-sm font-semibold text-lapis-600"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Inter Semibold · UI · 14px
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-lime-700">
          &lt;Highlight&gt; — animated stroke under inline text
        </h2>
        <p
          className="mt-4 text-3xl text-lapis-700"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Marketing you actually <Highlight>understand</Highlight>, for the
          business you{' '}
          <span className="italic">
            <Highlight color="lemonade">already love</Highlight>
          </span>
          .
        </p>
        <p
          className="mt-4 text-base text-lapis-800"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          The four colors: <Highlight color="limeade">limeade</Highlight>{' '}
          <Highlight color="lemonade">lemonade</Highlight>{' '}
          <Highlight color="lime">lime</Highlight>{' '}
          <Highlight color="pacific">pacific</Highlight>.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-lime-700">
          &lt;SunBadge&gt; — solid and ringed variants
        </h2>
        <div className="mt-4 flex items-center gap-12">
          <div>
            <SunBadge size={120} />
            <p className="mt-2 text-xs text-lapis-700">solid · 120px</p>
          </div>
          <div>
            <SunBadge size={120} variant="ringed" />
            <p className="mt-2 text-xs text-lapis-700">ringed · 120px</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SunBadge size={48} />
            <SunBadge size={32} />
            <SunBadge size={24} />
            <p className="text-xs text-lapis-700">small (48 / 32 / 24)</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-lime-700">
          &lt;StripeDivider&gt; — chapter marker, four colors
        </h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <StripeDivider color="lime" />
            <span
              className="text-xs font-mono text-lapis-700"
            >
              lime (default)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <StripeDivider color="lapis" />
            <span className="text-xs font-mono text-lapis-700">lapis</span>
          </div>
          <div className="flex items-center gap-4">
            <StripeDivider color="pacific" />
            <span className="text-xs font-mono text-lapis-700">pacific</span>
          </div>
          <div className="flex items-center gap-4">
            <StripeDivider color="limeade" />
            <span className="text-xs font-mono text-lapis-700">limeade</span>
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-xl bg-pacific-500 p-8 text-white">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-lemonade-300">
          Hero feel sample
        </h2>
        <div className="mt-4 flex items-start justify-between gap-8">
          <div className="max-w-2xl">
            <h3
              className="text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Marketing you actually <Highlight>understand</Highlight>, for the
              business you{' '}
              <span className="italic">
                <Highlight color="lemonade">already love</Highlight>
              </span>
              .
            </h3>
            <p
              className="mt-4 text-pacific-50"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              One strategic session. A plan shaped around your real work, not
              someone else&rsquo;s playbook.
            </p>
            <button
              className="mt-6 rounded-full bg-lemonade-400 px-6 py-3 text-sm font-semibold text-lapis-700 hover:bg-lemonade-500"
              style={{ fontFamily: 'var(--font-inter)' }}
              type="button"
            >
              Start your reset →
            </button>
          </div>
          <SunBadge size={140} />
        </div>
      </section>

      <p className="mt-12 text-center text-xs text-lapis-400">
        Slice 1 smoke page. Remove or hide before production deploy.
      </p>
    </main>
  );
}
