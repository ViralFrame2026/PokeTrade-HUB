import {
  ArrowLeft,
  CalendarClock,
  Gift,
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
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
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
        <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-[linear-gradient(145deg,#1d4ed8,#10245e)]">
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

        <aside className="rounded-lg border border-blue-100 bg-white p-6 shadow-[0_18px_48px_rgba(30,64,175,0.12)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
            Premio de la comunidad
          </p>
          <h1 className="mt-3 text-3xl font-black text-blue-950">{raffle.title}</h1>
          <p className="mt-3 text-lg font-bold text-blue-700">{raffle.prize}</p>

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
            <Meta icon={ShieldCheck} text="Revisado por moderacion" />
          </div>

          <div className="mt-6 border-y border-blue-100 py-5">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-blue-800">
              Requisitos
            </h2>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
              {raffle.requirements}
            </p>
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-500">
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
              <div className="rounded-lg bg-slate-100 p-4 text-center font-black text-slate-600">
                El sorteo finalizo. El resultado está pendiente.
              </div>
            ) : isCreator ? (
              <div className="rounded-lg bg-blue-50 p-4 text-center font-black text-blue-800">
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
    <p className="flex items-center gap-3 text-sm font-semibold text-slate-600">
      <Icon className="h-5 w-5 shrink-0 text-blue-600" />
      {text}
    </p>
  );
}
