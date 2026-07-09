import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  ShieldCheck,
  Store,
  WalletCards
} from "lucide-react";
import { PaymentMethodsForm } from "@/components/payment-methods-form";
import { SiteMenu } from "@/components/site-menu";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pagos y cobros"
};

type ProfileRow = {
  display_name: string;
  is_admin: boolean;
  payment_alias: string | null;
  payment_cvu: string | null;
  payment_holder_name: string | null;
  payment_notes: string | null;
  payment_updated_at: string | null;
};

type CommissionRow = {
  commission_amount: number | null;
  created_at: string;
  gross_amount: number | null;
  id: string;
  seller_net_amount: number | null;
  status: string;
  listings: { title: string } | { title: string }[] | null;
};

function moneyLabel(value: number) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function listingTitle(listing: CommissionRow["listings"]) {
  if (Array.isArray(listing)) {
    return listing[0]?.title ?? "Venta registrada";
  }

  return listing?.title ?? "Venta registrada";
}

function statusLabel(status: string) {
  return {
    invoiced: "Facturada",
    paid: "Pagada",
    pending: "Pendiente",
    waived: "Perdonada"
  }[status] ?? status;
}

export default async function AccountPaymentsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/payments");

  const [profileResult, commissionsResult, listingsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, is_admin, payment_alias, payment_cvu, payment_holder_name, payment_notes, payment_updated_at"
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("sale_commissions")
      .select("id, gross_amount, commission_amount, seller_net_amount, status, created_at, listings!sale_commissions_listing_id_fkey(title)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("moderation_status", "approved")
      .eq("type", "sale")
  ]);

  const profile = profileResult.data as ProfileRow | null;
  if (!profile) redirect("/");

  const commissions = !commissionsResult.error
    ? ((commissionsResult.data ?? []) as CommissionRow[])
    : [];
  const pendingTotal = commissions
    .filter((commission) => commission.status === "pending" || commission.status === "invoiced")
    .reduce((total, commission) => total + Number(commission.commission_amount ?? 0), 0);
  const paidTotal = commissions
    .filter((commission) => commission.status === "paid")
    .reduce((total, commission) => total + Number(commission.commission_amount ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu showAdmin={profile.is_admin} />
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.2em] text-yellow-300">
                  NexoTCG
                </p>
                <p className="truncate text-xs font-bold text-blue-100">PAGOS Y COBROS</p>
              </div>
            </Link>
          </div>
          <ButtonLink href="/publish" icon={Store} size="sm">
            Publicar
          </ButtonLink>
        </nav>
      </header>

      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#123cba,#071535)]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
            href="/account"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mi cuenta
          </Link>
          <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-yellow-300/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                <WalletCards className="h-4 w-4" />
                Cobro directo vendedor
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                Pagos y comisiones de tu cuenta
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
                Configura como queres cobrar tus ventas. Las comisiones de NexoTCG se
                registran cuando una operacion se marca como cerrada.
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
                Estado de cobro
              </p>
              <p className="mt-3 flex items-center gap-2 text-lg font-black text-white">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                {profile.payment_alias || profile.payment_cvu
                  ? "Metodos cargados"
                  : "Completa tus datos"}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-blue-100">
                {profile.payment_updated_at
                  ? `Actualizado el ${new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(profile.payment_updated_at))}.`
                  : "Todavia no guardaste instrucciones de cobro."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <PaymentMethodsForm
          initialValues={{
            paymentAlias: profile.payment_alias ?? "",
            paymentCvu: profile.payment_cvu ?? "",
            paymentHolderName: profile.payment_holder_name ?? "",
            paymentNotes: profile.payment_notes ?? ""
          }}
        />

        <aside className="space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
              Resumen vendedor
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <SummaryItem
                icon={Store}
                label="Publicaciones de venta"
                value={String(listingsResult.count ?? 0)}
              />
              <SummaryItem
                icon={Clock3}
                label="Comisiones pendientes"
                value={moneyLabel(pendingTotal)}
              />
              <SummaryItem
                icon={DollarSign}
                label="Comisiones pagadas"
                value={moneyLabel(paidTotal)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-yellow-300/30 bg-yellow-400/10 p-5">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-yellow-300">
              <ShieldCheck className="h-4 w-4" />
              Como funciona
            </p>
            <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-blue-100">
              <li>El comprador conversa con vos y acuerdan entrega, estado y precio.</li>
              <li>Vos compartis tu metodo de cobro por mensaje cuando corresponda.</li>
              <li>NexoTCG registra la comision de la venta cerrada para control interno.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-blue-100">
              <FileText className="h-4 w-4 text-yellow-300" />
              Ultimas comisiones
            </p>
            {commissions.length > 0 ? (
              <div className="mt-4 divide-y divide-white/10">
                {commissions.map((commission) => (
                  <article className="py-3" key={commission.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{listingTitle(commission.listings)}</p>
                        <p className="mt-1 text-xs font-semibold text-blue-100">
                          {statusLabel(commission.status)}
                        </p>
                      </div>
                      <p className="text-right font-black text-yellow-300">
                        {moneyLabel(Number(commission.commission_amount ?? 0))}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold leading-6 text-blue-100">
                Todavia no hay comisiones registradas para tu cuenta.
              </p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Store;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-blue-950/40 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-yellow-400 text-blue-950">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-blue-100">{label}</p>
    </div>
  );
}
