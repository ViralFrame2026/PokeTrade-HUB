import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteUrlObject } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "POKETRADE HUB",
  authors: [{ name: "POKETRADE HUB" }],
  category: "marketplace",
  creator: "POKETRADE HUB",
  metadataBase: siteUrlObject(),
  title: {
    default: "POKETRADE HUB - Marketplace Pokemon TCG",
    template: "%s | POKETRADE HUB"
  },
  description:
    "Marketplace argentino para comprar, vender, intercambiar y sortear productos Pokemon TCG con moderacion, reputacion y catalogo oficial.",
  keywords: [
    "Pokemon TCG",
    "productos Pokemon",
    "marketplace TCG",
    "intercambio Pokemon",
    "sorteos Pokemon",
    "cartas coleccionables",
    "TCG Argentina",
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
    title: "POKETRADE HUB - Marketplace Pokemon TCG",
    description:
      "Compra, vende, intercambia y sortea productos Pokemon TCG con reputacion, moderacion y catalogo oficial.",
    images: [
      {
        alt: "POKETRADE HUB marketplace Pokemon TCG",
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
    title: "POKETRADE HUB - Marketplace Pokemon TCG",
    description: "Compra, vende, intercambia y sortea productos Pokemon TCG.",
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
