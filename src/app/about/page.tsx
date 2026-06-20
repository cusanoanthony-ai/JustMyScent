import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        eyebrow="About"
        title="Fragrance as personal expression"
        description="This unofficial redesign concept explores how a fragrance-oil brand can feel editorial, approachable, and guided by discovery."
      />
      <div className="prose prose-sm mt-10 max-w-3xl space-y-6 text-espresso/75">
        <p>
          Just My Scent — Unofficial Redesign Concept reimagines a headless Shopify storefront
          where scent selection feels intuitive rather than overwhelming. The experience is
          organized around scent families, notes, mood, and wear context.
        </p>
        <p>
          The project demonstrates how a premium-feeling ecommerce presentation can remain
          accessible: clear product storytelling, guided recommendations, and a catalog that
          works equally well in demo mode and with live Shopify data.
        </p>
        <p>
          No claims are made here about the real company, its history, manufacturing, sourcing,
          or policies. This build is a portfolio and educational concept only.
        </p>
      </div>
    </Container>
  );
}
