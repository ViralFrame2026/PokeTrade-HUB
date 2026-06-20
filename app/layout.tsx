import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
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
  openGraph: {
    title: "POKETRADE HUB",
    description:
      "Marketplace Pokémon TCG con reputación, sorteos, moderación y catálogo oficial.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "POKETRADE HUB",
    description:
      "Comprá, vendé, intercambiá y sorteá cartas oficiales de Pokémon TCG."
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
