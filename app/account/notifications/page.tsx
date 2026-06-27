import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  DollarSign,
  Gift,
  Handshake,
  Info
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MarkAllNotificationsReadButton,
  NotificationLink
} from "@/components/notification-actions";
import { SiteMenu } from "@/components/site-menu";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notificaciones"
};

type NotificationRow = {
  body: string | null;
  created_at: string;
  id: string;
  payload: {
    commission_id?: string;
    listing_id?: string;
    raffle_id?: string;
    report_id?: string;
  } | null;
  read_at: string | null;
  title: string;
  type: string;
};

function notificationMeta(type: string) {
  if (type === "listing_approved" || type === "report_resolved") {
    return { className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };
  }

  if (type === "listing_rejected" || type === "listing_deleted" || type === "raffle_deleted") {
    return { className: "bg-red-100 text-red-700", icon: AlertCircle };
  }

  if (type.startsWith("commission_")) {
    return { className: "bg-emerald-100 text-emerald-700", icon: DollarSign };
  }

  if (type === "operation_completed") {
    return { className: "bg-blue-100 text-blue-700", icon: Handshake };
  }

  if (type === "raffle_won" || type === "raffle_drawn" || type === "rating_received") {
    return { className: "bg-yellow-100 text-amber-700", icon: CheckCircle2 };
  }

  return { className: "bg-blue-100 text-blue-700", icon: Info };
}

function notificationCategory(type: string) {
  if (type.startsWith("listing_")) return "moderation";
  if (type === "raffle_deleted") return "moderation";
  if (type.startsWith("raffle_")) return "raffles";
  if (type === "rating_received") return "reputation";
  if (type === "operation_completed") return "operations";
  if (type.startsWith("commission_")) return "finance";
  if (type === "report_resolved") return "activity";
  return "activity";
}

function notificationTarget(notification: NotificationRow) {
  const listingId = notification.payload?.listing_id;
  const raffleId = notification.payload?.raffle_id;

  if (notification.type === "listing_deleted") {
    return { href: "/account/listings", label: "Entendido" };
  }

  if (notification.type === "raffle_deleted") {
    return { href: "/account/raffles", label: "Entendido" };
  }

  if (notification.type === "operation_completed") {
    return { href: "/account/operations", label: "Ver operacion" };
  }

  if (notification.type === "rating_received" && listingId) {
    return { href: `/listings/${listingId}`, label: "Ver valoracion" };
  }

  if (notification.type.startsWith("commission_")) {
    return { href: "/account/listings", label: "Ver mis publicaciones" };
  }

  if (notification.type === "report_resolved" && listingId) {
    return { href: `/listings/${listingId}`, label: "Ver publicacion" };
  }

  if (["raffle_approved", "raffle_won", "raffle_drawn"].includes(notification.type) && raffleId) {
    return { href: `/raffles/${raffleId}`, label: "Ver sorteo" };
  }

  if (notification.type.startsWith("raffle_")) {
    return { href: "/raffles", label: "Ver sorteos" };
  }

  if (notification.type === "listing_approved" && listingId) {
    return { href: `/listings/${listingId}`, label: "Ver publicacion" };
  }

  return { href: "/account/listings", label: "Ver mis publicaciones" };
}

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/notifications");

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, read_at, payload, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (data ?? []) as NotificationRow[];
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;
  const moderationCount = notifications.filter(
    (notification) => notificationCategory(notification.type) === "moderation"
  ).length;
  const raffleCount = notifications.filter(
    (notification) => notificationCategory(notification.type) === "raffles"
  ).length;
  const operationsCount = notifications.filter((notification) =>
    ["operations", "finance"].includes(notificationCategory(notification.type))
  ).length;

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu badges={{ notifications: unreadCount }} />
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.2em] text-yellow-300">
                  POKETRADE
                </p>
                <p className="truncate text-xs font-bold text-blue-100">NOTIFICACIONES</p>
              </div>
            </Link>
          </div>
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-blue-950">
            {unreadCount} sin leer
          </span>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_82%_0%,rgba(250,204,21,.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
            href="/account"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mi cuenta
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-black text-white">Notificaciones</h1>
              <p className="mt-2 text-blue-100">
                Avisos sobre moderacion y actividad de tu cuenta.
              </p>
            </div>
            <MarkAllNotificationsReadButton disabled={unreadCount === 0} />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <SummaryCard icon={Bell} label="Sin leer" value={unreadCount} />
            <SummaryCard icon={CheckCircle2} label="Moderacion" value={moderationCount} />
            <SummaryCard icon={Gift} label="Sorteos" value={raffleCount} />
            <SummaryCard icon={Handshake} label="Operaciones" value={operationsCount} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {notifications.length > 0 ? (
          <div className="mt-8 space-y-3">
            {notifications.map((notification) => {
              const meta = notificationMeta(notification.type);
              const Icon = meta.icon;
              const target = notificationTarget(notification);

              return (
                <article
                  className={`rounded-lg border p-5 ${
                    notification.read_at
                      ? "border-white/10 bg-white/[0.06]"
                      : "border-yellow-300/60 bg-yellow-400/10 shadow-sm"
                  }`}
                  key={notification.id}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${meta.className}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="font-black text-white">{notification.title}</h2>
                        {!notification.read_at ? (
                          <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black uppercase text-white">
                            Nueva
                          </span>
                        ) : null}
                      </div>
                      {notification.body ? (
                        <p className="mt-2 leading-6 text-blue-100">{notification.body}</p>
                      ) : null}
                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        {new Intl.DateTimeFormat("es-AR", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        }).format(new Date(notification.created_at))}
                      </p>
                      <NotificationLink href={target.href} notificationId={notification.id}>
                        {target.label}
                      </NotificationLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-80 place-items-center rounded-lg border-2 border-dashed border-white/15 bg-white/[0.05] px-6 text-center">
            <div className="max-w-xl">
              <Bell className="mx-auto h-10 w-10 text-yellow-300" />
              <h2 className="mt-4 text-xl font-black text-white">No tienes notificaciones</h2>
              <p className="mt-2 leading-7 text-blue-100">
                Cuando publiques cartas, participes en sorteos o recibas actividad en tu
                cuenta, los avisos importantes apareceran aca.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/publish" variant="light">
                  Publicar carta
                </ButtonLink>
                <ButtonLink href="/raffles" variant="secondary">
                  Ver sorteos
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
  icon: Icon,
  label,
  value
}: {
  icon: typeof Bell;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-[0_18px_45px_rgba(0,0,0,.16)]">
      <Icon className="h-5 w-5 text-yellow-300" />
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-blue-100">
        {label}
      </p>
    </div>
  );
}
