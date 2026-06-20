import type {
  Audience,
  DemoVisualConfig,
  Product,
  ScentFamily,
} from "@/lib/commerce/types";

const CURRENCY = "USD";

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: CURRENCY };
}

function createVariants(basePrice: number, compareAt?: number) {
  const sizes = [
    { label: "10 ml Roll-On", price: basePrice },
    { label: "30 ml Roll-On", price: basePrice + 18 },
  ];

  return sizes.map((size, index) => ({
    id: `demo-variant-${index}-${size.label.replace(/\s+/g, "-").toLowerCase()}`,
    title: size.label,
    price: money(size.price),
    compareAtPrice: compareAt ? money(compareAt + index * 6) : undefined,
    availableForSale: true,
    selectedOptions: [{ name: "Size", value: size.label }],
  }));
}

function createProduct(input: {
  handle: string;
  title: string;
  shortDescription: string;
  description: string;
  audience: Audience;
  scentFamily: ScentFamily;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  mood: string;
  occasion: string;
  fragranceStrength: string;
  price: number;
  compareAt?: number;
  featured?: boolean;
  isNew?: boolean;
  collections: string[];
  demoVisual: DemoVisualConfig;
  featuredMessage?: string;
}): Product {
  const variants = createVariants(input.price, input.compareAt);
  const prices = variants.map((variant) => Number.parseFloat(variant.price.amount));

  return {
    id: `demo-product-${input.handle}`,
    handle: input.handle,
    title: input.title,
    shortDescription: input.shortDescription,
    description: input.description,
    descriptionHtml: `<p>${input.description}</p>`,
    productType: "Fragrance Oil",
    vendor: "Just My Scent",
    tags: [
      `audience:${input.audience}`,
      `scent:${input.scentFamily.toLowerCase().replace(/[^a-z]+/g, "-")}`,
      ...input.topNotes.map((note) => `note:${note.toLowerCase()}`),
      `mood:${input.mood.toLowerCase()}`,
      `occasion:${input.occasion.toLowerCase().replace(/\s+/g, "-")}`,
    ],
    featuredImage: undefined,
    images: [],
    priceRange: {
      min: money(Math.min(...prices)),
      max: money(Math.max(...prices)),
    },
    compareAtPriceRange: input.compareAt
      ? {
          min: money(input.compareAt),
          max: money(input.compareAt + 6),
        }
      : undefined,
    availableForSale: true,
    options: [{ name: "Size", values: variants.map((variant) => variant.title) }],
    variants,
    collections: input.collections.map((handle) => ({
      handle,
      title: handle.replace(/-/g, " "),
    })),
    audience: input.audience,
    scentFamily: input.scentFamily,
    topNotes: input.topNotes,
    heartNotes: input.heartNotes,
    baseNotes: input.baseNotes,
    mood: input.mood,
    occasion: input.occasion,
    fragranceStrength: input.fragranceStrength,
    featuredMessage: input.featuredMessage,
    featured: input.featured,
    isNew: input.isNew,
    demoVisual: input.demoVisual,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

export const demoProducts: Product[] = [
  createProduct({
    handle: "velvet-ember",
    title: "Velvet Ember",
    shortDescription: "A warm veil of amber and soft spice for evening composure.",
    description:
      "Velvet Ember layers glowing amber with a hushed trace of cardamom and smoked vanilla. Designed for unhurried evenings when you want warmth without heaviness.",
    audience: "unisex",
    scentFamily: "Warm & Sensual",
    topNotes: ["Cardamom", "Pink Pepper"],
    heartNotes: ["Amber", "Orchid"],
    baseNotes: ["Vanilla", "Sandalwood"],
    mood: "Romantic",
    occasion: "Evening",
    fragranceStrength: "Moderate",
    price: 24,
    compareAt: 32,
    featured: true,
    collections: ["unisex", "warm-sensual"],
    demoVisual: { palette: "amber", shape: "roller" },
    featuredMessage: "Editor's pick for layered warmth",
  }),
  createProduct({
    handle: "vanilla-nocturne",
    title: "Vanilla Nocturne",
    shortDescription: "Creamy vanilla wrapped in soft musk and tonka.",
    description:
      "Vanilla Nocturne is a gourmand-forward oil with a polished finish—sweet, rounded, and quietly confident for daily wear.",
    audience: "women",
    scentFamily: "Sweet & Gourmand",
    topNotes: ["Bergamot", "Pear"],
    heartNotes: ["Vanilla Orchid", "Heliotrope"],
    baseNotes: ["Tonka", "Soft Musk"],
    mood: "Comforting",
    occasion: "Everyday",
    fragranceStrength: "Moderate",
    price: 22,
    featured: true,
    collections: ["women", "sweet-gourmand"],
    demoVisual: { palette: "cream", shape: "roller" },
  }),
  createProduct({
    handle: "citrus-veil",
    title: "Citrus Veil",
    shortDescription: "Bright citrus lifted by clean white tea and airy musk.",
    description:
      "Citrus Veil opens with sparkling bergamot and settles into a crisp, transparent finish—ideal for fresh signatures and warm afternoons.",
    audience: "unisex",
    scentFamily: "Fresh & Clean",
    topNotes: ["Bergamot", "Yuzu"],
    heartNotes: ["White Tea", "Neroli"],
    baseNotes: ["Clean Musk", "Cedar"],
    mood: "Uplifting",
    occasion: "Daytime",
    fragranceStrength: "Light",
    price: 21,
    isNew: true,
    collections: ["unisex", "fresh-clean"],
    demoVisual: { palette: "green", shape: "vial" },
  }),
  createProduct({
    handle: "rose-after-dark",
    title: "Rose After Dark",
    shortDescription: "Velvet rose with dark plum and a whisper of incense.",
    description:
      "Rose After Dark balances floral elegance with nocturnal depth—polished enough for evening, intimate enough for close moments.",
    audience: "women",
    scentFamily: "Floral",
    topNotes: ["Black Currant", "Saffron"],
    heartNotes: ["Damask Rose", "Peony"],
    baseNotes: ["Incense", "Patchouli"],
    mood: "Romantic",
    occasion: "Evening",
    fragranceStrength: "Moderate",
    price: 26,
    compareAt: 34,
    featured: true,
    collections: ["women", "floral"],
    demoVisual: { palette: "rose", shape: "bottle" },
  }),
  createProduct({
    handle: "cedar-reserve",
    title: "Cedar Reserve",
    shortDescription: "Dry cedar and vetiver with a refined mineral edge.",
    description:
      "Cedar Reserve is grounded and architectural—built for those who prefer clean woods over sweet florals.",
    audience: "men",
    scentFamily: "Woody & Earthy",
    topNotes: ["Grapefruit", "Juniper"],
    heartNotes: ["Cedarwood", "Iris"],
    baseNotes: ["Vetiver", "Oakmoss"],
    mood: "Composed",
    occasion: "Office",
    fragranceStrength: "Moderate",
    price: 25,
    collections: ["men", "woody-earthy"],
    demoVisual: { palette: "slate", shape: "dropper" },
  }),
  createProduct({
    handle: "amber-muse",
    title: "Amber Muse",
    shortDescription: "Resinous amber with honeyed florals and soft leather.",
    description:
      "Amber Muse glows with resinous depth and a subtle floral lift—sensual, polished, and unmistakably warm.",
    audience: "women",
    scentFamily: "Warm & Sensual",
    topNotes: ["Mandarin", "Almond"],
    heartNotes: ["Jasmine", "Honey"],
    baseNotes: ["Amber", "Suede"],
    mood: "Magnetic",
    occasion: "Date Night",
    fragranceStrength: "Bold",
    price: 27,
    collections: ["women", "warm-sensual"],
    demoVisual: { palette: "gold", shape: "bottle" },
  }),
  createProduct({
    handle: "linen-bloom",
    title: "Linen Bloom",
    shortDescription: "Sunlit linen, soft florals, and a clean skin-like finish.",
    description:
      "Linen Bloom feels freshly laundered and quietly floral—an effortless daytime oil with a calm, polished presence.",
    audience: "women",
    scentFamily: "Fresh & Clean",
    topNotes: ["Aldehydes", "Pear Blossom"],
    heartNotes: ["Lily of the Valley", "Magnolia"],
    baseNotes: ["White Musk", "Cedar"],
    mood: "Serene",
    occasion: "Daytime",
    fragranceStrength: "Light",
    price: 22,
    collections: ["women", "fresh-clean", "floral"],
    demoVisual: { palette: "cream", shape: "roller" },
  }),
  createProduct({
    handle: "midnight-fig",
    title: "Midnight Fig",
    shortDescription: "Juicy fig, green leaves, and dark woods after dusk.",
    description:
      "Midnight Fig pairs Mediterranean fruit with shadowy woods—a modern unisex profile with depth and polish.",
    audience: "unisex",
    scentFamily: "Woody & Earthy",
    topNotes: ["Fig Leaf", "Green Apple"],
    heartNotes: ["Fig", "Cypress"],
    baseNotes: ["Cashmere Wood", "Tonka"],
    mood: "Intriguing",
    occasion: "Evening",
    fragranceStrength: "Moderate",
    price: 25,
    collections: ["unisex", "woody-earthy"],
    demoVisual: { palette: "fig", shape: "vial" },
  }),
  createProduct({
    handle: "saffron-smoke",
    title: "Saffron Smoke",
    shortDescription: "Spiced saffron over charred woods and dark resins.",
    description:
      "Saffron Smoke is bold and refined—crafted for statement wear with a smoky, luxurious finish.",
    audience: "men",
    scentFamily: "Bold & Refined",
    topNotes: ["Saffron", "Elemi"],
    heartNotes: ["Oud Accord", "Rose"],
    baseNotes: ["Leather", "Smoked Vetiver"],
    mood: "Confident",
    occasion: "Special Occasion",
    fragranceStrength: "Bold",
    price: 29,
    compareAt: 38,
    featured: true,
    collections: ["men", "bold-refined"],
    demoVisual: { palette: "smoke", shape: "dropper" },
  }),
  createProduct({
    handle: "coastal-neroli",
    title: "Coastal Neroli",
    shortDescription: "Sea air, neroli blossom, and sun-warmed driftwood.",
    description:
      "Coastal Neroli captures a breezy shoreline mood—bright, transparent, and easy to wear from morning to evening.",
    audience: "unisex",
    scentFamily: "Fresh & Clean",
    topNotes: ["Sea Salt", "Neroli"],
    heartNotes: ["Orange Blossom", "Jasmine"],
    baseNotes: ["Driftwood", "Ambergris Accord"],
    mood: "Relaxed",
    occasion: "Weekend",
    fragranceStrength: "Light",
    price: 23,
    collections: ["unisex", "fresh-clean"],
    demoVisual: { palette: "green", shape: "roller" },
  }),
  createProduct({
    handle: "cashmere-petal",
    title: "Cashmere Petal",
    shortDescription: "Powdery florals softened with cashmere musk.",
    description:
      "Cashmere Petal is delicate yet present—a floral oil with a plush, skin-close finish.",
    audience: "women",
    scentFamily: "Floral",
    topNotes: ["Freesia", "Pink Pepper"],
    heartNotes: ["Peony", "Rose"],
    baseNotes: ["Cashmere Musk", "Vanilla"],
    mood: "Soft",
    occasion: "Everyday",
    fragranceStrength: "Light",
    price: 24,
    collections: ["women", "floral"],
    demoVisual: { palette: "rose", shape: "roller" },
  }),
  createProduct({
    handle: "golden-tonka",
    title: "Golden Tonka",
    shortDescription: "Sweet tonka bean, almond cream, and soft woods.",
    description:
      "Golden Tonka is indulgent without cloying—a gourmand oil with a luminous, golden warmth.",
    audience: "unisex",
    scentFamily: "Sweet & Gourmand",
    topNotes: ["Almond", "Cinnamon"],
    heartNotes: ["Tonka Bean", "Praline"],
    baseNotes: ["Sandalwood", "Vanilla"],
    mood: "Indulgent",
    occasion: "Evening",
    fragranceStrength: "Moderate",
    price: 24,
    collections: ["unisex", "sweet-gourmand"],
    demoVisual: { palette: "gold", shape: "bottle" },
  }),
  createProduct({
    handle: "fig-and-fern",
    title: "Fig and Fern",
    shortDescription: "Green fig, crushed fern, and cool mineral air.",
    description:
      "Fig and Fern is verdant and modern—a botanical profile with crisp clarity and quiet sophistication.",
    audience: "unisex",
    scentFamily: "Fresh & Clean",
    topNotes: ["Fern", "Bergamot"],
    heartNotes: ["Fig", "Violet Leaf"],
    baseNotes: ["Moss", "Cedar"],
    mood: "Fresh",
    occasion: "Daytime",
    fragranceStrength: "Light",
    price: 22,
    isNew: true,
    collections: ["unisex", "fresh-clean", "woody-earthy"],
    demoVisual: { palette: "green", shape: "vial" },
  }),
  createProduct({
    handle: "moonlit-jasmine",
    title: "Moonlit Jasmine",
    shortDescription: "Luminous jasmine over white amber and soft musk.",
    description:
      "Moonlit Jasmine is floral and radiant—designed for evenings when you want elegance with a gentle glow.",
    audience: "women",
    scentFamily: "Floral",
    topNotes: ["Mandarin", "Green Notes"],
    heartNotes: ["Jasmine", "Tuberose"],
    baseNotes: ["White Amber", "Musk"],
    mood: "Radiant",
    occasion: "Evening",
    fragranceStrength: "Moderate",
    price: 26,
    collections: ["women", "floral", "warm-sensual"],
    demoVisual: { palette: "cream", shape: "bottle" },
  }),
  createProduct({
    handle: "bergamot-rain",
    title: "Bergamot Rain",
    shortDescription: "Sparkling bergamot with rain-washed petals and soft woods.",
    description:
      "Bergamot Rain feels clean and composed—a versatile daytime oil with bright citrus and a polished dry-down.",
    audience: "men",
    scentFamily: "Fresh & Clean",
    topNotes: ["Bergamot", "Petitgrain"],
    heartNotes: ["Geranium", "Lavender"],
    baseNotes: ["Cedar", "Musk"],
    mood: "Crisp",
    occasion: "Office",
    fragranceStrength: "Light",
    price: 21,
    collections: ["men", "fresh-clean"],
    demoVisual: { palette: "slate", shape: "roller" },
  }),
  createProduct({
    handle: "suede-orchard",
    title: "Suede Orchard",
    shortDescription: "Orchard fruit, suede, and warm spice in balance.",
    description:
      "Suede Orchard blends approachable fruit with supple texture—refined, wearable, and quietly distinctive.",
    audience: "men",
    scentFamily: "Bold & Refined",
    topNotes: ["Apple", "Ginger"],
    heartNotes: ["Suede", "Cinnamon"],
    baseNotes: ["Oak", "Amber"],
    mood: "Refined",
    occasion: "Everyday",
    fragranceStrength: "Moderate",
    price: 25,
    collections: ["men", "bold-refined", "woody-earthy"],
    demoVisual: { palette: "amber", shape: "dropper" },
  }),
  createProduct({
    handle: "salted-vanilla",
    title: "Salted Vanilla",
    shortDescription: "Salted caramel vanilla with airy musk and soft woods.",
    description:
      "Salted Vanilla offers gourmand warmth with a modern edge—sweet, balanced, and easy to reach for daily.",
    audience: "women",
    scentFamily: "Sweet & Gourmand",
    topNotes: ["Sea Salt", "Caramel"],
    heartNotes: ["Vanilla", "Jasmine"],
    baseNotes: ["Musk", "Sandalwood"],
    mood: "Playful",
    occasion: "Everyday",
    fragranceStrength: "Moderate",
    price: 23,
    featured: true,
    collections: ["women", "sweet-gourmand"],
    demoVisual: { palette: "gold", shape: "roller" },
  }),
  createProduct({
    handle: "smoked-vetiver",
    title: "Smoked Vetiver",
    shortDescription: "Smoky vetiver, black tea, and dry cedar.",
    description:
      "Smoked Vetiver is earthy and assertive—a woody oil for those who prefer depth, structure, and a clean smoky finish.",
    audience: "men",
    scentFamily: "Woody & Earthy",
    topNotes: ["Black Tea", "Grapefruit"],
    heartNotes: ["Vetiver", "Cedar"],
    baseNotes: ["Smoked Wood", "Labdanum"],
    mood: "Grounded",
    occasion: "Evening",
    fragranceStrength: "Bold",
    price: 27,
    compareAt: 35,
    collections: ["men", "woody-earthy", "bold-refined"],
    demoVisual: { palette: "smoke", shape: "dropper" },
  }),
];

export const demoProductMap = new Map(
  demoProducts.map((product) => [product.handle, product]),
);
