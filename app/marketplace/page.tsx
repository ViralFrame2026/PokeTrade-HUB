import { ArrowLeft, Search, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { MarketplaceFilters } from "@/components/marketplace-filters";
import { SiteMenu } from "@/components/site-menu";
import { ButtonLink } from "@/components/ui/button-link";
import {
  firstListingPhotoPath,
  firstRelated,
  productImage,
  productMeta,
  productTitle
} from "@/lib/product-display";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: {
    canonical: "/marketplace"
  },
  description:
    "Explora cartas Pokemon TCG en venta, intercambio o regalo dentro de PokeTrade HUB, con publicaciones moderadas y perfiles con reputacion.",
  openGraph: {
    description:
      "Cartas Pokemon TCG oficiales para comprar, vender e intercambiar en una comunidad moderada.",
    images: [
      {
        alt: "Marketplace PokeTrade HUB de cartas Pokemon TCG",
        height: 720,
        url: "/assets/pokemon-card-banner.webp",
        width: 1880
      }
    ],
    title: "Marketplace Pokemon TCG",
    type: "website",
    url: "/marketplace"
  },
  title: "Marketplace Pokemon TCG",
  twitter: {
    card: "summary_large_image",
    description:
      "Cartas Pokemon TCG oficiales para comprar, vender e intercambiar en una comunidad moderada.",
    images: ["/assets/pokemon-card-banner.webp"],
    title: "Marketplace Pokemon TCG"
  }
};

type Related<T> = T | T[] | null;

type MarketplacePageProps = {
  searchParams: Promise<{
    category?: string;
    condition?: string;
    location?: string;
    maxPrice?: string;
    minPrice?: string;
    q?: string;
    rarity?: string;
    sort?: string;
    set?: string;
    type?: string;
  }>;
};

type ListingRow = {
  description: string | null;
  id: string;
  listing_images: Array<{
    sort_order: number;
    storage_path: string;
  }>;
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
    accessory_type: string | null;
    category: string | null;
    condition: string;
    sealed_type: string | null;
    title: string | null;
    cards: Related<{
      image_large: string;
      number: string | null;
      official_name: string;
      rarity: string | null;
      set_name: string;
    }>;
  }>;
  status: string;
  title: string;
  trade_wants: string | null;
  type: string;
};

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
  const category = ["card", "sealed", "accessory"].includes(params.category ?? "")
    ? params.category!
    : "";
  const type = ["sale", "trade", "free"].includes(params.type ?? "") ? params.type! : "";
  const condition = params.condition?.trim() ?? "";
  const location = params.location?.trim() ?? "";
  const set = params.set?.trim() ?? "";
  const rarity = params.rarity?.trim() ?? "";
  const minPrice = Number(params.minPrice ?? "");
  const maxPrice = Number(params.maxPrice ?? "");
  const hasMinPrice = Number.isFinite(minPrice) && minPrice > 0;
  const hasMaxPrice = Number.isFinite(maxPrice) && maxPrice > 0;
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
        "id, title, description, type, status, price, trade_wants, location_city, location_country, listing_images(storage_path, sort_order), profiles!listings_seller_id_fkey(id, display_name, is_verified, reputation_average), products!listings_product_id_fkey(category, title, condition, sealed_type, accessory_type, cards!products_card_id_fkey(official_name, image_large, set_name, rarity, number))"
      )
      .eq("moderation_status", "approved")
      .eq("status", "active")
      .order("approved_at", { ascending: false })
      .limit(96);

    if (type) request = request.eq("type", type);
    if (condition) request = request.eq("products.condition", condition);
    if (hasMinPrice) request = request.gte("price", minPrice);
    if (hasMaxPrice) request = request.lte("price", maxPrice);
    if (location) {
      request = request.or(
        `location_city.ilike.%${location}%,location_country.ilike.%${location}%`
      );
    }

    const result = await request;
    rows = (result.data ?? []) as ListingRow[];
  }

  if (query || category || set || rarity) {
    const normalizedQuery = query.toLowerCase();
    const normalizedSet = set.toLowerCase();

    rows = rows.filter((row) => {
      const product = firstRelated(row.products);
      const card = firstRelated(product?.cards ?? null);
      const matchesCategory = !category || product?.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [row.title, product?.title, card?.official_name, product?.sealed_type, product?.accessory_type]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      const matchesSet = !normalizedSet || card?.set_name.toLowerCase().includes(normalizedSet);
      const matchesRarity = !rarity || card?.rarity === rarity;

      return matchesCategory && matchesQuery && matchesSet && matchesRarity;
    });
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
    const profile = firstRelated(row.profiles);
    const photoPath = firstListingPhotoPath(row.listing_images);
    const photoUrl = photoPath
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${photoPath}`
      : null;

    if (!product) return [];

    return [{
      cardMeta: productMeta(product),
      description:
        row.description ??
        (row.type === "trade" ? `Busca: ${row.trade_wants ?? "propuestas"}` : ""),
      id: row.id,
      image: photoUrl ?? productImage(product),
      location:
        [row.location_city, row.location_country].filter(Boolean).join(", ") ||
        "Ubicación no informada",
      price: priceLabel(row),
      seller: profile?.display_name ?? "Entrenador TCG",
      sellerId: profile?.id,
      sellerRating: Number(profile?.reputation_average ?? 0).toFixed(1),
      status: "Activa",
      title: productTitle(product, row.title),
      type: typeLabel(row.type),
      verified: profile?.is_verified ?? false
    }];
  });

  const hasFilters = Boolean(
    query || category || type || condition || location || set || rarity || hasMinPrice || hasMaxPrice
  );
  const displayListings = listings;

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu />
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.2em] text-yellow-300">
                  POKETRADE
                </p>
                <p className="truncate text-xs font-bold text-blue-100">MARKETPLACE</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              aria-label="Mis publicaciones"
              className="hidden h-11 items-center justify-center gap-2 rounded-lg border border-blue-300 px-3 text-sm font-bold text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300 sm:inline-flex"
              href="/account/listings"
              title="Mis publicaciones"
            >
              <UserRound className="h-4 w-4" />
              Mis publicaciones
            </Link>
            <ButtonLink href="/publish" icon={Store} size="sm">
              Publicar
            </ButtonLink>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(37,99,235,0.32),transparent_32rem),linear-gradient(180deg,#172554,#0f172a)]">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase text-red-500">Catálogo de la comunidad</p>
              <h1 className="mt-2 text-4xl font-black text-white">Explorar marketplace</h1>
              <p className="mt-2 text-blue-100">
                Publicaciones aprobadas de venta, intercambio y regalo.
              </p>
            </div>
            <p className="rounded-full border border-white/10 bg-white/10 px-4 py-2 font-black text-blue-50">
              {listings.length} {listings.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>
          <MarketplaceFilters
            category={category}
            condition={condition}
            location={location}
            maxPrice={hasMaxPrice ? String(maxPrice) : ""}
            minPrice={hasMinPrice ? String(minPrice) : ""}
            query={query}
            rarity={rarity}
            sort={sort}
            set={set}
            type={type}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {listings.length === 0 ? (
          <div className="mb-6 rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-5">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-200">
              {hasFilters ? "Sin coincidencias reales" : "Marketplace listo"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {hasFilters ? "Probá con menos filtros" : "Todavía no hay publicaciones aprobadas"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {hasFilters
                ? "No hay publicaciones reales que coincidan con esos filtros. Proba limpiar alguno para ampliar la busqueda."
                : "Cuando el equipo apruebe las primeras cartas reales de la comunidad, apareceran aca."}
            </p>
          </div>
        ) : null}
        {displayListings.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 text-center">
            <div>
              <Search className="mx-auto h-10 w-10 text-blue-500" />
              <h2 className="mt-4 text-xl font-black text-blue-950">
                {hasFilters ? "No encontramos coincidencias" : "Todavía no hay publicaciones"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                {hasFilters
                  ? "Prueba con menos filtros o busca otra carta."
                  : "Las cartas aprobadas aparecerán aquí."}
              </p>
              {hasFilters ? (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link
                    className="inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-black text-white"
                    href="/marketplace"
                  >
                    Limpiar filtros
                  </Link>
                  <Link
                    className="inline-flex rounded-lg border border-blue-200 px-5 py-3 text-sm font-black text-blue-800"
                    href="/publish"
                  >
                    Publicar carta
                  </Link>
                </div>
              ) : (
                <Link
                  className="mt-5 inline-flex rounded-lg bg-yellow-400 px-5 py-3 text-sm font-black text-blue-950"
                  href="/publish"
                >
                  Publicar primera carta
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
