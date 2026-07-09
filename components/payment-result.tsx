import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PaymentResultProps = {
  icon: LucideIcon;
  searchParams: Promise<{ order_id?: string }>;
  status: "success" | "pending" | "failure";
  title: string;
};

type PaymentOrder = {
  id: string;
  listing_id: string;
  status: string;
  provider_status: string | null;
};

const copy = {
  failure: {
    className: "bg-red-500 text-white",
    message:
      "El pago no se completó. La publicación no se marca como vendida y podés intentarlo nuevamente si sigue disponible."
  },
  pending: {
    className: "bg-yellow-400 text-blue-950",
    message:
      "Mercado Pago todavía está procesando el pago. Te avisaremos cuando se confirme."
  },
  success: {
    className: "bg-emerald-500 text-white",
    message:
      "Recibimos la confirmación del pago. La publicación se marcará como vendida y el vendedor recibirá una notificación."
  }
};

export async function PaymentResult({
  icon: Icon,
  searchParams,
  status,
  title
}: PaymentResultProps) {
  const params = await searchParams;
  const orderId = params.order_id;
  const supabase = await createSupabaseServerClient();
  const { data } = orderId
    ? await supabase
        .from("payment_orders")
        .select("id, listing_id, status, provider_status")
        .eq("id", orderId)
        .maybeSingle()
    : { data: null };
  const order = data as PaymentOrder | null;
  const currentCopy = copy[status];

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="border-b-8 border-yellow-400 bg-[linear-gradient(135deg,#123cba_0%,#071535_74%)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <ButtonLink href="/marketplace" icon={ArrowLeft} variant="secondary">
            Volver al marketplace
          </ButtonLink>
          <div className={`mt-10 grid h-16 w-16 place-items-center rounded-full ${currentCopy.className}`}>
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-4xl font-black sm:text-6xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100">{currentCopy.message}</p>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-300">
              Estado en NexoTCG
            </p>
            <p className="mt-2 text-blue-100">
              {order
                ? `Orden ${order.id.slice(0, 8)} | Estado: ${order.status}`
                : "Si Mercado Pago tarda en avisar, refrescá esta página en unos minutos."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {order ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 text-sm font-black text-blue-950 transition hover:bg-yellow-300"
                href={`/listings/${order.listing_id}`}
              >
                <ShoppingBag className="h-4 w-4" />
                Ver publicación
              </Link>
            ) : null}
            <ButtonLink href="/account/notifications" variant="light">
              Ver notificaciones
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}

