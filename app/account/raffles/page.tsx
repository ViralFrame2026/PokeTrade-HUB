import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  Gift,
  Plus,
  Trophy,
  Users
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DrawRaffleWinnerButton } from "@/components/draw-raffle-winner-button";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RaffleRow = {
  closes_at: string;
  created_at: string;
  drawn_at: string | null;
  id: string;
  moderation_status: string;
  prize: string;
  raffle_entries: Array<{ count: number }>;
  rejection_reason: string | null;
  title: string;
  winner: { display_name: string } | { display_name: string }[] | null;
  winner_id: string | null;
};

function moderationMeta(status: string) {
  if (status === "approved") {
    return {
      className: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
      label: "Aprobado"
    };
  }
  if (status === "rejected") {
    return {
      className: "bg-red-100 text-red-700",
      icon: AlertCircle,
      label: "Rechazado"
    };
  }
  return {
    className: "bg-blue-100 text-blue-700",
    icon: Clock3,
    label: "En revision"
  };
}

function winnerName(value: RaffleRow["winner"]) {
  return Array.isArray(value) ? value[0]?.display_name : value?.display_name;
}

export default async function MyRafflesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/raffles");

  const { data } = await supabase
    .from("raffles")
    .select(
      "id, title, prize, closes_at, created_at, moderation_status, rejection_reason, winner_id, drawn_at, raffle_entries(count), winner:profiles!raffles_winner_id_fkey(display_name)"
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });
  const raffles = (data ?? []) as RaffleRow[];
  const approved = raffles.filter((raffle) => raffle.moderation_status === "approved").length;
  const pending = raffles.filter((raffle) => raffle.moderation_status === "pending").length;
  const closed = raffles.filter(
    (raffle) => new Date(raffle.closes_at).getTime() <= Date.now()
  ).length;
  const withWinner = raffles.filter((raffle) => Boolean(raffle.winner_id)).length;

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MIS SORTEOS</p>
            </div>
          </Link>
          <ButtonLink href="/raffles/new" icon={Plus}>
            Crear
          </ButtonLink>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
          href="/raffles"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver sorteos públicos
        </Link>
        <h1 className="mt-5 text-4xl font-black text-blue-950">Mis sorteos</h1>
        <p className="mt-2 text-slate-600">
          Controla la moderacion, participantes y selección del ganador.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total creados" value={raffles.length} />
          <SummaryCard label="En revision" value={pending} variant="blue" />
          <SummaryCard label="Aprobados" value={approved} variant="green" />
          <SummaryCard
            label={withWinner > 0 ? "Con ganador" : "Finalizados"}
            value={withWinner > 0 ? withWinner : closed}
            variant={withWinner > 0 ? "yellow" : "slate"}
          />
        </div>

        {raffles.length ? (
          <div className="mt-8 space-y-4">
            {raffles.map((raffle) => {
              const meta = moderationMeta(raffle.moderation_status);
              const StatusIcon = meta.icon;
              const entryCount = raffle.raffle_entries[0]?.count ?? 0;
              const isClosed = new Date(raffle.closes_at).getTime() <= Date.now();
              const selectedWinner = winnerName(raffle.winner);

              return (
                <article
                  className="grid gap-5 rounded-lg border border-blue-100 bg-white p-5 shadow-sm lg:grid-cols-[1fr_230px] lg:items-center"
                  key={raffle.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${meta.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-amber-800">
                        Gratuito
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-black text-blue-950">{raffle.title}</h2>
                    <p className="mt-1 font-semibold text-blue-700">{raffle.prize}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-blue-600" />
                        {isClosed ? "Finalizado" : "Cierra"}{" "}
                        {new Intl.DateTimeFormat("es-AR", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        }).format(new Date(raffle.closes_at))}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        {entryCount} participante{entryCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    {selectedWinner ? (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 font-black text-amber-800">
                        <Trophy className="h-5 w-5" />
                        Ganador: {selectedWinner}
                      </div>
                    ) : null}
                    {raffle.rejection_reason ? (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        <strong>Revision:</strong> {raffle.rejection_reason}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    {raffle.moderation_status === "approved" ? (
                      <Link
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-3 text-sm font-black text-blue-800 transition hover:bg-blue-50"
                        href={`/raffles/${raffle.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        Ver sorteo
                      </Link>
                    ) : null}
                    {raffle.moderation_status === "approved" &&
                    isClosed &&
                    !raffle.winner_id ? (
                      <DrawRaffleWinnerButton
                        disabled={entryCount === 0}
                        raffleId={raffle.id}
                      />
                    ) : null}
                    {raffle.moderation_status === "approved" &&
                    isClosed &&
                    !raffle.winner_id &&
                    entryCount === 0 ? (
                      <p className="text-center text-xs font-semibold text-slate-500">
                        No hay participantes para sortear.
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 grid min-h-72 place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 text-center">
            <div>
              <Gift className="mx-auto h-11 w-11 text-blue-500" />
              <h2 className="mt-4 text-xl font-black text-blue-950">
                Todavia no creaste sorteos
              </h2>
              <p className="mt-2 text-slate-600">
                Crea uno gratuito y envialo a moderacion.
              </p>
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
  variant?: "blue" | "green" | "slate" | "yellow";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    yellow: "border-yellow-300 bg-yellow-50 text-amber-800"
  };

  return (
    <div className={`rounded-lg border p-5 ${colors[variant]}`}>
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold">{label}</p>
    </div>
  );
}
