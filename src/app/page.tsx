import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/product/ProductCard";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCommerceProvider } from "@/lib/commerce";

export const revalidate = 60;

const benefits = [
  "Concentrated fragrance oils",
  "Alcohol-free formula",
  "Portable roll-on design",
  "An accessible way to explore fragrance",
];

export default async function HomePage() {
  const provider = getCommerceProvider();
  const collections = await provider.getCollections();
  const audienceCollections = collections.filter((collection) =>
    ["womens-fragrance", "mens-fragrance", "frontpage"].includes(collection.handle),
  );
  const featuredCollection = collections.find((collection) => collection.handle === "best-sellers");
  const featured = await provider.getFeaturedProducts(6);
  const spotlight = featured[0] ?? (await provider.getProducts({ first: 1 })).products[0];

  return (
    <>
      <Hero />

      <section className="border-y border-espresso/10 bg-[#faf6f0]">
        <Container className="py-8">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="text-center text-sm tracking-[0.08em] text-espresso/75 sm:text-left"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {featuredCollection ? (
        <section className="py-14 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Public collection"
              title={featuredCollection.title}
              description={featuredCollection.description}
            />
            <div className="mt-8">
              <Button href={`/collections/${featuredCollection.handle}`} variant="secondary">
                Shop Best Sellers
              </Button>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-y border-espresso/10 bg-[#faf6f0] py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Featured"
            title="Best-loved starting points"
            description="Products from the publicly listed best-sellers collection on justmyscent.online."
          />
          <div className="mt-10">
            <ProductGrid products={featured} />
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <SectionHeading
            eyebrow="Scent Finder"
            title="Not sure where to begin?"
            description="Answer a few questions and receive recommendations based on scent family, mood, notes, and wear style."
          />
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button href="/scent-finder">Find My Scent</Button>
            <Button href="/shop" variant="secondary">
              Browse the Shop
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-y border-espresso/10 py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Why fragrance oil"
              title="A more personal way to wear scent"
              description="Fragrance oils offer a concentrated, skin-close experience that can feel intimate, expressive, and easy to explore at your own pace."
            />
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-espresso/70">
            <p>
              This concept presents oils as an approachable entry point into fragrance—helpful
              for discovering families, notes, and signatures without the formality of a
              traditional counter experience.
            </p>
            <p>
              Roll-on formats emphasize portability and intentional application, while the
              editorial layout keeps the focus on mood, composition, and personal preference.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Shop by audience"
            title="Women, Men, and Unisex"
            description="Browse compositions grouped by wear preference while keeping discovery flexible."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {audienceCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="min-h-48 border border-espresso/10 bg-ivory p-8 transition-colors hover:border-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
              >
                <h3 className="font-display text-3xl text-espresso">{collection.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-espresso/65">
                  {collection.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {spotlight ? (
        <section className="border-y border-espresso/10 bg-[#faf6f0] py-14 sm:py-20">
          <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm tracking-[0.18em] text-rose-muted uppercase">
                Product spotlight
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-espresso">
                {spotlight.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-espresso/70">
                {spotlight.featuredMessage ?? spotlight.shortDescription}
              </p>
              <div className="mt-8">
                <Button href={`/products/${spotlight.handle}`}>View Product</Button>
              </div>
            </div>
            <div className="border border-espresso/10 bg-ivory p-8">
              <p className="text-sm text-espresso/65">{spotlight.scentFamily}</p>
              <p className="mt-2 font-display text-2xl text-espresso">
                {[...spotlight.topNotes, ...spotlight.heartNotes].slice(0, 4).join(" · ")}
              </p>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Philosophy"
            title="Fragrance should feel personal"
            description="This redesign concept treats scent as self-expression—guided by mood, notes, and wear context rather than one-size-fits-all recommendations."
          />
        </Container>
      </section>

      <section className="border-y border-espresso/10 bg-[#faf6f0] py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="FAQ preview"
            title="Common questions"
            description="Helpful starting points for exploring fragrance oils in this concept storefront."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {[
              {
                q: "What is a fragrance oil?",
                a: "A concentrated scent format designed for skin-close application, often used in roll-on or oil-based presentations.",
              },
              {
                q: "How do I choose a scent family?",
                a: "Start with the mood you want—fresh, floral, warm, woody, gourmand, or bold—and refine by notes from there.",
              },
              {
                q: "Can I use the Scent Finder?",
                a: "Yes. It recommends products with verified scent metadata and works in both snapshot and live Shopify modes.",
              },
            ].map((item) => (
              <article key={item.q} className="border border-espresso/10 bg-ivory p-5">
                <h3 className="font-display text-xl text-espresso">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-espresso/70">{item.a}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href="/faq" variant="secondary">
              View All FAQs
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-2xl">
          <SectionHeading
            eyebrow="Newsletter"
            title="Stay inspired"
            description="Demonstration signup only. No email service is connected in this portfolio build."
          />
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </Container>
      </section>
    </>
  );
}
