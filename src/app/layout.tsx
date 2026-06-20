import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Disclaimer } from "@/components/Disclaimer";
import { Header } from "@/components/Header";
import { bodyFont, displayFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Just My Scent — Unofficial Redesign Concept",
  description:
    "A premium fragrance-oil ecommerce concept exploring editorial luxury and personal scent discovery.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-body antialiased">
        <AnnouncementBar />
        <Header />
        <main>{children}</main>
        <Disclaimer />
      </body>
    </html>
  );
}
