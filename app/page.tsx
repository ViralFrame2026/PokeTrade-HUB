import {
  BadgeCheck,
  Bell,
  Droplets,
  Flame,
  Gift,
  Leaf,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";
import { CardSpotlight } from "@/components/card-spotlight";
import { ListingCard } from "@/components/listing-card";
import { StatCard } from "@/components/stat-card";
import { ButtonLink } from "@/components/ui/button-link";
import { featuredCards } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type Related<T> = T | T[] | null;

type ListingRow = {
  description: string | null;
  id: string;
  location_city: string | null;
  location_country: string | null;
  price: number | null;
  profiles: Related<{
    display_name: string;
    is_verified: boolean;
    reputation_average: number;
  }>;
  products: Related<{
    cards: Related<{
      image_large: string;
      number: string | null;
      official_name: string;
      pokemon_tcg_id: string;
      rarity: string | null;
      set_name: string;
    }>;
  }>;
  status: string;
  title: string;
  trade_wants: string | null;
  type: string;
};

type ProfileRow = {
  city: string | null;
  country: string | null;
  display_name: string;
  is_verified: boolean;
  reputation_average: number;
  reputation_count: number;
};

function firstRelated<T>(value: Related<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function typeLabel(type: string) {
  return {
    free: "Gratis",
    raffle: "Sorteo",
    sale: "Venta",
    trade: "Intercambio"
  }[type] ?? type;
}

function listingPrice(listing: ListingRow) {
  if (listing.type === "trade") {
    return "Intercambio";
  }

  if (listing.type === "free") {
    return "Gratis";
  }

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(listing.price ?? 0);
}

export default async function HomePage() {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  let listingsData: ListingRow[] = [];
  let profilesData: ProfileRow[] = [];
  let usersTotal = 0;
  let listingsTotal = 0;
  let rafflesTotal = 0;

  if (hasSupabaseConfig) {
    const supabase = await createSupabaseServerClient();
    const [listingsResult, usersCount, listingsCount, rafflesCount, profilesResult] =
      await Promise.all([
        supabase
          .from("listings")
          .select(
            "id, title, description, type, status, price, trade_wants, location_city, location_country, profiles!listings_seller_id_fkey(display_name, is_verified, reputation_average), products!listings_product_id_fkey(cards!products_card_id_fkey(pokemon_tcg_id, official_name, image_large, set_name, rarity, number))"
          )
          .eq("moderation_status", "approved")
          .eq("status", "active")
          .order("approved_at", { ascending: false })
          .limit(6),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("moderation_status", "approved"),
        supabase
          .from("raffles")
          .select("id", { count: "exact", head: true })
          .eq("moderation_status", "approved"),
        supabase
          .from("profiles")
          .select(
            "display_name, city, country, is_verified, reputation_average, reputation_count"
          )
          .gt("reputation_count", 0)
          .order("reputation_average", { ascending: false })
          .limit(4)
      ]);

    listingsData = (listingsResult.data ?? []) as ListingRow[];
    profilesData = (profilesResult.data ?? []) as ProfileRow[];
    usersTotal = usersCount.count ?? 0;
    listingsTotal = listingsCount.count ?? 0;
    rafflesTotal = rafflesCount.count ?? 0;
  }

  const listings: Listing[] = listingsData.flatMap((row) => {
      const profile = firstRelated(row.profiles);
      const product = firstRelated(row.products);
      const card = firstRelated(product?.cards ?? null);

      if (!card) {
        return [];
      }

      return [{
        cardMeta: `${card.set_name} | ${card.rarity ?? "Rareza no informada"} | #${card.number ?? "N/D"}`,
        description:
          row.description ??
          (row.type === "trade" ? `Busca: ${row.trade_wants ?? "propuestas"}` : ""),
        id: row.id,
        image: card.image_large,
        location: [row.location_city, row.location_country].filter(Boolean).join(", "),
        price: listingPrice(row),
        seller: profile?.display_name ?? "Entrenador TCG",
        sellerRating: Number(profile?.reputation_average ?? 0).toFixed(1),
        status: "Activa",
        title: card.official_name,
        type: typeLabel(row.type),
        verified: profile?.is_verified ?? false
      }];
    }
  );

  const topUsers = profilesData.map((profile) => ({
    badge: profile.is_verified ? "Vendedor verificado" : "Coleccionista destacado",
    city: [profile.city, profile.country].filter(Boolean).join(", ") || "Comunidad global",
    initials: profile.display_name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    name: profile.display_name,
    rating: Number(profile.reputation_average).toFixed(2)
  }));

  return (
    <main className="home-page min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="sticky top-0 z-20 border-b-4 border-yellow-400 bg-blue-800/95 text-white backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-11 w-11 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.24em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">HUB TCG</p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-bold text-blue-100 md:flex">
            <a className="hover:text-yellow-300" href="#marketplace">
              Marketplace
            </a>
            <a className="hover:text-yellow-300" href="#comunidad">
              Comunidad
            </a>
            <a className="hover:text-yellow-300" href="#seguridad">
              Seguridad
            </a>
          </div>
          <ButtonLink href="/publish" icon={Store} size="sm">
            Publicar
          </ButtonLink>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b-8 border-yellow-400 bg-blue-700">
        <div className="pokeball-pattern absolute inset-0 opacity-[0.13]" aria-hidden="true" />
        <div className="pokeball absolute -left-16 top-24 h-44 w-44 rotate-12 opacity-20" aria-hidden="true" />
        <div className="pokeball absolute -right-20 bottom-12 h-56 w-56 -rotate-12 opacity-20" aria-hidden="true" />
        <div className="absolute left-0 top-0 h-3 w-full bg-[linear-gradient(90deg,#ef4444_0_33%,#facc15_33%_66%,#60a5fa_66%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-20 lg:pt-20">
          <div className="relative z-10 flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border-2 border-yellow-300 bg-blue-950/45 px-4 py-2 text-sm font-bold text-yellow-200 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Cartas oficiales, comunidad real
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Tu comunidad para
              <span className="block text-yellow-300">coleccionar y conectar</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Compra, vende e intercambia cartas oficiales de Pokemon TCG con
              publicaciones moderadas y reputacion visible.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#marketplace" icon={Search}>
                Explorar cartas
              </ButtonLink>
              <ButtonLink href="/publish" icon={Store} variant="light">
                Publicar producto
              </ButtonLink>
              <ButtonLink href="/raffles/new" icon={Gift} variant="blue">
                Crear sorteo
              </ButtonLink>
            </div>
          </div>
          <div className="relative z-10 min-h-[530px]">
            <CardSpotlight cards={featuredCards} />
          </div>
        </div>
      </section>

      <section className="bg-red-500 py-8 text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <StatCard icon={Users} label="Usuarios registrados" value={String(usersTotal)} />
          <StatCard
            icon={Store}
            label="Publicaciones aprobadas"
            value={String(listingsTotal)}
          />
          <StatCard icon={ShieldCheck} label="Moderacion" value="100%" />
          <StatCard icon={Trophy} label="Sorteos activos" value={String(rafflesTotal)} />
        </div>
      </section>

      <section id="marketplace" className="relative overflow-hidden bg-[#eaf2ff]">
        <div className="pokeball absolute -right-20 top-10 h-48 w-48 opacity-[0.08]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-red-500">
              Publicaciones reales
            </p>
            <h2 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">
              Recién aprobadas
            </h2>
          </div>
          <ButtonLink href="/publish" icon={Store} variant="blue">
            Publicar una carta
          </ButtonLink>
        </div>
        {listings.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 py-14 text-center">
            <Store className="mx-auto h-10 w-10 text-blue-500" />
            <h3 className="mt-4 text-xl font-black text-blue-950">
              El marketplace está listo
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-slate-600">
              Las publicaciones aprobadas aparecerán aquí. Sé el primero en sumar una carta.
            </p>
          </div>
        )}
        </div>
      </section>

      <section id="comunidad" className="relative overflow-hidden border-y-8 border-yellow-400 bg-blue-800 py-16 text-white">
        <div className="pokeball-pattern absolute inset-0 opacity-[0.08]" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
              Comunidad
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              La confianza también se colecciona
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-blue-100">
              Cada operación ayuda a construir reputación. Los perfiles muestran
              valoraciones, actividad y verificación.
            </p>
            <div className="mt-8 flex gap-3" aria-hidden="true">
              <span className="energy-dot bg-yellow-400 text-blue-950">
                <Zap className="h-5 w-5 fill-current" />
              </span>
              <span className="energy-dot bg-red-500 text-white">
                <Flame className="h-5 w-5 fill-current" />
              </span>
              <span className="energy-dot bg-sky-400 text-white">
                <Droplets className="h-5 w-5" />
              </span>
              <span className="energy-dot bg-emerald-500 text-white">
                <Leaf className="h-5 w-5 fill-current" />
              </span>
            </div>
          </div>
          {topUsers.length > 0 ? (
            <div className="relative z-10 grid gap-4 sm:grid-cols-2">
              {topUsers.map((user) => (
                <article className="rounded-lg border border-yellow-200 bg-white p-5 shadow-sm" key={user.name}>
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 font-black text-white">
                      {user.initials}
                    </div>
                    <div>
                      <h3 className="font-black text-blue-950">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.city}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                    {user.rating} | {user.badge}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="relative z-10 rounded-lg border border-yellow-300 bg-white p-8 text-slate-600 shadow-sm">
              Los coleccionistas destacados aparecerán cuando reciban sus primeras valoraciones.
            </div>
          )}
        </div>
      </section>

      <section id="seguridad" className="bg-[#fff8cf]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-500">Seguridad</p>
          <h2 className="mt-2 text-3xl font-black text-blue-950">Un intercambio más tranquilo</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              color: "bg-blue-600",
              copy: "Toda publicación se revisa antes de aparecer en el marketplace.",
              icon: ShieldCheck,
              title: "Moderación obligatoria"
            },
            {
              color: "bg-red-500",
              copy: "Los vendedores confiables pueden mostrar una insignia visible.",
              icon: BadgeCheck,
              title: "Perfiles verificados"
            },
            {
              color: "bg-yellow-400",
              copy: "Avisos de aprobación, rechazo, ventas, reservas y comentarios.",
              icon: Bell,
              title: "Notificaciones claras"
            }
          ].map((item) => (
            <article className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm" key={item.title}>
              <div className={`grid h-11 w-11 place-items-center rounded-full ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-black text-blue-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-blue-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-yellow-300" />
            Contacto directo hoy, chat interno preparado para la siguiente etapa.
          </div>
          <ButtonLink href="/admin" icon={ShieldCheck} variant="light">
            Panel administrador
          </ButtonLink>
        </div>
        </div>
      </section>
    </main>
  );
}
