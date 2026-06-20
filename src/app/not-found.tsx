import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <p className="text-sm tracking-[0.18em] text-rose-muted uppercase">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-espresso sm:text-5xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-base text-espresso/70">
        The page you requested is not part of this concept storefront.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href="/">Return Home</Button>
        <Link
          href="/shop"
          className="text-sm font-semibold tracking-[0.14em] text-espresso uppercase underline-offset-4 hover:underline"
        >
          Browse the Shop
        </Link>
      </div>
    </Container>
  );
}
