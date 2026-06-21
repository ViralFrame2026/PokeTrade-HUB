import { AlertCircle, ArrowLeft, Bell, CheckCircle2, Gift, Info, Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MarkAllNotificationsReadButton,
  NotificationLink
} from "@/components/notification-actions";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type NotificationRow = {
  body: string | null;
  created_at: string;
  id: string;
  payload: {
    listing_id?: string;
    raffle_id?: string;
  } | null;
  read_at: string | null;
  title: string;
  type: string;
};

function notificationMeta(type: string) {
  if (type === "listing_approved") {
    return {
      className: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2
    };
  }

  if (type === "listing_rejected") {
    return {
      className: "bg-red-100 text-red-700",
      icon: AlertCircle
    };
  }

  if (
    type === "raffle_won" ||
    type === "raffle_drawn" ||
    type === "rating_received"
  ) {
    return {
      className: "bg-yellow-100 text-amber-700",
      icon: CheckCircle2
    };
  }

  return {
    className: "bg-blue-100 text-blue-700",
    icon: Info
  };
}

function notificationCategory(type: string) {
  if (type.startsWith("listing_")) return "moderation";
  if (type.startsWith("raffle_")) return "raffles";
  if (type === "rating_received") return "reputation";
  return "activity";
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
  const reputationCount = notifications.filter(
    (notification) => notificationCategory(notification.type) === "reputation"
  ).length;

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">NOTIFICACIONES</p>
            </div>
          </Link>
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
              Avisos sobre moderación y actividad de tu cuenta.
            </p>
          </div>
          <MarkAllNotificationsReadButton disabled={unreadCount === 0} />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <SummaryCard icon={Bell} label="Sin leer" value={unreadCount} />
          <SummaryCard icon={CheckCircle2} label="Moderación" value={moderationCount} />
          <SummaryCard icon={Gift} label="Sorteos" value={raffleCount} />
          <SummaryCard icon={Star} label="Reputación" value={reputationCount} />
        </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {notifications.length > 0 ? (
          <div className="mt-8 space-y-3">
            {notifications.map((notification) => {
              const meta = notificationMeta(notification.type);
              const Icon = meta.icon;
              const listingId = notification.payload?.listing_id;
              const raffleId = notification.payload?.raffle_id;
              const href =
                notification.type === "rating_received" && listingId
                  ? `/listings/${listingId}`
                  : ["raffle_approved", "raffle_won", "raffle_drawn"].includes(
                  notification.type
                ) && raffleId
                  ? `/raffles/${raffleId}`
                  : notification.type === "listing_approved" && listingId
                  ? `/listings/${listingId}`
                  : notification.type.startsWith("raffle_")
                    ? "/raffles"
                    : "/account/listings";

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
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${meta.className}`}>
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
                      <NotificationLink href={href} notificationId={notification.id}>
                        {notification.type === "rating_received"
                          ? "Ver valoración"
                          : ["raffle_approved", "raffle_won", "raffle_drawn"].includes(
                          notification.type
                        )
                          ? "Ver sorteo"
                          : notification.type === "listing_approved"
                            ? "Ver publicación"
                            : notification.type.startsWith("raffle_")
                              ? "Ver sorteos"
                              : "Ver mis publicaciones"}
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
                cuenta, los avisos importantes aparecerán acá.
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
