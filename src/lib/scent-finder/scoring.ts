import type { Product } from "@/lib/commerce/types";
import type {
  MatchConfidenceLabel,
  ScentFinderAnswers,
  ScentFinderRecommendation,
} from "@/lib/scent-finder/types";
import { isQuizEligible } from "@/lib/scent-finder/types";

const WEIGHTS = {
  scentFamily: 25,
  notes: 30,
  avoidNotes: 35,
  mood: 15,
  occasion: 10,
  audience: 5,
  strength: 10,
  season: 5,
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function allNotes(product: Product): string[] {
  return [...product.topNotes, ...product.heartNotes, ...product.baseNotes].map(normalize);
}

function overlapScore(selected: string[], values: string[]): number {
  if (!selected.length || !values.length) return 0;
  const matches = selected.filter((item) =>
    values.some((value) => value.includes(normalize(item)) || normalize(item).includes(value)),
  );
  return matches.length / selected.length;
}

function metadataCoverage(product: Product): "complete" | "limited" | "missing" {
  return product.metadataCoverage ?? (isQuizEligible(product) ? "complete" : "missing");
}

function confidenceLabel(normalizedScore: number, coverage: string): MatchConfidenceLabel {
  if (coverage !== "complete") return "Worth exploring";
  if (normalizedScore >= 0.75) return "Strong match";
  if (normalizedScore >= 0.5) return "Good match";
  return "Worth exploring";
}

export function scoreProduct(product: Product, answers: ScentFinderAnswers) {
  const reasons: string[] = [];
  const mismatches: string[] = [];
  let earned = 0;
  let possible = 0;

  if (!product.availableForSale) {
    return {
      score: 0,
      normalizedScore: 0,
      reasons: ["Currently unavailable"],
      mismatches: ["Sold out"],
      possible: 1,
      earned: 0,
    };
  }

  if (answers.scentFamilies.length) {
    possible += WEIGHTS.scentFamily;
    const familyText = `${product.scentFamily} ${product.scentFamilyRaw ?? ""}`.toLowerCase();
    const familyScore = overlapScore(answers.scentFamilies, [familyText]);
    earned += familyScore * WEIGHTS.scentFamily;
    if (familyScore > 0) {
      reasons.push(`Matches your ${answers.scentFamilies.find((f) => familyText.includes(normalize(f))) ?? "scent family"} preference`);
    }
  }

  const notes = allNotes(product);
  if (answers.notes.length) {
    possible += WEIGHTS.notes;
    const noteScore = overlapScore(answers.notes, notes);
    earned += noteScore * WEIGHTS.notes;
    const matched = answers.notes.filter((note) =>
      notes.some((value) => value.includes(normalize(note))),
    );
    if (matched.length) reasons.push(`Includes notes you enjoy: ${matched.slice(0, 3).join(", ")}`);
  }

  if (answers.avoidNotes.length) {
    possible += WEIGHTS.avoidNotes;
    const avoided = answers.avoidNotes.filter((note) =>
      notes.some((value) => value.includes(normalize(note))),
    );
    if (avoided.length) {
      const penalty = (avoided.length / answers.avoidNotes.length) * WEIGHTS.avoidNotes;
      earned -= penalty;
      mismatches.push(`Contains avoided note(s): ${avoided.join(", ")}`);
    } else {
      earned += WEIGHTS.avoidNotes * 0.25;
      reasons.push("Avoids your less-preferred notes");
    }
  }

  if (answers.moods.length && product.mood) {
    possible += WEIGHTS.mood;
    const moodScore = overlapScore(answers.moods, [product.mood]);
    earned += moodScore * WEIGHTS.mood;
    if (moodScore > 0) reasons.push(`Aligns with a ${product.mood.toLowerCase()} mood`);
  }

  if (answers.occasions.length && product.occasion) {
    possible += WEIGHTS.occasion;
    const occasionScore = overlapScore(answers.occasions, [product.occasion]);
    earned += occasionScore * WEIGHTS.occasion;
    if (occasionScore > 0) reasons.push(`Suitable for ${product.occasion.toLowerCase()} wear`);
  }

  if (answers.audience !== "any") {
    possible += WEIGHTS.audience;
    if (product.audience === answers.audience || product.audience === "unisex") {
      earned += WEIGHTS.audience;
      reasons.push(`Compatible with ${answers.audience} wear`);
    } else {
      mismatches.push(`Primarily styled for ${product.audience} wear`);
    }
  }

  if (answers.strength && product.fragranceStrength) {
    possible += WEIGHTS.strength;
    const strengthMap: Record<string, string[]> = {
      light: ["light", "soft"],
      moderate: ["moderate", "balanced"],
      bold: ["bold", "strong", "intense"],
    };
    const match = strengthMap[answers.strength].some((token) =>
      product.fragranceStrength.toLowerCase().includes(token),
    );
    if (match) {
      earned += WEIGHTS.strength;
      reasons.push(`${product.fragranceStrength} presence aligns with your preference`);
    }
  }

  if (answers.season?.length && product.tags.length) {
    possible += WEIGHTS.season;
    const tagText = product.tags.join(" ").toLowerCase();
    const seasonScore = overlapScore(answers.season, [tagText]);
    earned += seasonScore * WEIGHTS.season;
  }

  const normalizedScore = possible > 0 ? Math.max(0, earned / possible) : 0;

  return {
    score: earned,
    normalizedScore,
    reasons: reasons.slice(0, 4),
    mismatches: mismatches.slice(0, 2),
    possible,
    earned,
  };
}

export function getScentFinderRecommendations(
  products: Product[],
  answers: ScentFinderAnswers,
  limit = 5,
): ScentFinderRecommendation[] {
  const eligible = products.filter(isQuizEligible);
  const pool = eligible.length >= 3 ? eligible : products.filter((product) => product.availableForSale);

  const scored = pool
    .map((product) => {
      const result = scoreProduct(product, answers);
      const coverage = metadataCoverage(product);
      const normalizedScore = result.normalizedScore;
      const cappedPercent = coverage === "complete"
        ? Math.min(92, Math.max(55, Math.round(normalizedScore * 100)))
        : Math.min(75, Math.max(45, Math.round(normalizedScore * 85)));

      return {
        product,
        score: result.score,
        normalizedScore,
        matchPercent: cappedPercent,
        confidenceLabel: confidenceLabel(normalizedScore, coverage),
        metadataCoverage: coverage,
        reasons:
          result.reasons.length > 0
            ? result.reasons
            : coverage === "limited"
              ? ["Limited verified metadata — browse with curiosity"]
              : ["Included as a browseable option with incomplete scent metadata"],
        mismatches: result.mismatches,
      } satisfies ScentFinderRecommendation;
    })
    .filter((item) => item.score > 0 || item.metadataCoverage !== "missing")
    .sort((a, b) => {
      if (b.normalizedScore !== a.normalizedScore) return b.normalizedScore - a.normalizedScore;
      if (Boolean(b.product.featured) !== Boolean(a.product.featured)) {
        return Number(Boolean(b.product.featured)) - Number(Boolean(a.product.featured));
      }
      return a.product.title.localeCompare(b.product.title);
    });

  return scored.slice(0, limit);
}

export { WEIGHTS };
