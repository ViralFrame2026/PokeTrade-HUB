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
    "Marketplace hispano para comprar, vender, intercambiar y sortear cartas oficiales de Pokemon TCG.",
  openGraph: {
    title: "POKETRADE HUB",
    description:
      "Marketplace Pokemon TCG con reputacion, sorteos, moderacion y catalogo oficial.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "POKETRADE HUB",
    description:
      "Compra, vende, intercambia y sortea cartas oficiales de Pokemon TCG."
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
