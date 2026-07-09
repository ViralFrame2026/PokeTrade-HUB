import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Heart,
  Handshake,
  Info,
  ListChecks,
  LockKeyhole,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  UserRound,
  WalletCards
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { SiteMenu } from "@/components/site-menu";
import { SignOutButton } from "@/components/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel de cuenta"
};

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

function accountNextStep({
  hasListings,
  isVerified,
  pendingAttention,
  unreadMessages,
  unreadNotifications
}: {
  hasListings: boolean;
  isVerified: boolean;
  pendingAttention: number;
  unreadMessages: number;
  unreadNotifications: number;
}) {
  if (pendingAttention > 0) {
    return {
      href: "/account/listings",
      icon: ShieldCheck,
      label: "Revisar publicaciones",
      text: "Tenés publicaciones que requieren atención de moderación. Resolverlas ayuda a que vuelvan al marketplace."
    };
  }
  if (unreadMessages > 0) {
    return {
      href: "/account/messages",
      icon: MessageCircle,
      label: "Responder mensajes",
      text: "Hay conversaciones sin leer. Responder rápido aumenta la confianza y mejora tus chances de cerrar operaciones."
    };
  }
  if (unreadNotifications > 0) {
    return {
      href: "/account/notifications",
      icon: Bell,
      label: "Ver notificaciones",
      text: "Tenés actividad nueva en tu cuenta. Revisala para no perder aprobaciones, mensajes o avisos importantes."
    };
  }
  if (!isVerified) {
    return {
      href: "/account/profile",
      icon: UserRound,
      label: "Mejorar perfil",
      text: "Completá tu perfil y mantené operaciones claras para construir una reputación más confiable."
    };
  }
  if (!hasListings) {
    return {
      href: "/publish",
      icon: Store,
      label: "Publicar primer producto",
      text: "Todavía no tenés publicaciones. Publicá una carta, producto sellado o accesorio y envialo a revisión."
    };
  }
  return {
    href: "/marketplace",
    icon: CheckCircle2,
    label: "Cuenta al día",
    text: "Tu cuenta no tiene tareas urgentes. Podés explorar productos, crear un sorteo o publicar algo nuevo."
  };
}

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
      .in("status", ["sold", "traded", "finished"])
      .or(`completed_with_id.eq.${user.id},seller_id.eq.${user.id}`),
    supabase
      .from("raffles")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", user.id)
  ]);

  const profile = profileResult.data as ProfileRow | null;

  if (!profile) redirect("/");

  const pendingAttentionCount = pendingListingsResult.count ?? 0;
  const unreadMessagesCount = unreadMessagesResult.count ?? 0;
  const unreadNotificationsCount = unreadNotificationsResult.count ?? 0;
  const nextStep = accountNextStep({
    hasListings: (listingsResult.count ?? 0) > 0,
    isVerified: profile.is_verified,
    pendingAttention: pendingAttentionCount,
    unreadMessages: unreadMessagesCount,
    unreadNotifications: unreadNotificationsCount
  });
  const NextStepIcon = nextStep.icon;

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
      label: "Requieren atención",
      tone: "yellow",
      value: pendingAttentionCount
    },
    {
      href: "/account/messages",
      icon: MessageCircle,
      label: "Mensajes sin leer",
      tone: "red",
      value: unreadMessagesCount
    },
    {
      href: "/account/notifications",
      icon: Bell,
      label: "Notificaciones",
      tone: "red",
      value: unreadNotificationsCount
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
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu
              badges={{
                listings: pendingAttentionCount,
                messages: unreadMessagesCount,
                notifications: unreadNotificationsCount
              }}
              showAdmin={profile.is_admin}
            />
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
            <ButtonLink href="/publish" icon={Store} size="sm">
              Publicar
            </ButtonLink>
            <SignOutButton />
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_68%)]">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-yellow-300/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                <Sparkles className="h-4 w-4" />
                Centro de entrenador
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
                Hola, {profile.display_name}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
                Gestiona publicaciones, mensajes, operaciones, sorteos y reputación desde
                un solo lugar, con señales claras para vender e intercambiar mejor.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/publish" icon={Store}>
                  Publicar producto
                </ButtonLink>
                <ButtonLink href="/account/messages" icon={MessagesSquare} variant="secondary">
                  Ver mensajes
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-yellow-300">
                <UserRound className="h-4 w-4" />
                Reputación
              </p>
              <p className="mt-3 text-5xl font-black">
                {Number(profile.reputation_average ?? 0).toFixed(1)}
              </p>
              <p className="mt-1 text-sm font-bold text-blue-100">
                {profile.reputation_count} valoraciones
              </p>
              <div className="mt-5 rounded-lg border border-white/10 bg-blue-950/35 p-4">
                <p className="text-sm font-bold text-blue-100">
                  {profile.is_verified
                    ? "Perfil verificado por NexoTCG."
                    : "Completa tu perfil y cierra operaciones para ganar confianza."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-lg border border-yellow-300/30 bg-yellow-400/10 p-5 shadow-[0_18px_45px_rgba(0,0,0,.16)]">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
              <Info className="h-4 w-4" />
              Próximo paso recomendado
            </p>
            <h2 className="mt-3 flex items-center gap-2 text-xl font-black text-white">
              <NextStepIcon className="h-5 w-5 text-yellow-300" />
              {nextStep.label}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
              {nextStep.text}
            </p>
          </div>
          <ButtonLink href={nextStep.href} icon={NextStepIcon}>
            Continuar
          </ButtonLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <AccountCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <QuickLink href="/account/profile" icon={UserRound} label="Editar perfil" />
          <QuickLink href="/account/payments" icon={WalletCards} label="Pagos y cobros" />
          <QuickLink href={`/users/${user.id}`} icon={UserRound} label="Ver perfil público" />
          <QuickLink href="/account/password" icon={LockKeyhole} label="Cambiar contraseña" />
          <QuickLink href="/raffles/new" icon={Trophy} label="Crear sorteo" />
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
    blue: "border-blue-400/25 bg-blue-950/70 text-blue-100",
    green: "border-emerald-300/30 bg-emerald-950/40 text-emerald-100",
    red: "border-red-300/30 bg-red-950/40 text-red-100",
    yellow: "border-yellow-300/40 bg-yellow-400/12 text-yellow-100"
  };
  const tone = stat.tone ?? "blue";

  return (
    <Link
      className={`rounded-lg border p-5 shadow-[0_18px_45px_rgba(0,0,0,.18)] transition hover:-translate-y-1 hover:border-yellow-300/70 hover:bg-blue-900 ${colors[tone]}`}
      href={stat.href}
    >
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-yellow-300">
        <stat.icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-4xl font-black text-white">{stat.value}</p>
      <p className="mt-1 text-sm font-black text-blue-100">{stat.label}</p>
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
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 font-black text-white shadow-[0_18px_45px_rgba(0,0,0,.16)] transition hover:border-yellow-300/60 hover:bg-white/10"
      href={href}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-yellow-400 text-blue-950">
        <Icon className="h-5 w-5" />
      </span>
      {label}
    </Link>
  );
}
