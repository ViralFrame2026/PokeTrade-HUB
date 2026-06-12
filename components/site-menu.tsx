"use client";

import {
  Bell,
  Heart,
  ListChecks,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/account/listings", icon: ListChecks, label: "Mis publicaciones" },
  { href: "/account/profile", icon: UserRound, label: "Mi perfil" },
  { href: "/account/favorites", icon: Heart, label: "Favoritos" },
  { href: "/account/notifications", icon: Bell, label: "Notificaciones" },
  { href: "/#comunidad", icon: Users, label: "Comunidad" },
  { href: "/#seguridad", icon: ShieldCheck, label: "Seguridad" }
];

export function SiteMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-label="Abrir menu"
        className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:bg-blue-700 hover:text-yellow-300"
        onClick={() => setIsOpen(true)}
        title="Menu"
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 transition ${
          isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        <button
          aria-label="Cerrar menu"
          className={`absolute inset-0 bg-blue-950/65 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
          type="button"
        />

        <aside
          aria-label="Navegacion principal"
          className={`absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col border-l-4 border-yellow-400 bg-blue-950 text-white shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-yellow-300">
                  POKETRADE
                </p>
                <p className="text-xs font-bold text-blue-200">MENU PRINCIPAL</p>
              </div>
            </div>
            <button
              aria-label="Cerrar menu"
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {links.map((item) => (
                <Link
                  className="flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 font-bold text-blue-100 transition hover:bg-blue-800 hover:text-yellow-300"
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 font-black text-blue-950 transition hover:bg-yellow-300"
              href="/publish"
              onClick={() => setIsOpen(false)}
            >
              <Store className="h-5 w-5" />
              Publicar producto
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
