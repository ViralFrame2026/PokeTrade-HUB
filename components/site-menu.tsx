"use client";

import {
  Bell,
  ChevronDown,
  Heart,
  Gift,
  Handshake,
  ListChecks,
  MessagesSquare,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trophy,
  UserRound,
  Users
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/publish", icon: Store, label: "Publicar producto", primary: true },
  { href: "/account", icon: UserRound, label: "Mi cuenta" },
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/raffles", icon: Gift, label: "Sorteos" },
  { href: "/account/raffles", icon: Trophy, label: "Mis sorteos" },
  {
    href: "/account/listings",
    icon: ListChecks,
    label: "Mis publicaciones",
    badge: "listings"
  },
  { href: "/account/operations", icon: Handshake, label: "Mis operaciones" },
  { href: "/account/messages", icon: MessagesSquare, label: "Mensajes", badge: "messages" },
  { href: "/account/profile", icon: UserRound, label: "Mi perfil" },
  { href: "/account/favorites", icon: Heart, label: "Favoritos" },
  {
    href: "/account/notifications",
    icon: Bell,
    label: "Notificaciones",
    badge: "notifications"
  },
  { href: "/#comunidad", icon: Users, label: "Comunidad" },
  { href: "/#seguridad", icon: ShieldCheck, label: "Seguridad" }
];

type MenuBadgeKey = "listings" | "messages" | "notifications";

type SiteMenuProps = {
  badges?: Partial<Record<MenuBadgeKey, number>>;
  showAdmin?: boolean;
};

export function SiteMenu({ badges = {}, showAdmin = false }: SiteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const visibleLinks = showAdmin
    ? [
        { href: "/admin", icon: ShieldCheck, label: "Panel administrador", primary: true },
        ...links
      ]
    : links;

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutsideClick);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-300 px-3 text-sm font-bold text-blue-100 transition hover:border-yellow-300 hover:bg-blue-700 hover:text-yellow-300"
        onClick={() => setIsOpen((current) => !current)}
        title="Menu"
        type="button"
      >
        <Menu className="h-5 w-5" />
        <span className="hidden sm:inline">Menu</span>
        <ChevronDown
          className={`hidden h-4 w-4 transition-transform sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        aria-hidden={!isOpen}
        className={`absolute left-0 top-[calc(100%+18px)] z-50 w-[min(86vw,310px)] origin-top-left overflow-hidden rounded-b-lg border border-t-4 border-blue-200 border-t-yellow-400 bg-[#10245e] text-white shadow-[0_18px_45px_rgba(15,23,42,0.35)] transition duration-200 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
            Menu principal
          </p>
          <p className="mt-1 text-xs text-blue-200">Accesos de tu cuenta y comunidad</p>
        </div>

        <nav aria-label="Navegación principal" className="max-h-[min(68vh,470px)] overflow-y-auto p-2">
          <div className="space-y-1">
            {visibleLinks.map((item) => {
              const badge =
                "badge" in item && item.badge
                  ? Math.min(badges[item.badge as MenuBadgeKey] ?? 0, 99)
                  : 0;

              return (
                <Link
                  className={`group flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                    item.primary
                      ? "bg-yellow-400 text-blue-950 hover:bg-yellow-300"
                      : "text-blue-50 hover:bg-white/10 hover:text-yellow-300"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition ${
                      item.primary
                        ? "bg-blue-950/10 text-blue-950"
                        : "bg-blue-800/80 text-blue-200 group-hover:bg-yellow-400 group-hover:text-blue-950"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {badge > 0 ? (
                    <span className="grid min-w-6 place-items-center rounded-full bg-red-500 px-2 py-1 text-[11px] font-black leading-none text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
