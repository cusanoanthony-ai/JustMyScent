import Link from "next/link";

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-espresso focus:px-4 focus:py-2 focus:text-ivory"
    >
      Skip to content
    </Link>
  );
}
