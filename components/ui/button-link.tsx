import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  icon?: LucideIcon;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost" | "light" | "blue";
};

export function ButtonLink({
  children,
  href,
  icon: Icon,
  size = "md",
  variant = "primary"
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-bold transition focus:outline-none focus:ring-2 focus:ring-pokemonYellow/70",
        size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-3 text-sm sm:text-base",
        variant === "primary" &&
          "border-pokemonYellow bg-pokemonYellow text-slate-950 hover:bg-yellow-300",
        variant === "secondary" &&
          "border-white/12 bg-white/10 text-white hover:border-pokemonYellow/50",
        variant === "ghost" &&
          "border-transparent bg-transparent text-slate-200 hover:bg-white/10",
        variant === "light" &&
          "border-blue-200 bg-white text-blue-800 shadow-sm hover:border-blue-400 hover:bg-blue-50",
        variant === "blue" &&
          "border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700"
      )}
      href={href}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}
