import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  Pencil,
  Plus,
  Store,
  UserRound
} from "lucide-react";
import { redirect } from "next/navigation";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Related<T> = T | T[] | null;

type ListingRow = {
  created_at: string;
  id: string;
  moderation_status: string;
  price: number | null;
  rejection_reason: string | null;
  status: string;
  title: string;
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
      "id, title, type, status, moderation_status, rejection_reason, price, created_at, products!listings_product_id_fkey(condition, cards!products_card_id_fkey(official_name, image_large, set_name))"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as ListingRow[];
  const approved = listings.filter((listing) => listing.moderation_status === "approved").length;
  const pending = listings.filter((listing) => listing.moderation_status === "pending").length;
  const needsAttention = listings.filter((listing) =>
    ["rejected", "changes_requested"].includes(listing.moderation_status)
  ).length;

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MI CUENTA</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              aria-label="Mi perfil"
              className="grid h-11 w-11 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
              href="/account/profile"
              title="Mi perfil"
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <ButtonLink href="/publish" icon={Plus}>
              Publicar
            </ButtonLink>
          </div>
        </nav>
      </header>

      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="mt-5 text-4xl font-black text-blue-950">Mis publicaciones</h1>
          <p className="mt-2 text-slate-600">
            Sigue el estado de las cartas que enviaste a moderacion.
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
              const card = firstRelated(product?.cards ?? null);
              const status = moderationMeta(listing.moderation_status);
              const StatusIcon = status.icon;

              return (
                <article
                  className="grid gap-5 rounded-lg border border-blue-100 bg-white p-4 shadow-sm sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center"
                  key={listing.id}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-blue-50">
                    {card?.image_large ? (
                      <Image
                        alt={card.official_name}
                        className="object-contain p-2"
                        fill
                        sizes="120px"
                        src={card.image_large}
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
                    </div>
                    <h2 className="mt-3 truncate text-xl font-black text-blue-950">
                      {card?.official_name ?? listing.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {[card?.set_name, product?.condition].filter(Boolean).join(" | ")}
                    </p>
                    <p className="mt-2 font-black text-red-500">{priceLabel(listing)}</p>

                    {listing.rejection_reason ? (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        <strong>Revision:</strong> {listing.rejection_reason}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:max-w-52 sm:justify-end">
                    {listing.moderation_status === "approved" ? (
                      <Link
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-800"
                        href={`/listings/${listing.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        Ver publicada
                      </Link>
                    ) : (
                      <Link
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-800 transition hover:border-blue-400"
                        href={`/account/listings/${listing.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                    )}
                    <DeleteListingButton
                      listingId={listing.id}
                      title={card?.official_name ?? listing.title}
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
                Todavia no publicaste cartas
              </h2>
              <p className="mt-2 text-slate-600">
                Selecciona una carta oficial y enviala a revision.
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
