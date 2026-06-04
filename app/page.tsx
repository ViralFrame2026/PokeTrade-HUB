import {
  BadgeCheck,
  Bell,
  Gift,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trophy,
  Users
} from "lucide-react";
import Link from "next/link";
import { CardSpotlight } from "@/components/card-spotlight";
import { ListingCard } from "@/components/listing-card";
import { StatCard } from "@/components/stat-card";
import { ButtonLink } from "@/components/ui/button-link";
import { featuredCards, latestListings, raffles, topUsers } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-pokemonYellow text-sm font-black text-slate-950 shadow-foil">
              PH
            </span>
            <div>
              <p className="text-sm font-black tracking-[0.24em] text-pokemonYellow">
                POKETRADE
              </p>
              <p className="text-xs font-semibold text-slate-400">HUB TCG</p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <a href="#marketplace">Marketplace</a>
            <a href="#sorteos">Sorteos</a>
            <a href="#comunidad">Comunidad</a>
            <a href="#seguridad">Seguridad</a>
          </div>
          <ButtonLink href="/publish" icon={Store} size="sm">
            Publicar
          </ButtonLink>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-pokemonYellow/30 bg-pokemonYellow/10 px-4 py-2 text-sm font-semibold text-pokemonYellow">
            <Sparkles className="h-4 w-4" />
            Catalogo oficial Pokemon TCG, comunidad real
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.97] tracking-normal text-white sm:text-6xl lg:text-7xl">
            El Marketplace Pokemon TCG para Comprar, Vender, Intercambiar y
            Sortear
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Publicaciones moderadas, reputacion verificable y cartas enlazadas a
            datos oficiales. Una base lista para crecer con Supabase, Next.js y
            la API de Pokemon TCG.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#marketplace" icon={Search}>
              Explorar Marketplace
            </ButtonLink>
            <ButtonLink href="/publish" icon={Store} variant="secondary">
              Publicar Producto
            </ButtonLink>
            <ButtonLink href="/raffles/new" icon={Gift} variant="ghost">
              Crear Sorteo
            </ButtonLink>
          </div>
        </div>
        <div className="relative min-h-[540px]">
          <CardSpotlight cards={featuredCards} />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <StatCard icon={Users} label="Usuarios activos" value="12.4K" />
          <StatCard icon={Store} label="Publicaciones" value="38K" />
          <StatCard icon={ShieldCheck} label="Operaciones seguras" value="96%" />
          <StatCard icon={Trophy} label="Sorteos creados" value="1.8K" />
        </div>
      </section>

      <section id="marketplace" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
              Publicaciones recientes
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Marketplace moderado
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 text-sm text-slate-300">
            {["Venta", "Intercambio", "Sorteo", "Gratis", "Sellados"].map((filter) => (
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold transition hover:border-pokemonYellow/50 hover:text-white"
                key={filter}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latestListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section id="sorteos" className="border-y border-white/10 bg-slate-950/45 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
                Sorteos activos
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">Premios en curso</h2>
            </div>
            <Gift className="h-10 w-10 text-pokemonYellow" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {raffles.map((raffle) => (
              <article className="glass rounded-lg p-5" key={raffle.title}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-pokemonBlue/20 px-3 py-1 text-xs font-bold text-blue-200">
                    {raffle.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{raffle.endsIn}</span>
                </div>
                <h3 className="text-xl font-black text-white">{raffle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{raffle.requirements}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-400">Participantes</span>
                  <span className="font-black text-pokemonYellow">{raffle.entries}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comunidad" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
              Usuarios destacados
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Reputacion visible desde el perfil
            </h2>
            <p className="mt-4 text-slate-300">
              Badges, valoraciones y reportes ayudan a separar vendedores
              confiables de publicaciones dudosas.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {topUsers.map((user) => (
              <article className="glass rounded-lg p-5" key={user.name}>
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 font-black text-pokemonYellow">
                    {user.initials}
                  </div>
                  <div>
                    <h3 className="font-black text-white">{user.name}</h3>
                    <p className="text-sm text-slate-400">{user.city}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-pokemonYellow">
                  <Star className="h-4 w-4 fill-current" />
                  {user.rating} · {user.badge}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="seguridad" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Moderacion obligatoria",
              copy: "Toda publicacion pasa por pendiente, aprobada o rechazada con motivo visible."
            },
            {
              icon: BadgeCheck,
              title: "Verificacion",
              copy: "Badge para usuarios con WhatsApp validado y minimo 5 valoraciones positivas."
            },
            {
              icon: Bell,
              title: "Notificaciones",
              copy: "Preparado para avisos de comentarios, ventas, reservas, sorteos y reportes."
            }
          ].map((item) => (
            <article className="glass rounded-lg p-6" key={item.title}>
              <item.icon className="h-8 w-8 text-pokemonYellow" />
              <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3 text-slate-300">
            <MessageCircle className="h-5 w-5 text-pokemonYellow" />
            Contacto por WhatsApp hoy, arquitectura lista para chat interno.
          </div>
          <ButtonLink href="/admin" icon={ShieldCheck} variant="secondary">
            Panel Administrador
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
