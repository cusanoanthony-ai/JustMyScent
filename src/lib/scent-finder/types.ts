import type { Product } from "@/lib/commerce/types";

export interface ScentFinderAnswers {
  scentFamilies: string[];
  notes: string[];
  avoidNotes: string[];
  moods: string[];
  occasions: string[];
  audience: "women" | "men" | "unisex" | "any";
  strength: "light" | "moderate" | "bold";
  season?: string[];
}

export type MatchConfidenceLabel = "Strong match" | "Good match" | "Worth exploring";

export interface ScentFinderRecommendation {
  product: Product;
  score: number;
  normalizedScore: number;
  matchPercent: number;
  confidenceLabel: MatchConfidenceLabel;
  metadataCoverage: "complete" | "limited" | "missing";
  reasons: string[];
  mismatches: string[];
}

export interface ScentFinderQuestion {
  id: keyof ScentFinderAnswers;
  title: string;
  subtitle?: string;
  options: Array<{ value: string; label: string }>;
  multi?: boolean;
  optional?: boolean;
}

export const SCENT_FINDER_QUESTIONS: ScentFinderQuestion[] = [
  {
    id: "scentFamilies",
    title: "Which scent families appeal to you?",
    subtitle: "Choose one or more.",
    multi: true,
    options: [
      { value: "Oriental Vanilla", label: "Oriental Vanilla" },
      { value: "Floral", label: "Floral" },
      { value: "Fresh", label: "Fresh" },
      { value: "Woody", label: "Woody" },
      { value: "Gourmand", label: "Gourmand" },
      { value: "Aromatic", label: "Aromatic" },
      { value: "Chypre", label: "Chypre" },
      { value: "Aquatic", label: "Aquatic" },
    ],
  },
  {
    id: "notes",
    title: "Which notes do you enjoy?",
    multi: true,
    options: [
      { value: "vanilla", label: "Vanilla" },
      { value: "rose", label: "Rose" },
      { value: "jasmine", label: "Jasmine" },
      { value: "bergamot", label: "Bergamot" },
      { value: "amber", label: "Amber" },
      { value: "cedar", label: "Cedar" },
      { value: "musk", label: "Musk" },
      { value: "patchouli", label: "Patchouli" },
    ],
  },
  {
    id: "avoidNotes",
    title: "Are there notes you prefer to avoid?",
    multi: true,
    options: [
      { value: "musk", label: "Musk" },
      { value: "patchouli", label: "Patchouli" },
      { value: "vanilla", label: "Vanilla" },
      { value: "rose", label: "Rose" },
      { value: "oud", label: "Oud" },
      { value: "leather", label: "Leather" },
    ],
  },
  {
    id: "moods",
    title: "How do you want the fragrance to feel?",
    multi: true,
    options: [
      { value: "Romantic", label: "Romantic" },
      { value: "Fresh", label: "Fresh" },
      { value: "Confident", label: "Confident" },
      { value: "Soft", label: "Soft" },
      { value: "Warm", label: "Warm" },
      { value: "Clean", label: "Clean" },
    ],
  },
  {
    id: "occasions",
    title: "When are you most likely to wear it?",
    multi: true,
    options: [
      { value: "Everyday", label: "Everyday" },
      { value: "Daytime", label: "Daytime" },
      { value: "Evening", label: "Evening" },
      { value: "Office", label: "Office" },
      { value: "Date Night", label: "Date Night" },
      { value: "Weekend", label: "Weekend" },
    ],
  },
  {
    id: "audience",
    title: "Do you prefer women’s, men’s, unisex, or no preference?",
    options: [
      { value: "any", label: "No preference" },
      { value: "women", label: "Women" },
      { value: "men", label: "Men" },
      { value: "unisex", label: "Unisex" },
    ],
  },
  {
    id: "strength",
    title: "How noticeable do you want it to feel?",
    options: [
      { value: "light", label: "Light" },
      { value: "moderate", label: "Moderate" },
      { value: "bold", label: "Bold" },
    ],
  },
  {
    id: "season",
    title: "Optional seasonal preference",
    subtitle: "Skip if you have no preference.",
    multi: true,
    optional: true,
    options: [
      { value: "Spring", label: "Spring" },
      { value: "Summer", label: "Summer" },
      { value: "Fall", label: "Fall" },
      { value: "Winter", label: "Winter" },
    ],
  },
];

export const DEFAULT_SCENT_FINDER_ANSWERS: ScentFinderAnswers = {
  scentFamilies: [],
  notes: [],
  avoidNotes: [],
  moods: [],
  occasions: [],
  audience: "any",
  strength: "moderate",
  season: [],
};

export function isQuizEligible(product: Product): boolean {
  if (product.quizEligible === false) return false;
  const noteCount =
    product.topNotes.length + product.heartNotes.length + product.baseNotes.length;
  return Boolean(product.scentFamily || product.scentFamilyRaw) && noteCount >= 2;
}
