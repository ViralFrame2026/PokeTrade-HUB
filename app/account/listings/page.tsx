import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  Eye,
  Pencil,
  Plus,
  Share2,
  Store,
  UserRound
} from "lucide-react";
import { redirect } from "next/navigation";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { ListingStatusControl } from "@/components/listing-status-control";
import { ShareListingButton } from "@/components/share-listing-button";
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
  title: "Mis publicaciones"
};

type Related<T> = T | T[] | null;

type ListingRow = {
  created_at: string;
  id: string;
  listing_images: Array<{
    sort_order: number;
    storage_path: string;
  }>;
  moderation_status: string;
  price: number | null;
  rejection_reason: string | null;
  status: string;
  title: string;
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

type MessageRow = {
  listing_id: string | null;
  recipient_id: string;
  sender_id: string;
};

function moderationMeta(status: string) {
  if (status === "approved") {
    return {
      className: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
      label: "Aprobada"
    };
  }

  if (status === "rejected") {
    return {
      className: "bg-red-100 text-red-700",
      icon: AlertCircle,
      label: "Rechazada"
    };
  }

  if (status === "changes_requested") {
    return {
      className: "bg-amber-100 text-amber-800",
      icon: AlertCircle,
      label: "Requiere cambios"
    };
  }

  return {
    className: "bg-blue-100 text-blue-700",
    icon: Clock3,
    label: "En revision"
  };
}
function typeLabel(type: string) {
  return {
    free: "Gratis",
    sale: "Venta",
    trade: "Intercambio"
  }[type] ?? type;
}

function priceLabel(listing: ListingRow) {
  if (listing.type === "trade") return "Intercambio";
  if (listing.type === "free") return "Gratis";

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(listing.price ?? 0);
}

function commissionLabel(price: number | null) {
  const commission = Number(price ?? 0) * 0.05;
  const sellerNet = Number(price ?? 0) - commission;

  return {
    commission: new Intl.NumberFormat("es-AR", {
      currency: "ARS",
      maximumFractionDigits: 0,
      style: "currency"
    }).format(commission),
    sellerNet: new Intl.NumberFormat("es-AR", {
      currency: "ARS",
      maximumFractionDigits: 0,
      style: "currency"
    }).format(sellerNet)
  };
}

function availabilityLabel(status: string) {
  return {
    active: "Disponible",
    finished: "Finalizada",
    reserved: "Reservada",
    sold: "Vendida",
    traded: "Intercambiada"
  }[status] ?? status;
}

function nextActionLabel(listing: ListingRow) {
  if (listing.moderation_status === "approved" && listing.status === "active") {
    return "Tu producto ya esta visible en el marketplace. Compartilo o cambia el estado cuando cierres la operacion.";
  }

  if (listing.moderation_status === "approved") {
    return "La publicacion queda guardada con su estado actual. Puedes eliminarla cuando quieras.";
  }

  if (listing.moderation_status === "rejected" || listing.moderation_status === "changes_requested") {
    return "Edita los datos pedidos y vuelve a enviarla para moderacion.";
  }

  return "El equipo la esta revisando. Cuando se apruebe, aparecera en el marketplace.";
}

export default async function MyListingsPage({
  searchParams
}: {
  searchParams: Promise<{ resubmitted?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/listings");
  }

  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, type, status, moderation_status, rejection_reason, price, created_at, listing_images(storage_path, sort_order), products!listings_product_id_fkey(category, title, condition, language, sealed_type, accessory_type, cards!products_card_id_fkey(official_name, image_large, set_name))"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as ListingRow[];
  const listingIds = listings.map((listing) => listing.id);
  const { data: messagesData } = listingIds.length
    ? await supabase
        .from("messages")
        .select("listing_id, sender_id, recipient_id")
        .in("listing_id", listingIds)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    : { data: [] };
  const messages = (messagesData ?? []) as MessageRow[];
  const counterpartIds = [
    ...new Set(
      messages.map((message) =>
        message.sender_id === user.id ? message.recipient_id : message.sender_id
      )
    )
  ];
  const { data: counterpartProfiles } = counterpartIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", counterpartIds)
    : { data: [] };
  const counterpartNames = new Map(
    (counterpartProfiles ?? []).map((profile) => [profile.id, profile.display_name])
  );
  const counterpartiesByListing = new Map<
    string,
    Array<{ id: string; name: string }>
  >();

  for (const message of messages) {
    if (!message.listing_id) continue;
    const otherId =
      message.sender_id === user.id ? message.recipient_id : message.sender_id;
    const current = counterpartiesByListing.get(message.listing_id) ?? [];
    if (!current.some((counterparty) => counterparty.id === otherId)) {
      current.push({
        id: otherId,
        name: counterpartNames.get(otherId) ?? "Entrenador TCG"
      });
      counterpartiesByListing.set(message.listing_id, current);
    }
  }
  const approved = listings.filter((listing) => listing.moderation_status === "approved").length;
  const pending = listings.filter((listing) => listing.moderation_status === "pending").length;
  const needsAttention = listings.filter((listing) =>
    ["rejected", "changes_requested"].includes(listing.moderation_status)
  ).length;

  return (
    <main className="min-h-screen bg-[#071535] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu badges={{ listings: pending }} />
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.2em] text-yellow-300">
                  NexoTCG
                </p>
                <p className="truncate text-xs font-bold text-blue-100">MI CUENTA</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              aria-label="Notificaciones"
              className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300 sm:h-11 sm:w-11"
              href="/account/notifications"
              title="Notificaciones"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <Link
              aria-label="Mi perfil"
              className="hidden h-11 w-11 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300 sm:grid"
              href="/account/profile"
              title="Mi perfil"
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <ButtonLink href="/publish" icon={Plus} size="sm">
              Publicar
            </ButtonLink>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.16),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_70%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="mt-5 text-4xl font-black text-white">Mis publicaciones</h1>
          <p className="mt-2 text-blue-100">
            Sigue el estado de los productos que enviaste a moderacion.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Total enviadas" value={listings.length} />
            <SummaryCard label="En revision" value={pending} variant="blue" />
            <SummaryCard
              label={needsAttention > 0 ? "Necesitan atencion" : "Aprobadas"}
              value={needsAttention > 0 ? needsAttention : approved}
              variant={needsAttention > 0 ? "red" : "green"}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {params.resubmitted === "1" ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">
            Los cambios se guardaron y la publicacion volvio a moderacion.
          </div>
        ) : null}
        {listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing) => {
              const product = firstRelated(listing.products);
              const photoPath = firstListingPhotoPath(listing.listing_images);
              const photoUrl = photoPath
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${photoPath}`
                : null;
              const displayTitle = productTitle(product, listing.title);
              const displayImage = photoUrl ?? productImage(product);
              const displayMeta = productMeta(product);
              const status = moderationMeta(listing.moderation_status);
              const StatusIcon = status.icon;
              const saleCommission = commissionLabel(listing.price);

              return (
                <article
                  className="grid gap-5 rounded-lg border border-blue-100 bg-white p-4 shadow-sm sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center"
                  key={listing.id}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-blue-50">
                    {displayImage ? (
                      <Image
                        alt={displayTitle}
                        className="object-contain p-2"
                        fill
                        sizes="120px"
                        src={displayImage}
                      />
                    ) : (
                      <Store className="absolute inset-0 m-auto h-8 w-8 text-blue-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                      <span className="text-xs font-bold uppercase text-slate-500">
                        {typeLabel(listing.type)}
                      </span>
                      {listing.moderation_status === "approved" ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                          {availabilityLabel(listing.status)}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 truncate text-xl font-black text-blue-950">
                      {displayTitle}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {displayMeta}
                    </p>
                    <p className="mt-2 font-black text-red-500">{priceLabel(listing)}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {nextActionLabel(listing)}
                    </p>
                    {listing.type === "sale" && listing.status === "sold" ? (
                      <p className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-900">
                        Comision estimada NexoTCG: {saleCommission.commission} | Neto vendedor:{" "}
                        {saleCommission.sellerNet}
                      </p>
                    ) : null}

                    {listing.rejection_reason ? (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        <strong>Revision:</strong> {listing.rejection_reason}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:max-w-52 sm:justify-end">
                    {listing.moderation_status === "approved" &&
                    listing.status === "active" ? (
                      <Link
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-800"
                        href={`/listings/${listing.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        Ver publicada
                      </Link>
                    ) : listing.moderation_status !== "approved" ? (
                      <Link
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-800 transition hover:border-blue-400"
                        href={`/account/listings/${listing.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                    ) : null}
                    {listing.moderation_status === "approved" ? (
                      <div className="w-full sm:max-w-52">
                        <ShareListingButton
                          className="mt-0 px-4 py-2 text-sm"
                          title={displayTitle}
                          url={`/listings/${listing.id}`}
                        />
                      </div>
                    ) : null}
                    {listing.moderation_status === "approved" ? (
                      <ListingStatusControl
                        counterparties={counterpartiesByListing.get(listing.id) ?? []}
                        currentStatus={listing.status}
                        listingId={listing.id}
                        listingPrice={listing.price}
                        listingType={listing.type}
                      />
                    ) : null}
                    {listing.moderation_status !== "approved" ? (
                      <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-500">
                        <Share2 className="h-4 w-4" />
                        Compartir al aprobarse
                      </span>
                    ) : null}
                    <DeleteListingButton
                      listingId={listing.id}
                      title={displayTitle}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 text-center">
            <div>
              <Store className="mx-auto h-10 w-10 text-blue-500" />
              <h2 className="mt-4 text-xl font-black text-blue-950">
                Todavia no publicaste productos
              </h2>
              <p className="mt-2 text-slate-600">
                Publica una carta, producto sellado o accesorio y envialo a revision.
              </p>
              <div className="mt-5">
                <ButtonLink href="/publish" icon={Plus}>
                  Crear publicacion
                </ButtonLink>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  variant = "blue"
}: {
  label: string;
  value: number;
  variant?: "blue" | "green" | "red";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700"
  };

  return (
    <div className={`rounded-lg border p-5 ${colors[variant]}`}>
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold">{label}</p>
    </div>
  );
}
