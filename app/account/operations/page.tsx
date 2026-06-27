import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Handshake,
  MessageSquareText,
  Star,
  Store,
  UserRound
} from "lucide-react";
import { redirect } from "next/navigation";
import { SiteMenu } from "@/components/site-menu";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operaciones"
};

type Related<T> = T | T[] | null;

type OperationRow = {
  approved_at: string | null;
  completed_with_id: string | null;
  created_at: string;
  id: string;
  location_city: string | null;
  location_country: string | null;
  price: number | null;
  seller_id: string;
  status: string;
  trade_wants: string | null;
  type: string;
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
  profiles: Related<{
    display_name: string;
    id: string;
    is_verified: boolean;
    reputation_average: number;
  }>;
};

type RatingRow = {
  listing_id: string | null;
};

function firstRelated<T>(value: Related<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function statusLabel(status: string) {
  return {
    finished: "Finalizada",
    sold: "Comprada",
    traded: "Intercambiada"
  }[status] ?? status;
}

function typeLabel(type: string) {
  return {
    free: "Gratis",
    sale: "Compra",
    trade: "Intercambio"
  }[type] ?? type;
}

function valueLabel(operation: OperationRow) {
  if (operation.type === "trade") return operation.trade_wants || "Intercambio";
  if (operation.type === "free") return "Gratis";

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(operation.price ?? 0);
}

function dateLabel(date: string | null) {
  if (!date) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

function roleLabel(operation: OperationRow, userId: string) {
  return operation.seller_id === userId ? "Como vendedor" : "Como comprador";
}

export default async function OperationsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/operations");

  const { data } = await supabase
    .from("listings")
    .select(
      "id, seller_id, type, status, price, trade_wants, completed_with_id, approved_at, created_at, location_city, location_country, profiles!listings_seller_id_fkey(id, display_name, is_verified, reputation_average), products!listings_product_id_fkey(condition, cards!products_card_id_fkey(official_name, image_large, set_name, rarity, number))"
    )
    .eq("moderation_status", "approved")
    .in("status", ["sold", "traded", "finished"])
    .or(`completed_with_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const operations = (data ?? []) as OperationRow[];
  const operationIds = operations.map((operation) => operation.id);
  const { data: ratingsData } = operationIds.length
    ? await supabase
        .from("ratings")
        .select("listing_id")
        .eq("reviewer_id", user.id)
        .in("listing_id", operationIds)
    : { data: [] };

  const ratedIds = new Set(
    ((ratingsData ?? []) as RatingRow[])
      .map((rating) => rating.listing_id)
      .filter(Boolean)
  );
  const counterpartyOperations = operations.filter((operation) => operation.seller_id !== user.id);
  const sellerOperations = operations.filter((operation) => operation.seller_id === user.id);
  const pendingRatings = counterpartyOperations.filter(
    (operation) => !ratedIds.has(operation.id)
  ).length;
  const nextOperation = counterpartyOperations.find((operation) => !ratedIds.has(operation.id));

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu />
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.2em] text-yellow-300">
                  POKETRADE
                </p>
                <p className="truncate text-xs font-bold text-blue-100">MIS OPERACIONES</p>
              </div>
            </Link>
          </div>
          <ButtonLink href="/account/messages" icon={MessageSquareText} size="sm">
            Mensajes
          </ButtonLink>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_82%_0%,rgba(250,204,21,.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
            href="/account"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mi cuenta
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
                Historial comprador
              </p>
              <h1 className="mt-2 text-4xl font-black text-white">Mis operaciones</h1>
              <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                Revisa tus compras e intercambios cerrados. Desde aquí puedes volver a
                la publicación para valorar al vendedor.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard label="Cerradas" value={operations.length} />
              <SummaryCard label="Por valorar" value={pendingRatings} variant="yellow" />
              <SummaryCard label="Como vendedor" value={sellerOperations.length} variant="green" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {operations.length > 0 ? (
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="rounded-lg border border-yellow-300/30 bg-yellow-400/10 p-5 shadow-[0_18px_45px_rgba(0,0,0,.16)]">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
                <Star className="h-4 w-4" />
                Próximo paso de reputación
              </p>
              <h2 className="mt-3 text-xl font-black text-white">
                {pendingRatings > 0
                  ? `Tenés ${pendingRatings} operación${pendingRatings === 1 ? "" : "es"} pendiente${pendingRatings === 1 ? "" : "s"} de valorar`
                  : "Todas tus operaciones están valoradas"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
                {pendingRatings > 0
                  ? "Tu valoración ayuda a otros coleccionistas a elegir vendedores confiables y mejora la reputación real del marketplace."
                  : "Buenísimo: ya ayudaste a dejar registro de tus experiencias. Las próximas operaciones aparecerán acá."}
              </p>
            </div>
            {nextOperation ? (
              <ButtonLink href={`/listings/${nextOperation.id}`} icon={Star}>
                Valorar ahora
              </ButtonLink>
            ) : (
              <ButtonLink href="/marketplace" icon={Store}>
                Explorar
              </ButtonLink>
            )}
          </div>
        ) : null}

        {operations.length > 0 ? (
          <div className="space-y-4">
            {operations.map((operation) => {
              const product = firstRelated(operation.products);
              const card = firstRelated(product?.cards ?? null);
              const seller = firstRelated(operation.profiles);
              const isSellerSide = operation.seller_id === user.id;
              const isRated = isSellerSide || ratedIds.has(operation.id);
              const title = card?.official_name ?? "Carta Pokémon TCG";

              return (
                <article
                  className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-[0_18px_45px_rgba(0,0,0,.18)] sm:grid-cols-[124px_minmax(0,1fr)_auto] sm:items-center"
                  key={operation.id}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-blue-50">
                    {card?.image_large ? (
                      <Image
                        alt={title}
                        className="object-contain p-2"
                        fill
                        sizes="124px"
                        src={card.image_large}
                      />
                    ) : (
                      <Store className="absolute inset-0 m-auto h-8 w-8 text-blue-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                        <Handshake className="h-3.5 w-3.5" />
                        {statusLabel(operation.status)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        {typeLabel(operation.type)}
                      </span>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                        {roleLabel(operation, user.id)}
                      </span>
                      {isRated ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {isSellerSide ? "Cerrada" : "Valorada"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">
                          <Star className="h-3.5 w-3.5" />
                          Pendiente de valorar
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 truncate text-xl font-black text-white">{title}</h2>
                    <p className="mt-1 text-sm text-blue-100">
                      {[card?.set_name, card?.number ? `#${card.number}` : null, card?.rarity, product?.condition]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-blue-100">
                      <span className="font-black text-yellow-300">{valueLabel(operation)}</span>
                      <span>{dateLabel(operation.approved_at ?? operation.created_at)}</span>
                      {seller ? (
                        <Link
                          className="inline-flex items-center gap-1 font-bold text-yellow-300 hover:text-yellow-200"
                          href={`/users/${seller.id}`}
                        >
                          <UserRound className="h-4 w-4" />
                          {seller.display_name}
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:w-48 sm:justify-end">
                    <Link
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:border-yellow-300 hover:text-yellow-300"
                      href={`/listings/${operation.id}`}
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                    {!isRated ? (
                      <Link
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-black text-blue-950 transition hover:bg-yellow-300"
                        href={`/listings/${operation.id}`}
                      >
                        <Star className="h-4 w-4" />
                        Valorar
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-80 place-items-center rounded-lg border-2 border-dashed border-white/15 bg-white/[0.05] px-6 text-center">
            <div>
              <Handshake className="mx-auto h-12 w-12 text-yellow-300" />
              <h2 className="mt-4 text-2xl font-black text-white">
                Aún no tienes operaciones cerradas
              </h2>
              <p className="mt-2 max-w-md text-blue-100">
                Cuando un vendedor marque una publicación como vendida o intercambiada
                contigo, aparecerá aquí para que puedas valorar la experiencia.
              </p>
              <div className="mt-6">
                <ButtonLink href="/marketplace" icon={Store}>
                  Explorar marketplace
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
  variant?: "blue" | "green" | "yellow";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-800"
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[variant]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-black uppercase">{label}</p>
    </div>
  );
}
