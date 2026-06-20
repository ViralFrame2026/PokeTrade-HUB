import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "POKETRADE HUB",
  authors: [{ name: "POKETRADE HUB" }],
  category: "marketplace",
  creator: "POKETRADE HUB",
  metadataBase: new URL("https://poketrade-hub.vercel.app"),
  title: {
    default: "POKETRADE HUB",
    template: "%s | POKETRADE HUB"
  },
  description:
    "Marketplace argentino para comprar, vender, intercambiar y sortear cartas oficiales de Pokémon TCG.",
  keywords: [
    "Pokémon TCG",
    "cartas Pokémon",
    "marketplace TCG",
    "intercambio Pokémon",
    "sorteos Pokémon",
    "PokeTrade HUB"
  ],
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "POKETRADE HUB",
    description:
      "Marketplace Pokémon TCG con reputación, sorteos, moderación y catálogo oficial.",
    images: [
      {
        alt: "POKETRADE HUB marketplace Pokémon TCG",
        height: 720,
        url: "/assets/pokemon-card-banner.webp",
        width: 1880
      }
    ],
    locale: "es_AR",
    siteName: "POKETRADE HUB",
    type: "website",
    url: "/"
  },
  publisher: "POKETRADE HUB",
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    },
    index: true
  },
  twitter: {
    card: "summary_large_image",
    title: "POKETRADE HUB",
    description:
      "Comprá, vendé, intercambiá y sorteá cartas oficiales de Pokémon TCG.",
    images: ["/assets/pokemon-card-banner.webp"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
