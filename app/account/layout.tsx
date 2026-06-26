import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  },
  title: {
    default: "Mi cuenta",
    template: "%s | Mi cuenta"
  }
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
