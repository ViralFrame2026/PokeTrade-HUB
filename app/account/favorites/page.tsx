import { ArrowLeft, Heart, Store } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type Related<T> = T | T[] | null;

type FavoriteRow = {
  listings: Related<{
    description: string | null;
    id: string;
    location_city: string | null;
    location_country: string | null;
    price: number | null;
    status: string;
    trade_wants: string | null;
    type: string;
    profiles: Related<{
      display_name: string;
      id: string;
      is_verified: boolean;
      reputation_average: number;
    }>;
    products: Related<{
      cards: Related<{
        image_large: string;
        number: string | null;
        official_name: string;
        rarity: string | null;
        set_name: string;
      }>;
    }>;
  }>;
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

export default async function FavoritesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/favorites");

  const { data } = await supabase
    .from("favorites")
    .select(
      "listings!favorites_listing_id_fkey(id, description, type, status, price, trade_wants, location_city, location_country, profiles!listings_seller_id_fkey(id, display_name, is_verified, reputation_average), products!listings_product_id_fkey(cards!products_card_id_fkey(official_name, image_large, set_name, rarity, number)))"
    )
    .eq("user_id", user.id)
    .not("listing_id", "is", null)
    .order("created_at", { ascending: false });

  const listings: Listing[] = ((data ?? []) as FavoriteRow[]).flatMap((favorite) => {
    const listing = firstRelated(favorite.listings);
    const product = firstRelated(listing?.products ?? null);
    const card = firstRelated(product?.cards ?? null);
    const seller = firstRelated(listing?.profiles ?? null);

    if (!listing || listing.status !== "active" || !card) return [];

    return [{
      cardMeta: `${card.set_name} | ${card.rarity ?? "Rareza no informada"} | #${card.number ?? "N/D"}`,
      description:
        listing.description ??
        (listing.type === "trade" ? `Busca: ${listing.trade_wants ?? "propuestas"}` : ""),
      id: listing.id,
      image: card.image_large,
      location:
        [listing.location_city, listing.location_country].filter(Boolean).join(", ") ||
        "Ubicacion no informada",
      price: priceLabel(listing.type, listing.price),
      seller: seller?.display_name ?? "Entrenador TCG",
      sellerId: seller?.id,
      sellerRating: Number(seller?.reputation_average ?? 0).toFixed(1),
      status: "Activa",
      title: card.official_name,
      type: typeLabel(listing.type),
      verified: seller?.is_verified ?? false
    }];
  });

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MIS FAVORITOS</p>
            </div>
          </Link>
          <ButtonLink href="/marketplace" icon={Store} variant="light">
            Explorar
          </ButtonLink>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <h1 className="mt-5 text-4xl font-black text-blue-950">Mis favoritos</h1>
        <p className="mt-2 text-slate-600">Cartas guardadas para revisar mas tarde.</p>

        {listings.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid min-h-72 place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 text-center">
            <div>
              <Heart className="mx-auto h-10 w-10 text-red-400" />
              <h2 className="mt-4 text-xl font-black text-blue-950">
                Todavia no guardaste publicaciones
              </h2>
              <p className="mt-2 text-slate-600">
                Usa el boton de favoritos en una carta que te interese.
              </p>
              <div className="mt-5">
                <ButtonLink href="/marketplace" icon={Store}>
                  Explorar cartas
                </ButtonLink>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
