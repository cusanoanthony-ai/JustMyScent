import type { DemoVisualConfig, Product, ProductImage } from "@/lib/commerce/types";

const paletteClasses: Record<
  NonNullable<DemoVisualConfig>["palette"],
  { bg: string; accent: string; glow: string }
> = {
  rose: { bg: "from-rose-muted/35 to-ivory", accent: "bg-rose-muted/50", glow: "bg-rose-muted/20" },
  gold: { bg: "from-champagne/25 to-ivory", accent: "bg-champagne/45", glow: "bg-champagne/15" },
  green: { bg: "from-emerald-100/40 to-ivory", accent: "bg-emerald-700/20", glow: "bg-emerald-100/30" },
  amber: { bg: "from-amber-100/40 to-ivory", accent: "bg-amber-700/20", glow: "bg-amber-100/25" },
  slate: { bg: "from-stone-300/30 to-ivory", accent: "bg-stone-600/20", glow: "bg-stone-200/30" },
  cream: { bg: "from-orange-50/70 to-ivory", accent: "bg-orange-200/40", glow: "bg-orange-50/60" },
  fig: { bg: "from-purple-100/35 to-ivory", accent: "bg-purple-700/15", glow: "bg-purple-100/25" },
  smoke: { bg: "from-stone-500/15 to-ivory", accent: "bg-stone-700/25", glow: "bg-stone-400/10" },
};

export function ProductVisual({
  product,
  className = "",
  priority = false,
}: {
  product: Pick<Product, "title" | "featuredImage" | "demoVisual" | "localImagePath">;
  className?: string;
  priority?: boolean;
}) {
  const image = product.featuredImage ?? (product.localImagePath ? { url: product.localImagePath, altText: product.title } : undefined);

  if (image?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.url}
        alt={image.altText ?? product.title}
        width={image.width ?? 600}
        height={image.height ?? 750}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const visual = product.demoVisual ?? { palette: "cream", shape: "roller" };
  const palette = paletteClasses[visual.palette];

  return (
    <div
      aria-hidden={!image}
      className={`relative h-full w-full overflow-hidden bg-gradient-to-b ${palette.bg} ${className}`}
    >
      <div className={`absolute inset-0 ${palette.glow}`} />
      <div className="absolute left-1/2 top-[10%] h-10 w-10 -translate-x-1/2 rounded-full border border-champagne/40 bg-ivory/70" />
      <div
        className={`absolute left-1/2 top-[18%] h-[62%] w-[38%] -translate-x-1/2 ${
          visual.shape === "bottle"
            ? "rounded-t-[999px]"
            : visual.shape === "vial"
              ? "rounded-t-3xl rounded-b-lg"
              : "rounded-full"
        } border border-espresso/10 bg-ivory/80 shadow-[inset_0_0_0_1px_rgba(44,24,16,0.04)]`}
      >
        <div className={`absolute inset-x-[22%] top-[20%] h-[50%] rounded-full ${palette.accent}`} />
      </div>
      <div className={`absolute bottom-[16%] right-[18%] h-12 w-12 rounded-full ${palette.accent}`} />
    </div>
  );
}

export function getProductImage(product: Product): ProductImage | undefined {
  return product.featuredImage ?? product.images[0];
}
