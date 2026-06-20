import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const faqs = [
  {
    q: "What is a fragrance oil?",
    a: "A concentrated scent format designed for skin-close application. This concept presents oils in roll-on sizes for portable, intentional wear.",
  },
  {
    q: "How should I apply fragrance oil?",
    a: "Apply to pulse points such as wrists or neck. This concept avoids medical or performance guarantees and focuses on personal preference.",
  },
  {
    q: "How do I choose a scent?",
    a: "Start with scent family and mood, then refine by notes. The Scent Finder can suggest options based on your answers.",
  },
  {
    q: "What sizes are shown?",
    a: "Demonstration products include 10 ml and 30 ml roll-on variants. Live Shopify variants will appear automatically when connected.",
  },
  {
    q: "What are the shipping and return policies?",
    a: "Placeholder copy only. Final business-approved policies must replace this content before a real launch.",
  },
  {
    q: "Can I update an order?",
    a: "Order updates depend on the merchant’s live Shopify workflow. This concept does not invent operational policies.",
  },
  {
    q: "How do I contact support?",
    a: "Use the contact page in this concept build. A real launch would connect the form to the merchant’s preferred support channel.",
  },
];

export default function FaqPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions about the concept storefront"
        description="Helpful guidance for exploring fragrance oils in this unofficial redesign project."
      />
      <div className="mt-10 space-y-4">
        {faqs.map((item) => (
          <details key={item.q} className="border border-espresso/10 bg-ivory p-5">
            <summary className="cursor-pointer font-display text-xl text-espresso">
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-espresso/70">{item.a}</p>
          </details>
        ))}
      </div>
    </Container>
  );
}
