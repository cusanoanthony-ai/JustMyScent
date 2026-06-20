import type { Product } from "@/lib/commerce/types";

export interface ScentFinderAnswers {
  scentFamilies: string[];
  moods: string[];
  occasions: string[];
  notes: string[];
  audience: "women" | "men" | "unisex" | "any";
  strength: "light" | "moderate" | "bold";
}

export interface ScentFinderRecommendation {
  product: Product;
  score: number;
  matchPercent: number;
  reasons: string[];
}

export interface ScentFinderQuestion {
  id: keyof ScentFinderAnswers | "strength";
  title: string;
  subtitle?: string;
  options: Array<{ value: string; label: string }>;
  multi?: boolean;
}

export const SCENT_FINDER_QUESTIONS: ScentFinderQuestion[] = [
  {
    id: "scentFamilies",
    title: "Which scent families appeal to you?",
    subtitle: "Choose one or more.",
    multi: true,
    options: [
      { value: "Sweet & Gourmand", label: "Sweet & Gourmand" },
      { value: "Fresh & Clean", label: "Fresh & Clean" },
      { value: "Floral", label: "Floral" },
      { value: "Warm & Sensual", label: "Warm & Sensual" },
      { value: "Woody & Earthy", label: "Woody & Earthy" },
      { value: "Bold & Refined", label: "Bold & Refined" },
    ],
  },
  {
    id: "moods",
    title: "How do you want the fragrance to feel?",
    multi: true,
    options: [
      { value: "Romantic", label: "Romantic" },
      { value: "Fresh", label: "Fresh" },
      { value: "Comforting", label: "Comforting" },
      { value: "Confident", label: "Confident" },
      { value: "Serene", label: "Serene" },
      { value: "Magnetic", label: "Magnetic" },
    ],
  },
  {
    id: "occasions",
    title: "When will you wear it?",
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
    id: "notes",
    title: "Which notes do you enjoy?",
    multi: true,
    options: [
      { value: "Vanilla", label: "Vanilla" },
      { value: "Rose", label: "Rose" },
      { value: "Bergamot", label: "Bergamot" },
      { value: "Amber", label: "Amber" },
      { value: "Cedar", label: "Cedar" },
      { value: "Jasmine", label: "Jasmine" },
      { value: "Tonka", label: "Tonka" },
      { value: "Vetiver", label: "Vetiver" },
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
    title: "How noticeable do you want the scent to feel?",
    options: [
      { value: "light", label: "Light" },
      { value: "moderate", label: "Moderate" },
      { value: "bold", label: "Bold" },
    ],
  },
];

export const DEFAULT_SCENT_FINDER_ANSWERS: ScentFinderAnswers = {
  scentFamilies: [],
  moods: [],
  occasions: [],
  notes: [],
  audience: "any",
  strength: "moderate",
};
