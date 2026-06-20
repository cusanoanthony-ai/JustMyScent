"use client";

import { useState, useTransition } from "react";
import { submitContactForm } from "@/app/actions/contact-actions";

export function ContactForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [mailto, setMailto] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      action={(formData) => {
        startTransition(async () => {
          const result = await submitContactForm(formData);
          setMessage(result.message);
          setMailto(result.mailto ?? null);
        });
      }}
    >
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-espresso">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-2 w-full border border-espresso/15 bg-transparent px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-espresso">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 w-full border border-espresso/15 bg-transparent px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-espresso">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          required
          className="mt-2 w-full border border-espresso/15 bg-transparent px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-espresso">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="mt-2 w-full border border-espresso/15 bg-transparent px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="border border-espresso bg-espresso px-6 py-3 text-sm font-semibold tracking-[0.14em] text-ivory uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
      {message ? (
        <p className="text-sm text-espresso/70" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {mailto ? (
        <p className="text-sm text-espresso/70">
          Optional fallback:{" "}
          <a href={mailto} className="underline underline-offset-4">
            open mail client
          </a>
        </p>
      ) : null}
    </form>
  );
}
