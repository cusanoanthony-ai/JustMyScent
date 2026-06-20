import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function TermsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading eyebrow="Policy" title="Terms" />
      <div className="prose prose-sm mt-10 max-w-3xl space-y-4 text-espresso/75">
        <p>
          These terms are demonstration copy for a portfolio storefront concept. They are not
          legally binding and do not govern a live merchant relationship.
        </p>
        <p>
          Before launch, the business owner should publish approved terms covering purchases,
          product descriptions, acceptable use, and limitation of liability.
        </p>
      </div>
    </Container>
  );
}
