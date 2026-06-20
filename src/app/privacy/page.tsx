import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading eyebrow="Policy" title="Privacy" />
      <div className="prose prose-sm mt-10 max-w-3xl space-y-4 text-espresso/75">
        <p>
          This privacy page is placeholder structure for the unofficial redesign concept. It
          does not describe live data collection for the real Just My Scent business.
        </p>
        <p>
          A production launch should include business-approved language covering analytics,
          cookies, checkout data handled by Shopify, and any connected marketing tools.
        </p>
      </div>
    </Container>
  );
}
