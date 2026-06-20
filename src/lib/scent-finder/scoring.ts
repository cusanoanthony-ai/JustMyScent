import type { Product } from "@/lib/commerce/types";
import type { ScentFinderAnswers, ScentFinderRecommendation } from "@/lib/scent-finder/types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function overlapScore(selected: string[], actual: string | string[]): number {
  if (!selected.length) {
    return 0;
  }

  const actualValues = Array.isArray(actual) ? actual : [actual];
  const normalizedActual = actualValues.map(normalize);
  const matches = selected.filter((item) =>
    normalizedActual.some((value) => value.includes(normalize(item))),
  );

  return matches.length / selected.length;
}

function strengthScore(selected: ScentFinderAnswers["strength"], productStrength: string): number {
  const map = {
    light: ["light", "soft"],
    moderate: ["moderate", "balanced"],
    bold: ["bold", "strong"],
  };

  const normalized = normalize(productStrength);
  return map[selected].some((value) => normalized.includes(value)) ? 1 : 0;
}

export function scoreProduct(product: Product, answers: ScentFinderAnswers) {
  const reasons: string[] = [];
  let score = 0;

  const familyScore = overlapScore(answers.scentFamilies, product.scentFamily);
  if (familyScore > 0) {
    score += familyScore * 30;
    reasons.push(`Matches your ${product.scentFamily} preference`);
  }

  const moodScore = overlapScore(answers.moods, product.mood);
  if (moodScore > 0) {
    score += moodScore * 20;
    reasons.push(`Aligns with a ${product.mood.toLowerCase()} mood`);
  }

  const occasionScore = overlapScore(answers.occasions, product.occasion);
  if (occasionScore > 0) {
    score += occasionScore * 15;
    reasons.push(`Suitable for ${product.occasion.toLowerCase()} wear`);
  }

  const allNotes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes];
  const noteScore = overlapScore(answers.notes, allNotes);
  if (noteScore > 0) {
    score += noteScore * 20;
    const matchedNotes = answers.notes.filter((note) =>
      allNotes.some((productNote) => normalize(productNote).includes(normalize(note))),
    );
    reasons.push(`Features notes you enjoy: ${matchedNotes.slice(0, 3).join(", ")}`);
  }

  if (answers.audience !== "any") {
    if (product.audience === answers.audience || product.audience === "unisex") {
      score += 10;
      reasons.push(`Works well for ${answers.audience} wear`);
    }
  } else {
    score += 4;
  }

  const strengthMatch = strengthScore(answers.strength, product.fragranceStrength);
  if (strengthMatch) {
    score += 10;
    reasons.push(`${product.fragranceStrength} presence matches your preference`);
  }

  if (product.featured) {
    score += 3;
  }

  if (product.availableForSale) {
    score += 2;
  }

  return {
    score,
    reasons: reasons.slice(0, 3),
  };
}

export function getScentFinderRecommendations(
  products: Product[],
  answers: ScentFinderAnswers,
  limit = 5,
): ScentFinderRecommendation[] {
  const scored = products
    .map((product) => {
      const result = scoreProduct(product, answers);
      return {
        product,
        score: result.score,
        matchPercent: Math.min(98, Math.max(55, Math.round(result.score))),
        reasons: result.reasons.length
          ? result.reasons
          : ["A balanced option based on your selected preferences"],
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length >= 3) {
    return scored;
  }

  const fallback = products
    .filter((product) => product.availableForSale)
    .slice(0, limit)
    .map((product) => ({
      product,
      score: 40,
      matchPercent: 70,
      reasons: ["A versatile starting point while you refine your preferences"],
    }));

  const merged = [...scored];
  for (const item of fallback) {
    if (merged.length >= limit) break;
    if (!merged.some((entry) => entry.product.handle === item.product.handle)) {
      merged.push(item);
    }
  }

  return merged.slice(0, limit);
}
