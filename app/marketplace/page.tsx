import { ArrowLeft, Search, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { MarketplaceFilters } from "@/components/marketplace-filters";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type Related<T> = T | T[] | null;

type MarketplacePageProps = {
  searchParams: Promise<{
    condition?: string;
    location?: string;
    q?: string;
    sort?: string;
    type?: string;
  }>;
};

type ListingRow = {
  description: string | null;
  id: string;
  location_city: string | null;
  location_country: string | null;
  price: number | null;
  profiles: Related<{
    display_name: string;
    id: string;
    is_verified: boolean;
    reputation_average: number;
  }>;
  products: Related<{
    condition: string;
    cards: Related<{
      image_large: string;
      number: string | null;
      official_name: string;
      rarity: string | null;
      set_name: string;
    }>;
  }>;
  status: string;
  trade_wants: string | null;
  type: string;
};

function firstRelated<T>(value: Related<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function typeLabel(type: string) {
  return {
    free: "Gratis",
    sale: "Venta",
    trade: "Intercambio"
  }[type] ?? type;
}

function priceLabel(row: ListingRow) {
  if (row.type === "trade") return "Intercambio";
  if (row.type === "free") return "Gratis";

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(row.price ?? 0);
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const type = ["sale", "trade", "free"].includes(params.type ?? "") ? params.type! : "";
  const condition = params.condition?.trim() ?? "";
  const location = params.location?.trim() ?? "";
  const sort = ["recent", "price_asc", "price_desc", "seller_rating"].includes(
    params.sort ?? ""
  )
    ? params.sort!
    : "recent";
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  let rows: ListingRow[] = [];

  if (hasSupabaseConfig) {
    const supabase = await createSupabaseServerClient();
    let request = supabase
      .from("listings")
      .select(
        "id, description, type, status, price, trade_wants, location_city, location_country, profiles!listings_seller_id_fkey(id, display_name, is_verified, reputation_average), products!inner(condition, cards!inner(official_name, image_large, set_name, rarity, number))"
      )
      .eq("moderation_status", "approved")
      .eq("status", "active")
      .order("approved_at", { ascending: false })
      .limit(48);

    if (query) request = request.ilike("products.cards.official_name", `%${query}%`);
    if (type) request = request.eq("type", type);
    if (condition) request = request.eq("products.condition", condition);
    if (location) {
      request = request.or(
        `location_city.ilike.%${location}%,location_country.ilike.%${location}%`
      );
    }

    const result = await request;
    rows = (result.data ?? []) as ListingRow[];
  }

  rows = rows.sort((left, right) => {
    if (sort === "price_asc") {
      const leftPrice =
        left.type === "sale" ? left.price ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const rightPrice =
        right.type === "sale" ? right.price ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      return leftPrice - rightPrice;
    }

    if (sort === "price_desc") {
      const leftPrice = left.type === "sale" ? left.price ?? 0 : 0;
      const rightPrice = right.type === "sale" ? right.price ?? 0 : 0;
      return rightPrice - leftPrice;
    }

    if (sort === "seller_rating") {
      const leftProfile = firstRelated(left.profiles);
      const rightProfile = firstRelated(right.profiles);
      return (
        Number(rightProfile?.reputation_average ?? 0) -
        Number(leftProfile?.reputation_average ?? 0)
      );
    }

    return 0;
  });

  const listings: Listing[] = rows.flatMap((row) => {
    const product = firstRelated(row.products);
    const card = firstRelated(product?.cards ?? null);
    const profile = firstRelated(row.profiles);

    if (!card) return [];

    return [{
      cardMeta: `${card.set_name} | ${card.rarity ?? "Rareza no informada"} | #${card.number ?? "N/D"}`,
      description:
        row.description ??
        (row.type === "trade" ? `Busca: ${row.trade_wants ?? "propuestas"}` : ""),
      id: row.id,
      image: card.image_large,
      location:
        [row.location_city, row.location_country].filter(Boolean).join(", ") ||
        "Ubicacion no informada",
      price: priceLabel(row),
      seller: profile?.display_name ?? "Entrenador TCG",
      sellerId: profile?.id,
      sellerRating: Number(profile?.reputation_average ?? 0).toFixed(1),
      status: "Activa",
      title: card.official_name,
      type: typeLabel(row.type),
      verified: profile?.is_verified ?? false
    }];
  });

  const hasFilters = Boolean(query || type || condition || location);

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MARKETPLACE</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              aria-label="Mis publicaciones"
              className="grid h-11 w-11 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
              href="/account/listings"
              title="Mis publicaciones"
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <ButtonLink href="/publish" icon={Store}>
              Publicar
            </ButtonLink>
          </div>
        </nav>
      </header>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase text-red-500">Catalogo de la comunidad</p>
              <h1 className="mt-2 text-4xl font-black text-blue-950">Explorar cartas</h1>
              <p className="mt-2 text-slate-600">
                Publicaciones aprobadas de venta, intercambio y regalo.
              </p>
            </div>
            <p className="font-black text-blue-900">
              {listings.length} {listings.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>
          <MarketplaceFilters
            condition={condition}
            location={location}
            query={query}
            sort={sort}
            type={type}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {listings.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 text-center">
            <div>
              <Search className="mx-auto h-10 w-10 text-blue-500" />
              <h2 className="mt-4 text-xl font-black text-blue-950">
                {hasFilters ? "No encontramos coincidencias" : "Todavia no hay publicaciones"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                {hasFilters
                  ? "Prueba con menos filtros o busca otra carta."
                  : "Las cartas aprobadas apareceran aqui."}
              </p>
              {hasFilters ? (
                <Link
                  className="mt-5 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-black text-white"
                  href="/marketplace"
                >
                  Limpiar filtros
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
