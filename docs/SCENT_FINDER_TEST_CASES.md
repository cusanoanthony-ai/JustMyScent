# Scent Finder Test Cases

Golden cases used to validate quiz scoring and explanation behavior.

## 1. Warm vanilla gourmand

**Input**

- Scent families: Oriental Vanilla, Gourmand
- Notes: vanilla, amber
- Avoid notes: none
- Mood: Warm
- Occasion: Evening
- Audience: any
- Strength: moderate

**Expected**

- Recommends quiz-eligible products with verified vanilla/gourmand profiles
- Confidence label `Strong match` or `Good match` when metadata is complete
- Reasons mention preferred notes and scent family

## 2. Fresh citrus daytime

**Input**

- Scent families: Fresh
- Notes: bergamot
- Mood: Fresh
- Occasion: Daytime
- Audience: any
- Strength: light

**Expected**

- Fresh/daytime-aligned products rank above unrelated families
- Limited metadata products receive lower match percentages

## 3. Floral romantic evening

**Input**

- Scent families: Floral
- Notes: rose, jasmine
- Mood: Romantic
- Occasion: Date Night
- Audience: women
- Strength: moderate

**Expected**

- Women/unisex floral products with verified notes rank highest
- Audience mismatch noted for primarily men’s products

## 4. Woody masculine profile

**Input**

- Scent families: Woody
- Notes: cedar
- Mood: Confident
- Occasion: Evening
- Audience: men
- Strength: bold

**Expected**

- Men’s woody products score higher than women’s florals
- Strength alignment adds points only when verified

## 5. Clean unisex profile

**Input**

- Scent families: Fresh, Aquatic
- Notes: musk avoided off
- Mood: Clean
- Audience: unisex
- Strength: light

**Expected**

- Unisex/fresh products preferred
- No fabricated note claims on incomplete products

## 6. User avoiding musk

**Input**

- Avoid notes: musk

**Expected**

- Products containing musk receive penalty and mismatch explanation
- Products without musk may receive partial credit on avoid-note dimension

## 7. User with no audience preference

**Input**

- Audience: any

**Expected**

- No audience penalty or bonus unless other preferences are selected
- Women’s, men’s, and unisex products remain eligible

## 8. Product with incomplete metadata

**Input**

- Notes: vanilla

**Expected**

- Product remains browseable
- Not treated as a high-confidence recommendation unless quiz eligible
- Explanation states limited verified metadata when applicable

## Automated coverage

See:

- `src/lib/scent-finder/scoring.test.ts`
- `src/lib/scent-metadata/merge.test.ts`
- `src/lib/shopify/webhook.test.ts`
