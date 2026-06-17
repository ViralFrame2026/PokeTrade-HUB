import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Heart,
  Handshake,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  Store,
  Trophy,
  UserRound
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { SignOutButton } from "@/components/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProfileRow = {
  display_name: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_verified: boolean;
  reputation_average: number;
  reputation_count: number;
};

type DashboardStat = {
  href: string;
  icon: typeof Store;
  label: string;
  tone?: "blue" | "green" | "red" | "yellow";
  value: number | string;
};

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const [
    profileResult,
    listingsResult,
    pendingListingsResult,
    unreadMessagesResult,
    unreadNotificationsResult,
    favoritesResult,
    operationsResult,
    rafflesResult
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, is_admin, is_super_admin, is_verified, reputation_average, reputation_count"
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .in("moderation_status", ["pending", "changes_requested", "rejected"]),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("completed_with_id", user.id)
      .in("status", ["sold", "traded", "finished"]),
    supabase
      .from("raffles")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", user.id)
  ]);

  const profile = profileResult.data as ProfileRow | null;

  if (!profile) redirect("/");

  const stats: DashboardStat[] = [
    {
      href: "/account/listings",
      icon: ListChecks,
      label: "Mis publicaciones",
      value: listingsResult.count ?? 0
    },
    {
      href: "/account/listings",
      icon: ShieldCheck,
      label: "Requieren atencion",
      tone: "yellow",
      value: pendingListingsResult.count ?? 0
    },
    {
      href: "/account/messages",
      icon: MessageCircle,
      label: "Mensajes sin leer",
      tone: "red",
      value: unreadMessagesResult.count ?? 0
    },
    {
      href: "/account/notifications",
      icon: Bell,
      label: "Notificaciones",
      tone: "red",
      value: unreadNotificationsResult.count ?? 0
    },
    {
      href: "/account/operations",
      icon: Handshake,
      label: "Operaciones cerradas",
      tone: "green",
      value: operationsResult.count ?? 0
    },
    {
      href: "/account/favorites",
      icon: Heart,
      label: "Favoritos",
      value: favoritesResult.count ?? 0
    },
    {
      href: "/account/raffles",
      icon: Trophy,
      label: "Mis sorteos",
      tone: "yellow",
      value: rafflesResult.count ?? 0
    }
  ];

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MI CUENTA</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ButtonLink href="/publish" icon={Store} size="sm">
              Publicar
            </ButtonLink>
            <SignOutButton />
          </div>
        </nav>
      </header>

      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-red-500">
                Centro de cuenta
              </p>
              <h1 className="mt-2 text-4xl font-black text-blue-950">
                Hola, {profile.display_name}
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Revisa tus publicaciones, mensajes, operaciones, sorteos y perfil desde un
                solo lugar.
              </p>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-950">
              <p className="flex items-center gap-2 text-sm font-black">
                <UserRound className="h-4 w-4 text-blue-700" />
                Reputacion
              </p>
              <p className="mt-2 text-3xl font-black">
                {Number(profile.reputation_average ?? 0).toFixed(1)}
              </p>
              <p className="text-xs font-bold text-slate-500">
                {profile.reputation_count} valoraciones
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <AccountCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <QuickLink href="/account/profile" icon={UserRound} label="Editar perfil" />
          <QuickLink href="/marketplace" icon={Store} label="Explorar marketplace" />
          {profile.is_admin ? (
            <QuickLink href="/admin" icon={ShieldCheck} label="Panel administrador" />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function AccountCard({ stat }: { stat: DashboardStat }) {
  const colors = {
    blue: "border-blue-100 bg-white text-blue-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-800"
  };
  const tone = stat.tone ?? "blue";

  return (
    <Link
      className={`rounded-lg border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${colors[tone]}`}
      href={stat.href}
    >
      <stat.icon className="h-6 w-6" />
      <p className="mt-4 text-3xl font-black">{stat.value}</p>
      <p className="mt-1 text-sm font-black">{stat.label}</p>
    </Link>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label
}: {
  href: string;
  icon: typeof Store;
  label: string;
}) {
  return (
    <Link
      className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white p-4 font-black text-blue-950 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
      href={href}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-700 text-white">
        <Icon className="h-5 w-5" />
      </span>
      {label}
    </Link>
  );
}
