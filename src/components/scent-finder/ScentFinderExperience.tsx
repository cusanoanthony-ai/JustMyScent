"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Product } from "@/lib/commerce/types";
import { formatPriceRange } from "@/lib/formatters";
import {
  DEFAULT_SCENT_FINDER_ANSWERS,
  SCENT_FINDER_QUESTIONS,
  type ScentFinderAnswers,
} from "@/lib/scent-finder/types";
import { getScentFinderRecommendations } from "@/lib/scent-finder/scoring";

export function ScentFinderExperience({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ScentFinderAnswers>(DEFAULT_SCENT_FINDER_ANSWERS);
  const [isPending, startTransition] = useTransition();

  const question = SCENT_FINDER_QUESTIONS[step];
  const recommendations = useMemo(
    () => getScentFinderRecommendations(products, answers, 5),
    [answers, products],
  );
  const isComplete = step >= SCENT_FINDER_QUESTIONS.length;

  const updateAnswer = (value: string) => {
    if (!question) return;

    if (question.id === "audience") {
      setAnswers((current) => ({
        ...current,
        audience: value as ScentFinderAnswers["audience"],
      }));
      return;
    }

    if (question.id === "strength") {
      setAnswers((current) => ({
        ...current,
        strength: value as ScentFinderAnswers["strength"],
      }));
      return;
    }

    const key = question.id as keyof Pick<
      ScentFinderAnswers,
      "scentFamilies" | "moods" | "occasions" | "notes"
    >;

    setAnswers((current) => {
      const existing = current[key];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      return { ...current, [key]: next };
    });
  };

  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm tracking-[0.18em] text-rose-muted uppercase">Scent Finder</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-espresso sm:text-5xl">
          Find a fragrance profile that feels like you
        </h1>
        <p className="mt-4 text-base leading-relaxed text-espresso/70">
          Answer a few guided questions and receive recommendations based on scent family, mood,
          notes, and wear preferences.
        </p>
      </div>

      {!isComplete && question ? (
        <div className="mt-10 max-w-2xl border border-espresso/10 bg-[#faf6f0] p-6 sm:p-8">
          <p className="text-xs tracking-[0.16em] text-espresso/55 uppercase">
            Step {step + 1} of {SCENT_FINDER_QUESTIONS.length}
          </p>
          <h2 className="mt-3 font-display text-3xl text-espresso">{question.title}</h2>
          {question.subtitle ? (
            <p className="mt-2 text-sm text-espresso/65">{question.subtitle}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {question.options.map((option) => {
              const selected =
                question.id === "audience"
                  ? answers.audience === option.value
                  : question.id === "strength"
                    ? answers.strength === option.value
                    : answers[question.id as "scentFamilies" | "moods" | "occasions" | "notes"].includes(
                        option.value,
                      );

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateAnswer(option.value)}
                  className={`border px-4 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne ${
                    selected
                      ? "border-espresso bg-espresso text-ivory"
                      : "border-espresso/15 text-espresso"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              Back
            </Button>
            <Button onClick={() => setStep((current) => current + 1)}>Continue</Button>
            <button
              type="button"
              onClick={() => {
                setAnswers(DEFAULT_SCENT_FINDER_ANSWERS);
                setStep(0);
              }}
              className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-espresso/70 uppercase underline-offset-4 hover:underline"
            >
              Restart
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-3xl text-espresso">Your recommendations</h2>
            <button
              type="button"
              onClick={() => {
                setAnswers(DEFAULT_SCENT_FINDER_ANSWERS);
                setStep(0);
              }}
              className="text-xs font-semibold tracking-[0.14em] text-espresso uppercase underline-offset-4 hover:underline"
            >
              Restart quiz
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {recommendations.map((item) => (
              <article
                key={item.product.id}
                className="grid gap-4 border border-espresso/10 bg-ivory sm:grid-cols-[140px_1fr]"
              >
                <div className="aspect-[4/5] overflow-hidden sm:aspect-auto sm:h-full">
                  <ProductVisual product={item.product} className="h-full w-full" />
                </div>
                <div className="p-5">
                  <p className="text-xs tracking-[0.16em] text-champagne uppercase">
                    {item.matchPercent}% match
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-espresso">{item.product.title}</h3>
                  <p className="mt-1 text-sm text-espresso/65">
                    {item.product.scentFamily} ·{" "}
                    {[...item.product.topNotes, ...item.product.heartNotes]
                      .slice(0, 3)
                      .join(", ")}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-espresso">
                    {formatPriceRange(
                      item.product.priceRange.min,
                      item.product.priceRange.max,
                    )}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-espresso/70">
                    {item.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/products/${item.product.handle}`}
                      className="text-xs font-semibold tracking-[0.14em] text-espresso uppercase underline-offset-4 hover:underline"
                    >
                      View Product
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const variant = item.product.variants.find(
                            (entry) => entry.availableForSale,
                          );
                          if (!variant) return;
                          await addItem({ merchandiseId: variant.id, quantity: 1 });
                        })
                      }
                      className="text-xs font-semibold tracking-[0.14em] text-espresso uppercase underline-offset-4 hover:underline disabled:opacity-50"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
