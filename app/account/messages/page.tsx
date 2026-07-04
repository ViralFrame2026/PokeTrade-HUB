import { ArrowLeft, Inbox, MessageCircle, MessagesSquare, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
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
  title: "Mensajes"
};

type MessageRow = {
  body: string;
  created_at: string;
  listing_id: string | null;
  read_at: string | null;
  recipient_id: string;
  sender_id: string;
};

type ConversationPreview = {
  key: string;
  lastMessage: MessageRow;
  unreadCount: number;
};

type Related<T> = T | T[] | null;

type ListingPreview = {
  id: string;
  listing_images: Array<{
    sort_order: number;
    storage_path: string;
  }>;
  title: string;
  products: Related<{
    accessory_type: string | null;
    category: string | null;
    condition: string | null;
    language: string | null;
    sealed_type: string | null;
    title: string | null;
    cards: Related<{
      image_large: string | null;
      number: string | null;
      official_name: string | null;
      rarity: string | null;
      set_name: string | null;
    }>;
  }>;
};

function messageDateLabel(date: string) {
  const value = new Date(date);
  const today = new Date();
  const isToday = value.toDateString() === today.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(value);
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short"
  }).format(value);
}

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/messages");

  const { data } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, listing_id, body, read_at, created_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as MessageRow[];
  const conversationMap = new Map<string, ConversationPreview>();

  for (const message of messages) {
    if (!message.listing_id) continue;
    const otherId =
      message.sender_id === user.id ? message.recipient_id : message.sender_id;
    const key = `${message.listing_id}:${otherId}`;
    const current = conversationMap.get(key);
    const isUnread = message.recipient_id === user.id && message.read_at === null;

    if (!current) {
      conversationMap.set(key, {
        key,
        lastMessage: message,
        unreadCount: isUnread ? 1 : 0
      });
    } else if (isUnread) {
      current.unreadCount += 1;
    }
  }

  const conversations = [...conversationMap.values()];
  const otherIds = [
    ...new Set(conversations.map((conversation) => conversation.key.split(":")[1]))
  ];
  const listingIds = [
    ...new Set(
      conversations
        .map((conversation) => conversation.lastMessage.listing_id)
        .filter(Boolean)
    )
  ] as string[];
  const [{ data: profiles }, { data: listings }] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", otherIds)
      : Promise.resolve({ data: [] }),
    listingIds.length
      ? supabase
          .from("listings")
          .select(
            "id, title, listing_images(storage_path, sort_order), products!listings_product_id_fkey(category, title, condition, language, sealed_type, accessory_type, cards!products_card_id_fkey(official_name, image_large, set_name, rarity, number))"
          )
          .in("id", listingIds)
      : Promise.resolve({ data: [] })
  ]);
  const profileNames = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.display_name])
  );
  const listingPreviews = new Map(
    ((listings ?? []) as ListingPreview[]).map((listing) => [listing.id, listing])
  );

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu
              badges={{
                messages: conversations.reduce((total, item) => total + item.unreadCount, 0)
              }}
            />
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.2em] text-yellow-300">
                  POKETRADE
                </p>
                <p className="truncate text-xs font-bold text-blue-100">MENSAJES</p>
              </div>
            </Link>
          </div>
          <MessageCircle className="h-6 w-6 text-yellow-300" />
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_82%_0%,rgba(250,204,21,.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
            href="/account"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mi cuenta
          </Link>

          <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-yellow-300/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                <MessagesSquare className="h-4 w-4" />
                Centro de mensajes
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">Mensajes</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
                Conversaciones vinculadas a productos, ventas e intercambios de la comunidad.
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,.22)]">
              <p className="text-4xl font-black">{conversations.length}</p>
              <p className="mt-1 text-sm font-bold text-blue-100">conversaciones</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {conversations.length ? (
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-[0_18px_45px_rgba(0,0,0,.18)]">
            {conversations.map((conversation) => {
              const { key, lastMessage, unreadCount } = conversation;
              const [listingId, otherId] = key.split(":");
              const listing = listingPreviews.get(listingId);
              const product = firstRelated(listing?.products);
              const photoPath = firstListingPhotoPath(listing?.listing_images);
              const photoUrl = photoPath
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${photoPath}`
                : null;
              const displayTitle = productTitle(product, listing?.title ?? "Publicación");
              const displayImage = photoUrl ?? productImage(product);
              const displayMeta = productMeta(product);
              const isOwnLastMessage = lastMessage.sender_id === user.id;

              return (
                <Link
                  className={`flex items-center gap-4 border-b border-white/10 p-4 transition last:border-b-0 hover:bg-white/10 sm:p-5 ${
                    unreadCount > 0 ? "bg-yellow-400/10" : ""
                  }`}
                  href={`/account/messages/${listingId}/${otherId}`}
                  key={key}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-blue-950">
                    {displayImage ? (
                      <Image
                        alt={displayTitle}
                        className="object-contain p-1"
                        fill
                        sizes="56px"
                        src={displayImage}
                      />
                    ) : (
                      <span className="grid h-full place-items-center bg-yellow-400 font-black text-blue-950">
                        {(profileNames.get(otherId) ?? "TC").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate font-black text-white">
                        {profileNames.get(otherId) ?? "Entrenador TCG"}
                      </h2>
                      <span className="shrink-0 text-xs font-bold text-blue-200">
                        {messageDateLabel(lastMessage.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs font-bold text-yellow-300">
                      <Store className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {displayTitle}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-blue-200">
                      {displayMeta}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <p
                        className={`min-w-0 flex-1 truncate text-sm ${
                          unreadCount > 0 ? "font-bold text-white" : "text-blue-100"
                        }`}
                      >
                        {isOwnLastMessage ? "Tú: " : ""}
                        {lastMessage.body}
                      </p>
                      {unreadCount > 0 ? (
                        <span className="grid min-w-6 shrink-0 place-items-center rounded-full bg-red-500 px-2 py-1 text-[11px] font-black leading-none text-white">
                          {Math.min(unreadCount, 99)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-80 place-items-center rounded-lg border-2 border-dashed border-white/15 bg-white/[0.05] px-6 text-center">
            <div className="max-w-xl">
              <Inbox className="mx-auto h-10 w-10 text-yellow-300" />
              <h2 className="mt-4 text-xl font-black text-white">
                Todavía no tienes conversaciones
              </h2>
              <p className="mt-2 leading-7 text-blue-100">
                Explorá el marketplace, abrí una publicación y enviá un mensaje al
                vendedor para iniciar una conversación vinculada a ese producto.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/marketplace" icon={Store}>
                  Explorar productos
                </ButtonLink>
                <ButtonLink href="/publish" variant="secondary">
                  Publicar producto
                </ButtonLink>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
