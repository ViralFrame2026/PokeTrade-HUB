import { ArrowLeft, ExternalLink, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageComposer } from "@/components/message-composer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MessageRow = {
  body: string;
  created_at: string;
  id: string;
  recipient_id: string;
  sender_id: string;
};

type Related<T> = T | T[] | null;

type ListingContext = {
  id: string;
  moderation_status: string;
  price: number | null;
  seller_id: string;
  status: string;
  title: string;
  trade_wants: string | null;
  type: string;
  products: Related<{
    condition: string;
    cards: Related<{
      image_large: string;
      official_name: string;
      set_name: string;
    }>;
  }>;
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
  params
}: {
  params: Promise<{ listingId: string; userId: string }>;
}) {
  const { listingId, userId: otherId } = await params;
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
      .select("id, title, seller_id, moderation_status, type, status, price, trade_wants, products!listings_product_id_fkey(condition, cards!products_card_id_fkey(official_name, image_large, set_name))")
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
  const card = firstRelated(product?.cards ?? null);

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
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/account/messages">
            <ArrowLeft className="h-5 w-5" />
            <div>
              <p className="font-black">{profile.display_name}</p>
              <p className="max-w-[220px] truncate text-xs text-blue-100">{listing.title}</p>
            </div>
          </Link>
          <Link
            aria-label="Ver publicacion"
            className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 transition hover:border-yellow-300 hover:text-yellow-300"
            href={`/listings/${listingId}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_18px_48px_rgba(30,64,175,0.10)]">
          <div className="grid gap-4 border-b border-blue-100 bg-white p-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
            <div className="relative h-24 overflow-hidden rounded-lg bg-blue-50">
              {card?.image_large ? (
                <Image
                  alt={card.official_name}
                  className="object-contain p-2"
                  fill
                  sizes="88px"
                  src={card.image_large}
                />
              ) : (
                <Store className="absolute inset-0 m-auto h-7 w-7 text-blue-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-amber-800">
                  {typeLabel(listingContext.type)}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {statusLabel(listingContext.status)}
                </span>
              </div>
              <h1 className="mt-2 truncate text-lg font-black text-blue-950">
                {card?.official_name ?? listingContext.title}
              </h1>
              <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                {[card?.set_name, product?.condition].filter(Boolean).join(" | ")}
              </p>
              <p className="mt-2 text-sm font-black text-red-500">
                {valueLabel(listingContext)}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-3 text-sm font-black text-blue-800 transition hover:bg-blue-50"
              href={`/listings/${listingId}`}
            >
              <ExternalLink className="h-4 w-4" />
              Ver publicacion
            </Link>
          </div>
          <div className="min-h-[55vh] space-y-3 bg-blue-50/60 p-4 sm:p-6">
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
                          ? "bg-blue-700 text-white"
                          : "border border-blue-100 bg-white text-slate-700"
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
                  <h1 className="text-xl font-black text-blue-950">Inicia la conversacion</h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Consulta disponibilidad, estado o condiciones del producto.
                  </p>
                </div>
              </div>
            )}
          </div>
          <MessageComposer listingId={listingId} recipientId={otherId} />
        </div>
      </section>
    </main>
  );
}
