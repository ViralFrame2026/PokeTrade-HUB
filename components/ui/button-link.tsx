import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  icon?: LucideIcon;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
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
          "border-transparent bg-transparent text-slate-200 hover:bg-white/10"
      )}
      href={href}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}
