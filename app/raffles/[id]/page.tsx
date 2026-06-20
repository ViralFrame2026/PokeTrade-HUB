import {
  ArrowLeft,
  CalendarClock,
  Gift,
  Info,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RaffleEntryButton } from "@/components/raffle-entry-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RaffleDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: raffle } = await supabase
    .from("raffles")
    .select(
      "id, creator_id, title, prize, image_path, requirements, closes_at, entry_limit, moderation_status, winner_id, drawn_at, raffle_entries(count), profiles!raffles_creator_id_fkey(display_name), winner:profiles!raffles_winner_id_fkey(display_name)"
    )
    .eq("id", id)
    .eq("moderation_status", "approved")
    .maybeSingle();

  if (!raffle) notFound();

  const creator = Array.isArray(raffle.profiles) ? raffle.profiles[0] : raffle.profiles;
  const winner = Array.isArray(raffle.winner) ? raffle.winner[0] : raffle.winner;
  const { data: entry } = user
    ? await supabase
        .from("raffle_entries")
        .select("id")
        .eq("raffle_id", raffle.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const isClosed = new Date(raffle.closes_at).getTime() <= Date.now();
  const isCreator = user?.id === raffle.creator_id;
  const entryCount = raffle.raffle_entries[0]?.count ?? 0;

  return (
    <main className="min-h-screen bg-[#071535] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/raffles">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-black">Sorteos</span>
          </Link>
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-blue-950">
            GRATUITO
          </span>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-white/15 bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,.20),transparent_28%),linear-gradient(145deg,#123cba,#071535)] shadow-[0_24px_70px_rgba(0,0,0,.32)]">
          <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:36px_36px]" />
          {raffle.image_path ? (
            <Image
              alt={raffle.prize}
              className="object-contain p-6"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              src={raffle.image_path}
              unoptimized
            />
          ) : (
            <Gift className="absolute inset-0 m-auto h-32 w-32 text-yellow-300" />
          )}
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.06] p-6 text-white shadow-[0_18px_48px_rgba(0,0,0,0.22)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
            Premio de la comunidad
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">{raffle.title}</h1>
          <p className="mt-3 text-lg font-bold text-yellow-300">{raffle.prize}</p>

          <div className="mt-6 grid gap-3">
            <Meta
              icon={CalendarClock}
              text={`Cierra ${new Intl.DateTimeFormat("es-AR", {
                dateStyle: "long",
                timeStyle: "short"
              }).format(new Date(raffle.closes_at))}`}
            />
            <Meta
              icon={Users}
              text={
                raffle.entry_limit
                  ? `${entryCount}/${raffle.entry_limit} participantes`
                  : `${entryCount} participante${entryCount === 1 ? "" : "s"}`
              }
            />
            <Meta icon={ShieldCheck} text="Revisado por moderación" />
            <Meta icon={Info} text="Participación gratuita, sin compra obligatoria" />
          </div>

          <div className="mt-6 border-y border-white/10 py-5">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-yellow-300">
              Requisitos
            </h2>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-blue-100">
              {raffle.requirements}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-blue-300/20 bg-blue-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-black text-white">
              <ShieldCheck className="h-5 w-5 text-yellow-300" />
              Transparencia del sorteo
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-blue-100">
              <li>El sorteo fue aprobado antes de recibir participantes.</li>
              <li>No se permiten pagos ni compras obligatorias para participar.</li>
              <li>Cuando se seleccione ganador, quedará visible en esta página.</li>
            </ul>
          </div>

          <p className="mt-5 text-sm font-semibold text-blue-100">
            Organiza {creator?.display_name ?? "Entrenador TCG"}
          </p>
          <div className="mt-6">
            {raffle.winner_id && winner ? (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-5 text-center text-amber-900">
                <Trophy className="mx-auto h-8 w-8 text-yellow-500" />
                <p className="mt-2 text-xs font-black uppercase tracking-[0.14em]">
                  Ganador
                </p>
                <p className="mt-1 text-xl font-black">{winner.display_name}</p>
              </div>
            ) : isClosed ? (
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-center font-black text-blue-100">
                El sorteo finalizó. El resultado está pendiente.
              </div>
            ) : isCreator ? (
              <div className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-4 text-center font-black text-yellow-200">
                Eres el organizador de este sorteo
              </div>
            ) : (
              <RaffleEntryButton
                isAuthenticated={Boolean(user)}
                isEntered={Boolean(entry)}
                raffleId={raffle.id}
              />
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Meta({ icon: Icon, text }: { icon: typeof Gift; text: string }) {
  return (
    <p className="flex items-center gap-3 text-sm font-semibold text-blue-100">
      <Icon className="h-5 w-5 shrink-0 text-yellow-300" />
      {text}
    </p>
  );
}
