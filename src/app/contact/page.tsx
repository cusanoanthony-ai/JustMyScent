import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Send a message"
        description="This contact form is configured for demonstration only. No email provider is connected in this portfolio build."
      />
      <div className="mt-10 max-w-2xl">
        <ContactForm />
      </div>
    </Container>
  );
}
