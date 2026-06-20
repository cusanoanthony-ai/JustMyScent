import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

function PolicyPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading eyebrow="Policy" title={title} />
      <div className="prose prose-sm mt-10 max-w-3xl space-y-4 text-espresso/75">{children}</div>
    </Container>
  );
}

export default function ShippingReturnsPage() {
  return (
    <PolicyPage title="Shipping & Returns">
      <p>
        This is demonstration policy copy for an unofficial portfolio concept. It does not
        represent the real Just My Scent business policies.
      </p>
      <p>
        Before launch, the store owner must replace this page with approved shipping timelines,
        return windows, condition requirements, and refund procedures.
      </p>
    </PolicyPage>
  );
}
