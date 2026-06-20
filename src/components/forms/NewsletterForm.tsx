"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        if (!email.includes("@")) {
          setError("Enter a valid email address.");
          return;
        }

        setStatus(
          "Demonstration signup received. No email service is connected, so this address was not stored.",
        );
        setEmail("");
      }}
    >
      <label htmlFor="newsletter-email" className="block text-sm font-medium text-espresso">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="min-h-12 flex-1 border border-espresso/15 bg-transparent px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          className="min-h-12 border border-espresso bg-espresso px-6 py-3 text-sm font-semibold tracking-[0.14em] text-ivory uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        >
          Join
        </button>
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="text-sm text-espresso/70" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </form>
  );
}
