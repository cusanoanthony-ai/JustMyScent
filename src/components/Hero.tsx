import Link from "next/link";

function HeroVisual() {
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-gradient-to-b from-rose-muted/20 via-ivory to-champagne/10"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,169,98,0.18),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_75%,rgba(201,169,166,0.22),transparent_50%)]" />

      <div className="absolute left-1/2 top-[12%] h-16 w-16 -translate-x-1/2 rounded-full border border-champagne/50 bg-ivory/60" />
      <div className="absolute left-1/2 top-[18%] h-3 w-8 -translate-x-1/2 rounded-sm bg-champagne/70" />

      <div className="absolute left-1/2 top-[24%] h-[58%] w-[42%] -translate-x-1/2 rounded-t-[999px] border border-espresso/15 bg-gradient-to-b from-ivory/90 to-rose-muted/25 shadow-[inset_0_0_0_1px_rgba(44,24,16,0.05)]">
        <div className="absolute inset-x-[18%] top-[18%] h-[55%] rounded-full border border-champagne/35 bg-gradient-to-b from-champagne/15 to-transparent" />
        <div className="absolute inset-x-[28%] bottom-[12%] h-[28%] rounded-full bg-rose-muted/35 blur-[1px]" />
      </div>

      <div className="absolute bottom-[14%] left-[18%] h-24 w-24 rounded-full border border-champagne/30 bg-transparent" />
      <div className="absolute bottom-[22%] right-[16%] h-14 w-14 rounded-full bg-rose-muted/40" />
      <div className="absolute bottom-[8%] right-[28%] h-2 w-2 rounded-full bg-champagne" />

      <div className="absolute bottom-[6%] left-1/2 h-px w-[70%] -translate-x-1/2 bg-espresso/10" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-rose-muted uppercase">
            Your scent. Your signature.
          </p>
          <h1 className="font-display text-4xl leading-[1.1] font-semibold text-espresso sm:text-5xl lg:text-6xl">
            Find the scent that feels like you.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-espresso/75 sm:text-lg">
            Discover concentrated fragrance oils inspired by the scents you already
            love—made personal, long-lasting, and accessible.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#shop"
              className="inline-flex items-center justify-center border border-espresso bg-espresso px-6 py-3 text-sm font-semibold tracking-wide text-ivory uppercase transition-colors hover:bg-espresso/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne motion-reduce:transition-none"
            >
              Explore the Collection
            </Link>
            <Link
              href="#scent-finder"
              className="inline-flex items-center justify-center border border-espresso/20 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-espresso uppercase transition-colors hover:border-champagne hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne motion-reduce:transition-none"
            >
              Find My Scent
            </Link>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
