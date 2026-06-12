import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Instagram,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Store,
  Tag
} from "lucide-react";
import { ListingGallery } from "@/components/listing-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { ReportListingForm } from "@/components/report-listing-form";
import { StartConversationButton } from "@/components/start-conversation-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Related<T> = T | T[] | null;

type ListingDetailRow = {
  approved_at: string | null;
  created_at: string;
  description: string | null;
  id: string;
  seller_id: string;
  listing_images: Array<{
    alt_text: string | null;
    sort_order: number;
    storage_path: string;
  }>;
  location_city: string | null;
  location_country: string | null;
  price: number | null;
  profiles: Related<{
    display_name: string;
    instagram: string | null;
    is_verified: boolean;
    reputation_average: number;
    reputation_count: number;
    whatsapp: string | null;
  }>;
  products: Related<{
    condition: string;
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

function priceLabel(listing: ListingDetailRow) {
  if (listing.type === "trade") return "Intercambio";
  if (listing.type === "free") return "Gratis";

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(listing.price ?? 0);
}

function whatsappUrl(value: string) {
  const number = value.replace(/\D/g, "");
  return number ? `https://wa.me/${number}` : null;
}

function instagramUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://instagram.com/${value.replace(/^@/, "")}`;
}

async function getListing(id: string) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, seller_id, title, description, type, status, price, trade_wants, location_city, location_country, approved_at, created_at, listing_images(storage_path, alt_text, sort_order), profiles!listings_seller_id_fkey(display_name, is_verified, reputation_average, reputation_count, whatsapp, instagram), products!listings_product_id_fkey(condition, cards!products_card_id_fkey(pokemon_tcg_id, official_name, image_large, set_name, rarity, number))"
    )
    .eq("id", id)
    .eq("moderation_status", "approved")
    .maybeSingle();

  return data as ListingDetailRow | null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  const product = firstRelated(listing?.products ?? null);
  const card = firstRelated(product?.cards ?? null);

  if (!listing || !card) {
    return { title: "Publicación no encontrada" };
  }

  return {
    description: listing.description ?? `${card.official_name} en PokeTrade HUB`,
    openGraph: {
      images: [card.image_large]
    },
    title: card.official_name
  };
}

export default async function ListingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) notFound();

  const product = firstRelated(listing.products);
  const card = firstRelated(product?.cards ?? null);
  const seller = firstRelated(listing.profiles);

  if (!product || !card || !seller) notFound();

  const location =
    [listing.location_city, listing.location_country].filter(Boolean).join(", ") ||
    "Ubicación no informada";
  const publishedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long"
  }).format(new Date(listing.approved_at ?? listing.created_at));
  const whatsapp = seller.whatsapp ? whatsappUrl(seller.whatsapp) : null;
  const instagram = seller.instagram ? instagramUrl(seller.instagram) : null;
  const contactUrl =
    whatsapp ?? instagram ?? `/login?next=${encodeURIComponent(`/listings/${listing.id}`)}`;
  const contactLabel = whatsapp
    ? "Contactar por WhatsApp"
    : instagram
      ? "Contactar por Instagram"
      : "Iniciar sesión para contactar";
  const ContactIcon = whatsapp ? MessageCircle : instagram ? Instagram : MessageCircle;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: favorite } = user
    ? await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
        .maybeSingle()
    : { data: null };
  const realPhotos = [...(listing.listing_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image, index) => ({
      alt: image.alt_text ?? `Foto real ${index + 1} de ${card.official_name}`,
      src: supabase.storage.from("listing-images").getPublicUrl(image.storage_path).data
        .publicUrl,
      type: "real" as const
    }));
  const galleryImages = [
    ...realPhotos,
    {
      alt: `Imagen oficial de ${card.official_name}`,
      src: card.image_large,
      type: "official" as const
    }
  ];

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-11 w-11 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.24em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">HUB TCG</p>
            </div>
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-2 text-sm font-bold transition hover:border-yellow-300 hover:text-yellow-300"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </Link>
        </nav>
      </header>

      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-slate-500">
            Marketplace / {card.set_name} /{" "}
            <span className="text-blue-800">{card.official_name}</span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:px-8">
        <section>
          <ListingGallery images={galleryImages} />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InfoItem label="Set" value={card.set_name} />
            <InfoItem label="Rareza" value={card.rarity ?? "No informada"} />
            <InfoItem label="Número" value={card.number ?? "No informado"} />
          </div>
        </section>

        <aside className="min-w-0">
          <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-[0_18px_48px_rgba(30,64,175,0.12)] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-black uppercase text-white">
                {typeLabel(listing.type)}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700">
                Disponible
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight text-blue-950 sm:text-4xl">
              {card.official_name}
            </h1>
            <p className="mt-2 font-semibold text-slate-500">
              ID oficial: {card.pokemon_tcg_id}
            </p>
            <p className="mt-6 text-3xl font-black text-red-500">{priceLabel(listing)}</p>

            <dl className="mt-7 grid gap-4 border-y border-blue-100 py-6 sm:grid-cols-2">
              <Detail icon={Tag} label="Estado" value={product.condition} />
              <Detail icon={MapPin} label="Ubicación" value={location} />
              <Detail icon={CalendarDays} label="Publicada" value={publishedAt} />
              <Detail icon={ShieldCheck} label="Moderación" value="Aprobada" />
            </dl>

            <div className="mt-6">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-blue-800">
                Descripción
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                {listing.description || "El vendedor no agregó una descripción."}
              </p>
            </div>

            {listing.type === "trade" && listing.trade_wants ? (
              <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                  Busca a cambio
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{listing.trade_wants}</p>
              </div>
            ) : null}

            {user?.id !== listing.seller_id ? (
              <>
                <StartConversationButton
                  isAuthenticated={Boolean(user)}
                  listingId={listing.id}
                  sellerId={listing.seller_id}
                />
                <a
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50"
                  href={contactUrl}
                  rel={whatsapp || instagram ? "noreferrer" : undefined}
                  target={whatsapp || instagram ? "_blank" : undefined}
                >
                  <ContactIcon className="h-5 w-5" />
                  {contactLabel}
                </a>
              </>
            ) : null}
            <FavoriteButton
              initialFavorite={Boolean(favorite)}
              isAuthenticated={Boolean(user)}
              listingId={listing.id}
            />
            <ReportListingForm
              isAuthenticated={Boolean(user)}
              listingId={listing.id}
            />
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              Confirma identidad, estado y condiciones antes de realizar cualquier operación.
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-950 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-lg font-black text-yellow-300">
                {seller.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-black">{seller.display_name}</h2>
                  {seller.is_verified ? (
                    <BadgeCheck className="h-5 w-5 text-sky-300" aria-label="Vendedor verificado" />
                  ) : null}
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-blue-100">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {Number(seller.reputation_average).toFixed(1)} ·{" "}
                  {seller.reputation_count} valoraciones
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-blue-200">
                  <Store className="h-4 w-4" />
                  Vendedor de la comunidad PokeTrade
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-4">
      <dt className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</dt>
      <dd className="mt-2 font-bold text-blue-950">{value}</dd>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
      <div>
        <dt className="text-xs font-black uppercase text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm font-bold text-slate-700">{value}</dd>
      </div>
    </div>
  );
}
