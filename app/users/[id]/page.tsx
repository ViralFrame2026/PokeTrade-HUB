import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Star,
  Store
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
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
  products: Related<{
    cards: Related<{
      image_large: string;
      number: string | null;
      official_name: string;
      rarity: string | null;
      set_name: string;
    }>;
  }>;
  trade_wants: string | null;
  type: string;
};

type RatingRow = {
  comment: string | null;
  created_at: string;
  id: string;
  profiles: Related<{ display_name: string }>;
  stars: number;
};

function firstRelated<T>(value: Related<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function typeLabel(type: string) {
  return { free: "Gratis", sale: "Venta", trade: "Intercambio" }[type] ?? type;
}

function priceLabel(type: string, price: number | null) {
  if (type === "trade") return "Intercambio";
  if (type === "free") return "Gratis";

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(price ?? 0);
}

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [{ data: profile }, { data: listingData }, { data: ratingData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, city, country, bio, is_verified, reputation_average, reputation_count, joined_at"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("listings")
        .select(
          "id, description, type, price, trade_wants, location_city, location_country, products!listings_product_id_fkey(cards!products_card_id_fkey(official_name, image_large, set_name, rarity, number))"
        )
        .eq("seller_id", id)
        .eq("moderation_status", "approved")
        .eq("status", "active")
        .order("approved_at", { ascending: false }),
      supabase
        .from("ratings")
        .select(
          "id, stars, comment, created_at, profiles!ratings_reviewer_id_fkey(display_name)"
        )
        .eq("reviewed_id", id)
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

  if (!profile) notFound();

  const listings: Listing[] = ((listingData ?? []) as ListingRow[]).flatMap((row) => {
    const product = firstRelated(row.products);
    const card = firstRelated(product?.cards ?? null);

    if (!card) return [];

    return [
      {
        cardMeta: `${card.set_name} | ${card.rarity ?? "Rareza no informada"} | #${card.number ?? "N/D"}`,
        description:
          row.description ??
          (row.type === "trade" ? `Busca: ${row.trade_wants ?? "propuestas"}` : ""),
        id: row.id,
        image: card.image_large,
        location:
          [row.location_city, row.location_country].filter(Boolean).join(", ") ||
          "Ubicación no informada",
        price: priceLabel(row.type, row.price),
        seller: profile.display_name,
        sellerId: profile.id,
        sellerRating: Number(profile.reputation_average).toFixed(1),
        status: "Activa",
        title: card.official_name,
        type: typeLabel(row.type),
        verified: profile.is_verified
      }
    ];
  });
  const ratings = (ratingData ?? []) as RatingRow[];
  const location =
    [profile.city, profile.country].filter(Boolean).join(", ") ||
    "Ubicación no informada";
  const joinedLabel = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric"
  }).format(new Date(profile.joined_at));
  const averageRating = Number(profile.reputation_average).toFixed(1);

  return (
    <main className="min-h-screen bg-[#071535] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">
                POKETRADE
              </p>
              <p className="text-xs font-bold text-blue-100">PERFIL PÚBLICO</p>
            </div>
          </Link>
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 transition hover:text-yellow-300"
            href="/marketplace"
          >
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_82%_0%,rgba(250,204,21,.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-yellow-300 bg-blue-950 text-3xl font-black text-yellow-300">
            {profile.display_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-4xl font-black text-white">{profile.display_name}</h1>
              {profile.is_verified ? (
                <BadgeCheck className="h-6 w-6 text-yellow-300" aria-label="Perfil verificado" />
              ) : null}
            </div>
            <p className="mt-3 flex items-center gap-2 text-blue-100">
              <MapPin className="h-4 w-4 text-yellow-300" />
              {location}
            </p>
            {profile.bio ? (
              <p className="mt-4 max-w-2xl leading-7 text-blue-100">{profile.bio}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <Stat
              icon={Star}
              label={`${profile.reputation_count} valoraciones`}
              value={averageRating}
            />
            <Stat
              icon={Store}
              label="Publicaciones activas"
              value={String(listings.length)}
            />
          </div>
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-3 border-t border-white/10 px-4 py-4 text-sm font-bold text-blue-100 sm:grid-cols-3 sm:px-6">
          <p className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-yellow-300" />
            Miembro desde {joinedLabel}
          </p>
          <p className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            Promedio {averageRating} de 5
          </p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-yellow-300" />
            {profile.reputation_count} operación{profile.reputation_count === 1 ? "" : "es"} valorada{profile.reputation_count === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-300">
              Marketplace
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">Publicaciones activas</h2>
          </div>
          <span className="hidden items-center gap-2 text-sm font-semibold text-blue-100 sm:flex">
            <CalendarDays className="h-4 w-4 text-yellow-300" />
            Miembro desde {joinedLabel}
          </span>
        </div>
        {listings.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-white/15 bg-white/[0.05] p-10 text-center text-blue-100">
            Este vendedor no tiene publicaciones activas.
          </div>
        )}

        <div className="mt-12">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-yellow-300" />
            <h2 className="text-3xl font-black text-white">Valoraciones verificadas</h2>
          </div>
          {ratings.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {ratings.map((rating) => {
                const reviewer = firstRelated(rating.profiles);

                return (
                  <article
                    className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_45px_rgba(0,0,0,.18)]"
                    key={rating.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-white">
                        {reviewer?.display_name ?? "Entrenador TCG"}
                      </p>
                      <span className="flex items-center gap-1 font-black text-amber-300">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {rating.stars}
                      </span>
                    </div>
                    {rating.comment ? (
                      <p className="mt-3 leading-6 text-blue-100">{rating.comment}</p>
                    ) : (
                      <p className="mt-3 text-sm italic text-blue-200">Sin comentario.</p>
                    )}
                    <p className="mt-3 text-xs font-semibold text-blue-200">
                      {new Intl.DateTimeFormat("es-AR", {
                        dateStyle: "medium"
                      }).format(new Date(rating.created_at))}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.05] p-8 text-center text-blue-100">
              Todavía no recibió valoraciones.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-[0_14px_35px_rgba(0,0,0,.18)]">
      <Icon className="h-5 w-5 text-yellow-300" />
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-bold text-blue-100">{label}</p>
    </div>
  );
}
