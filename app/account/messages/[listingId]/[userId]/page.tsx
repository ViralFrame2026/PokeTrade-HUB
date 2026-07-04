import { ArrowLeft, ExternalLink, ShieldCheck, Star, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ListingStatusControl } from "@/components/listing-status-control";
import { MessageComposer } from "@/components/message-composer";
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

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Conversacion"
};

type MessageRow = {
  body: string;
  created_at: string;
  id: string;
  recipient_id: string;
  sender_id: string;
};

type Related<T> = T | T[] | null;

type ListingContext = {
  completed_with_id: string | null;
  id: string;
  moderation_status: string;
  listing_images: Array<{
    sort_order: number;
    storage_path: string;
  }>;
  price: number | null;
  seller_id: string;
  status: string;
  title: string;
  trade_wants: string | null;
  type: string;
  products: Related<{
    accessory_type: string | null;
    category: string | null;
    condition: string;
    language: string | null;
    sealed_type: string | null;
    title: string | null;
    cards: Related<{
      image_large: string;
      official_name: string;
      set_name: string;
    }>;
  }>;
};

function typeLabel(type: string) {
  return {
    free: "Gratis",
    sale: "Venta",
    trade: "Intercambio"
  }[type] ?? type;
}

function valueLabel(listing: ListingContext) {
  if (listing.type === "trade") {
    return listing.trade_wants ? `Busca ${listing.trade_wants}` : "Intercambio";
  }

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

export default async function ConversationPage({
  params,
  searchParams
}: {
  params: Promise<{ listingId: string; userId: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { listingId, userId: otherId } = await params;
  const { intent = "sale" } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/account/messages/${listingId}/${otherId}`);
  }

  const [{ data: listing }, { data: profile }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, seller_id, completed_with_id, moderation_status, type, status, price, trade_wants, listing_images(storage_path, sort_order), products!listings_product_id_fkey(category, title, condition, language, sealed_type, accessory_type, cards!products_card_id_fkey(official_name, image_large, set_name))")
      .eq("id", listingId)
      .maybeSingle(),
    supabase.from("profiles").select("id, display_name").eq("id", otherId).maybeSingle()
  ]);

  if (
    !listing ||
    !profile ||
    listing.moderation_status !== "approved" ||
    otherId === user.id ||
    (listing.seller_id !== user.id && listing.seller_id !== otherId)
  ) {
    notFound();
  }

  const listingContext = listing as ListingContext;
  const product = firstRelated(listingContext.products);
  const photoPath = firstListingPhotoPath(listingContext.listing_images);
  const photoUrl = photoPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${photoPath}`
    : null;
  const displayTitle = productTitle(product, listingContext.title);
  const displayImage = photoUrl ?? productImage(product);
  const displayMeta = productMeta(product);
  const isSeller = listingContext.seller_id === user.id;
  const wasClosedWithCurrentUser = listingContext.completed_with_id === user.id;
  const isClosed = ["sold", "traded", "finished"].includes(listingContext.status);

  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at")
    .eq("listing_id", listingId)
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  const hasExistingConversation = Boolean(data?.length);

  if (listing.seller_id === user.id && !hasExistingConversation) {
    notFound();
  }

  if (listing.status !== "active" && !hasExistingConversation) {
    notFound();
  }

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("listing_id", listingId)
    .eq("sender_id", otherId)
    .eq("recipient_id", user.id)
    .is("read_at", null);

  const messages = (data ?? []) as MessageRow[];

  return (
    <main className="min-h-screen bg-[#071535] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu />
            <Link className="flex min-w-0 items-center gap-3" href="/account/messages">
              <ArrowLeft className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="truncate font-black">{profile.display_name}</p>
                <p className="max-w-[220px] truncate text-xs text-blue-100">{displayTitle}</p>
              </div>
            </Link>
          </div>
          <Link
            aria-label="Ver publicación"
            className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 transition hover:border-yellow-300 hover:text-yellow-300"
            href={`/listings/${listingId}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-[0_22px_65px_rgba(0,0,0,0.28)]">
          <div className="grid gap-4 border-b border-white/10 bg-[linear-gradient(135deg,#123cba,#071535)] p-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
            <div className="relative h-24 overflow-hidden rounded-lg bg-blue-50">
              {displayImage ? (
                <Image
                  alt={displayTitle}
                  className="object-contain p-2"
                  fill
                  sizes="88px"
                  src={displayImage}
                />
              ) : (
                <Store className="absolute inset-0 m-auto h-7 w-7 text-blue-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-blue-950">
                  {typeLabel(listingContext.type)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-100">
                  {statusLabel(listingContext.status)}
                </span>
              </div>
              <h1 className="mt-2 truncate text-lg font-black text-white">
                {displayTitle}
              </h1>
              <p className="mt-1 truncate text-sm font-semibold text-blue-100">
                {displayMeta}
              </p>
              <p className="mt-2 text-sm font-black text-yellow-300">
                {valueLabel(listingContext)}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:border-yellow-300 hover:text-yellow-300"
              href={`/listings/${listingId}`}
            >
              <ExternalLink className="h-4 w-4" />
              Ver publicación
            </Link>
          </div>
          <div className="border-b border-white/10 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-100 sm:px-6">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
              <span>
                Mantené los acuerdos dentro del chat, revisá fotos reales y evitá pagos
                fuera de una operación clara.
              </span>
            </p>
          </div>
          <div className="grid gap-4 border-b border-white/10 bg-[#071535] p-4 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
                Flujo de operacion
              </p>
              <h2 className="mt-2 text-xl font-black text-white">
                {isSeller
                  ? "Cerra la operacion cuando ya este acordada"
                  : isClosed && wasClosedWithCurrentUser
                    ? "La operacion fue cerrada contigo"
                    : "Acorda los detalles con el vendedor"}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-blue-100">
                {isSeller
                  ? "Cuando confirmes la venta, intercambio o entrega, la publicacion sale del marketplace activo y la otra persona puede valorar la experiencia."
                  : isClosed && wasClosedWithCurrentUser
                    ? "Ya podes valorar al vendedor para ayudar a construir reputacion real en la comunidad."
                    : "Cuando el vendedor cierre la operacion contigo, vas a verla en Mis operaciones y podras valorar la experiencia."}
              </p>
            </div>
            {isSeller ? (
              <ListingStatusControl
                counterparties={[{ id: otherId, name: profile.display_name }]}
                currentStatus={listingContext.status}
                listingId={listingId}
                listingPrice={listingContext.price}
                listingType={listingContext.type}
              />
            ) : isClosed && wasClosedWithCurrentUser ? (
              <ButtonLink href={`/listings/${listingId}`} icon={Star}>
                Valorar vendedor
              </ButtonLink>
            ) : (
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:border-yellow-300 hover:text-yellow-300"
                href="/account/operations"
              >
                Ver mis operaciones
              </Link>
            )}
          </div>
          <div className="min-h-[55vh] space-y-3 bg-[#0b1d46] p-4 sm:p-6">
            {messages.length ? (
              messages.map((message) => {
                const isOwn = message.sender_id === user.id;

                return (
                  <div
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    key={message.id}
                  >
                    <div
                      className={`max-w-[82%] rounded-lg px-4 py-3 ${
                        isOwn
                          ? "bg-blue-700 text-white shadow-[0_10px_25px_rgba(37,99,235,.25)]"
                          : "border border-white/10 bg-white text-slate-700 shadow-[0_10px_25px_rgba(0,0,0,.18)]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                      <p
                        className={`mt-1 text-right text-[10px] font-semibold ${
                          isOwn ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {new Intl.DateTimeFormat("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        }).format(new Date(message.created_at))}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid min-h-[50vh] place-items-center text-center">
                <div>
                  <h1 className="text-xl font-black text-white">Inicia la conversación</h1>
                  <p className="mt-2 text-sm text-blue-100">
                    Consulta disponibilidad, estado o condiciones del producto.
                  </p>
                </div>
              </div>
            )}
          </div>
          <MessageComposer
            intent={intent}
            listingId={listingId}
            listingType={listingContext.type}
            recipientId={otherId}
          />
        </div>
      </section>
    </main>
  );
}
