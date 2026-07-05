import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Instagram,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Store,
  Tag
} from "lucide-react";
import { ListingGallery } from "@/components/listing-gallery";
import { ListingRatingForm } from "@/components/listing-rating-form";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ReportListingForm } from "@/components/report-listing-form";
import { ShareListingButton } from "@/components/share-listing-button";
import { StartConversationButton } from "@/components/start-conversation-button";
import {
  firstRelated,
  isCardProduct,
  productCategoryLabel,
  productImage,
  productMeta,
  productTypeDetail,
  productTitle
} from "@/lib/product-display";
import { siteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Related<T> = T | T[] | null;

type ListingDetailRow = {
  approved_at: string | null;
  created_at: string;
  completed_with_id: string | null;
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
    city: string | null;
    country: string | null;
    display_name: string;
    id: string;
    instagram: string | null;
    is_verified: boolean;
    joined_at: string;
    reputation_average: number;
    reputation_count: number;
    whatsapp: string | null;
  }>;
  products: Related<{
    accessory_type: string | null;
    category: string | null;
    condition: string;
    language: string | null;
    sealed_type: string | null;
    title: string | null;
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

type RatingRow = {
  comment: string | null;
  created_at: string;
  id: string;
  profiles: Related<{
    display_name: string;
  }>;
  stars: number;
};

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

function statusLabel(status: string) {
  return {
    active: "Disponible",
    finished: "Finalizada",
    reserved: "Reservada",
    sold: "Vendida",
    traded: "Intercambiada"
  }[status] ?? status;
}

function whatsappUrl(value: string) {
  const number = value.replace(/\D/g, "");
  return number ? `https://wa.me/${number}` : null;
}

function instagramUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://instagram.com/${value.replace(/^@/, "")}`;
}

function listingLocation(listing: ListingDetailRow) {
  return (
    [listing.location_city, listing.location_country].filter(Boolean).join(", ") ||
    "Ubicacion no informada"
  );
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
      "id, seller_id, completed_with_id, title, description, type, status, price, trade_wants, location_city, location_country, approved_at, created_at, listing_images(storage_path, alt_text, sort_order), profiles!listings_seller_id_fkey(id, display_name, city, country, is_verified, joined_at, reputation_average, reputation_count, whatsapp, instagram), products!listings_product_id_fkey(category, title, condition, language, sealed_type, accessory_type, cards!products_card_id_fkey(pokemon_tcg_id, official_name, image_large, set_name, rarity, number))"
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

  if (!listing || !product) {
    return {
      robots: { follow: false, index: false },
      title: "Publicación no encontrada"
    };
  }

  const seller = firstRelated(listing.profiles);
  const displayTitle = productTitle(product, listing.title);
  const displayImage = productImage(product);
  const title = `${displayTitle} ${priceLabel(listing)} - ${typeLabel(listing.type)}`;
  const description =
    listing.description?.slice(0, 150) ||
    `${displayTitle}, publicado por ${seller?.display_name ?? "Entrenador TCG"} en ${listingLocation(listing)}.`;
  const canonical = `/listings/${listing.id}`;

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: `${displayTitle} en NexoTCG`,
          url: displayImage
        }
      ],
      title,
      type: "article",
      url: canonical
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [displayImage],
      title
    }
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

  if (!product || !seller) notFound();

  const displayTitle = productTitle(product, listing.title);
  const displayImage = productImage(product);
  const displayMeta = productMeta(product);
  const cardProduct = isCardProduct(product);
  const location = listingLocation(listing);
  const publishedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long"
  }).format(new Date(listing.approved_at ?? listing.created_at));
  const whatsapp = seller.whatsapp ? whatsappUrl(seller.whatsapp) : null;
  const instagram = seller.instagram ? instagramUrl(seller.instagram) : null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: currentProfile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    : { data: null };
  const directContactUrl = user ? whatsapp ?? instagram : null;
  const loginContactUrl = `/login?next=${encodeURIComponent(`/listings/${listing.id}`)}`;
  const contactUrl = directContactUrl ?? loginContactUrl;
  const contactLabel = !user
    ? "Iniciar sesión para ver contacto"
    : whatsapp
      ? "Contactar por WhatsApp"
      : "Contactar por Instagram";
  const ContactIcon = user && instagram && !whatsapp ? Instagram : MessageCircle;
  const isCompleted = ["sold", "traded", "finished"].includes(listing.status);
  const isAvailable = listing.status === "active";
  const isListingOwner = user?.id === listing.seller_id;
  const canDeleteListing = Boolean(isListingOwner || currentProfile?.is_admin);
  const [favoriteResult, ratingResult, existingReportResult, reviewsResult, sellerOpsResult] =
    await Promise.all([
      user
        ? supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("listing_id", listing.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user && user.id !== listing.seller_id
        ? supabase
            .from("ratings")
            .select("id")
            .eq("reviewer_id", user.id)
            .eq("listing_id", listing.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user && user.id !== listing.seller_id
        ? supabase
            .from("reports")
            .select("id")
            .eq("reporter_id", user.id)
            .eq("listing_id", listing.id)
            .is("resolved_at", null)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("ratings")
        .select(
          "id, stars, comment, created_at, profiles!ratings_reviewer_id_fkey(display_name)"
        )
        .eq("reviewed_id", listing.seller_id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", listing.seller_id)
        .eq("moderation_status", "approved")
        .in("status", ["sold", "traded", "finished"])
    ]);
  const favorite = favoriteResult.data;
  const existingRating = ratingResult.data;
  const existingReport = existingReportResult.data;
  const reviews = (reviewsResult.data ?? []) as RatingRow[];
  const canRate =
    Boolean(user) &&
    user?.id === listing.completed_with_id &&
    isCompleted &&
    !existingRating;
  const realPhotos = [...(listing.listing_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image, index) => ({
      alt: image.alt_text ?? `Foto real ${index + 1} de ${displayTitle}`,
      src: supabase.storage.from("listing-images").getPublicUrl(image.storage_path).data
        .publicUrl,
      type: "real" as const
    }));
  const galleryImages = [
    ...realPhotos,
    {
      alt: cardProduct ? `Imagen oficial de ${displayTitle}` : `Imagen de referencia de ${displayTitle}`,
      src: displayImage,
      type: "official" as const
    }
  ];
  const hasRealPhotos = realPhotos.length > 0;
  const sellerOperations = sellerOpsResult.count ?? 0;
  const sellerJoined = new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "numeric"
  }).format(new Date(seller.joined_at));
  const sellerLocation =
    [seller.city, seller.country].filter(Boolean).join(", ") || "Ubicación no informada";

  const sellerAgeDays = Math.floor(
    (Date.now() - new Date(seller.joined_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const riskSignals = [
    !hasRealPhotos
      ? cardProduct
        ? "Pedile fotos reales de frente, dorso, esquinas y detalle de superficie."
        : "Este producto deberia tener fotos reales claras antes de cerrar cualquier acuerdo."
      : null,
    seller.reputation_count === 0
      ? "Este vendedor todavia no tiene valoraciones: avanza con mas verificacion."
      : null,
    sellerOperations === 0
      ? "No registra operaciones cerradas en NexoTCG por ahora."
      : null,
    sellerAgeDays < 14
      ? "La cuenta es reciente: confirma identidad y evita pagos apresurados."
      : null,
    listing.type === "sale" && Number(listing.price ?? 0) >= 100000
      ? "Monto alto: usa entrega segura, comprobantes y confirmacion por mensaje."
      : null
  ].filter(Boolean) as string[];
  const visualReviewTitle = cardProduct
    ? "Revision visual recomendada"
    : "Revision del producto recomendada";
  const visualReviewItems = cardProduct
    ? [
        "Compara la carta real con la imagen oficial.",
        "Pedi fotos de frente, dorso y esquinas.",
        "Confirma estado, precio y forma de entrega.",
        "Mantene el acuerdo registrado por mensaje."
      ]
    : product.category === "sealed"
      ? [
          "Revisa sellos, envoltorio, golpes y posibles aperturas.",
          "Pedi fotos reales de todos los lados del empaque.",
          "Confirma idioma, expansion, contenido y precio.",
          "Mantene entrega, pago y condiciones por mensaje."
        ]
      : [
          "Revisa desgaste, medidas, capacidad y compatibilidad.",
          "Pedi fotos reales de frente, reverso e interior si aplica.",
          "Confirma estado, piezas incluidas y forma de entrega.",
          "Mantene el acuerdo registrado por mensaje."
        ];
  const verificationTitle = cardProduct
    ? "Carta verificada"
    : product.category === "sealed"
      ? "Sellado revisado"
      : "Accesorio revisado";
  const verificationCopy = cardProduct
    ? "La carta esta vinculada al catalogo oficial de Pokemon TCG y fue aprobada por moderacion."
    : "El producto fue revisado por moderacion usando fotos reales, descripcion, tipo y coherencia comercial.";
  const photoStatusTitle = hasRealPhotos
    ? "Incluye fotos reales"
    : cardProduct
      ? "Solo imagen oficial"
      : "Faltan fotos reales";
  const photoStatusCopy = hasRealPhotos
    ? cardProduct
      ? "Revisa las fotos subidas por el vendedor ademas de la imagen oficial."
      : "Revisa las fotos subidas por el vendedor antes de avanzar con la operacion."
    : cardProduct
      ? "Pedi fotos reales al vendedor antes de cerrar una operacion importante."
      : "No cierres la operacion sin fotos reales claras del producto.";
  const galleryReferenceBadge = cardProduct ? "Imagen oficial" : "Referencia";
  const galleryReferenceCount = cardProduct
    ? "imagen oficial de referencia"
    : "imagen de referencia del producto";
  const galleryInspectionCopy = cardProduct
    ? "bordes, esquinas, brillo y reverso antes de operar"
    : "sellos, empaque, desgaste, piezas incluidas y estado real";
  const listingUrl = siteUrl(`/listings/${listing.id}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: {
      "@type": "Brand",
      name: "Pokemon TCG"
    },
    category: productCategoryLabel(product.category),
    description:
      listing.description ||
      displayMeta,
    image: galleryImages.map((image) => image.src),
    name: displayTitle,
    offers:
      listing.type === "sale"
        ? {
            "@type": "Offer",
            availability: isAvailable
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            price: Number(listing.price ?? 0),
            priceCurrency: "ARS",
            seller: {
              "@type": "Person",
              name: seller.display_name
            },
            url: listingUrl
          }
        : undefined,
    sku: card?.pokemon_tcg_id,
    url: listingUrl
  };

  return (
    <main className="min-h-screen bg-[#071535] text-slate-900">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-11 w-11 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.24em] text-yellow-300">NexoTCG</p>
              <p className="text-xs font-bold text-blue-100">Marketplace TCG</p>
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

      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#123cba,#071535)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-100">
            Marketplace / {productCategoryLabel(product.category)} /{" "}
            <span className="text-yellow-300">{displayTitle}</span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:px-8">
        <section>
          <ListingGallery
            images={galleryImages}
            inspectionCopy={galleryInspectionCopy}
            referenceBadgeLabel={galleryReferenceBadge}
            referenceCountLabel={galleryReferenceCount}
          />

          <div className="mt-5 rounded-lg border border-yellow-300/30 bg-yellow-400/10 p-5 text-blue-100">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-yellow-300">
              <ShieldCheck className="h-4 w-4" />
              {visualReviewTitle}
            </p>
            <ul className="mt-4 grid gap-2 text-sm font-semibold leading-6 sm:grid-cols-2">
              {visualReviewItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InfoItem
              label={cardProduct ? "Set" : "Categoria"}
              value={card?.set_name ?? productCategoryLabel(product.category)}
            />
            <InfoItem
              label={cardProduct ? "Rareza" : "Tipo"}
              value={card?.rarity ?? productTypeDetail(product)}
            />
            <InfoItem
              label={cardProduct ? "Numero" : "Estado"}
              value={card?.number ?? product.condition}
            />
          </div>
          <RiskChecklist signals={riskSignals} />
        </section>

        <aside className="min-w-0">
          <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-[0_18px_48px_rgba(30,64,175,0.12)] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-black uppercase text-white">
                {typeLabel(listing.type)}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700">
                {statusLabel(listing.status)}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight text-blue-950 sm:text-4xl">
              {displayTitle}
            </h1>
            <p className="mt-2 font-semibold text-slate-500">
              {cardProduct ? `ID oficial: ${card?.pokemon_tcg_id}` : displayMeta}
            </p>
            <p className="mt-6 text-3xl font-black text-red-500">{priceLabel(listing)}</p>

            <dl className="mt-7 grid gap-4 border-y border-blue-100 py-6 sm:grid-cols-2">
              <Detail icon={Tag} label="Estado" value={product.condition} />
              <Detail icon={MapPin} label="Ubicación" value={location} />
              <Detail icon={CalendarDays} label="Publicada" value={publishedAt} />
              <Detail icon={ShieldCheck} label="Moderación" value="Aprobada" />
            </dl>

            <div className="mt-6 grid gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-black">{verificationTitle}</p>
                  <p className="mt-1 leading-6 text-blue-800">{verificationCopy}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <p className="font-black">{photoStatusTitle}</p>
                  <p className="mt-1 leading-6 text-blue-800">{photoStatusCopy}</p>
                </div>
              </div>
            </div>
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

            {!isAvailable ? (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="font-black text-slate-800">
                  Esta publicación ya no está disponible.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Estado actual: {statusLabel(listing.status)}.
                </p>
              </div>
            ) : null}

            {!isListingOwner && isAvailable ? (
              <>
                <StartConversationButton
                  isAuthenticated={Boolean(user)}
                  listingId={listing.id}
                  listingType={listing.type}
                  sellerId={listing.seller_id}
                />
                {!user || directContactUrl ? (
                  <a
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50"
                    href={contactUrl}
                    rel={directContactUrl ? "noreferrer" : undefined}
                    target={directContactUrl ? "_blank" : undefined}
                  >
                    <ContactIcon className="h-5 w-5" />
                    {contactLabel}
                  </a>
                ) : (
                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-center text-sm font-semibold text-blue-800">
                    Este vendedor usa mensajes internos de NexoTCG.
                  </div>
                )}
              </>
            ) : null}
            {!isListingOwner && isAvailable ? (
              <FavoriteButton
                initialFavorite={Boolean(favorite)}
                isAuthenticated={Boolean(user)}
                listingId={listing.id}
              />
            ) : null}
            <ShareListingButton title={`${displayTitle} en NexoTCG`} />
            {canDeleteListing ? (
              <div className="mt-3">
                <DeleteListingButton
                  listingId={listing.id}
                  redirectTo="/marketplace"
                  title={displayTitle}
                />
              </div>
            ) : null}
            {!isListingOwner ? (
              <ReportListingForm
                initialReported={Boolean(existingReport)}
                isAuthenticated={Boolean(user)}
                listingId={listing.id}
              />
            ) : null}
            <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-black text-amber-900">Antes de cerrar</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Confirmá identidad, estado, entrega, precio y comprobantes. Si algo
                    parece sospechoso, reportá la publicación.
                  </p>
                  <Link
                    className="mt-2 inline-flex text-xs font-black text-blue-800 hover:text-blue-600"
                    href="/safety"
                  >
                    Ver guía de seguridad
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-950 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-lg font-black text-yellow-300">
                {seller.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    className="font-black transition hover:text-yellow-300"
                    href={`/users/${seller.id}`}
                  >
                    {seller.display_name}
                  </Link>
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
                  Vendedor de la comunidad NexoTCG
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
              <SellerTrustStat label="Operaciones" value={String(sellerOperations)} />
              <SellerTrustStat
                label="Valoraciones"
                value={String(seller.reputation_count)}
              />
              <SellerTrustStat label="Desde" value={sellerJoined} />
              <SellerTrustStat label="Zona" value={sellerLocation} />
            </div>
            <Link
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:border-yellow-300 hover:text-yellow-300"
              href={`/users/${seller.id}`}
            >
              Ver perfil completo
            </Link>
          </div>
          {canRate ? <ListingRatingForm listingId={listing.id} /> : null}
          {existingRating ? (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-black text-emerald-700">
              Ya valoraste esta operación.
            </div>
          ) : null}
          {reviews.length > 0 ? (
            <section className="mt-5 rounded-lg border border-blue-100 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-blue-950">Valoraciones recientes</h2>
                <span className="text-sm font-bold text-slate-400">
                  {seller.reputation_count} total
                </span>
              </div>
              <div className="mt-4 divide-y divide-blue-100">
                {reviews.map((review) => {
                  const reviewer = firstRelated(review.profiles);

                  return (
                    <article className="py-4 first:pt-0 last:pb-0" key={review.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-blue-950">
                          {reviewer?.display_name ?? "Entrenador TCG"}
                        </p>
                        <span className="flex items-center gap-1 text-sm font-black text-amber-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {review.stars}
                        </span>
                      </div>
                      {review.comment ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {review.comment}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        {new Intl.DateTimeFormat("es-AR", {
                          dateStyle: "medium"
                        }).format(new Date(review.created_at))}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
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

function SellerTrustStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
      <p className="truncate text-sm font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-blue-200">
        {label}
      </p>
    </div>
  );
}

function RiskChecklist({ signals }: { signals: string[] }) {
  if (signals.length === 0) {
    return (
      <div className="mt-5 rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-5 text-emerald-50">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <ShieldCheck className="h-4 w-4" />
          Senales basicas en orden
        </p>
        <p className="mt-3 text-sm font-semibold leading-6">
          La publicacion tiene fotos reales y el vendedor muestra actividad previa. Igual
          confirma estado, entrega y acuerdo por mensaje antes de cerrar.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-lg border border-amber-300/40 bg-amber-400/10 p-5 text-amber-50">
      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
        <AlertTriangle className="h-4 w-4" />
        Revisar antes de pagar
      </p>
      <div className="mt-4 grid gap-2">
        {signals.map((signal) => (
          <p className="flex items-start gap-2 text-sm font-semibold leading-6" key={signal}>
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-yellow-300" />
            {signal}
          </p>
        ))}
      </div>
    </div>
  );
}
