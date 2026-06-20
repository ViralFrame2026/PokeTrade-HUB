import { CalendarClock, Gift, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { raffles as demoRaffles } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

type RaffleRow = {
  closes_at: string;
  entry_limit: number | null;
  id: string;
  image_path: string | null;
  prize: string;
  profiles: { display_name: string } | { display_name: string }[] | null;
  raffle_entries: Array<{ count: number }>;
  title: string;
};

function creatorName(value: RaffleRow["profiles"]) {
  return Array.isArray(value)
    ? value[0]?.display_name ?? "Entrenador TCG"
    : value?.display_name ?? "Entrenador TCG";
}

export default async function RafflesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffles")
    .select(
      "id, title, prize, image_path, closes_at, entry_limit, raffle_entries(count), profiles!raffles_creator_id_fkey(display_name)"
    )
    .eq("moderation_status", "approved")
    .gt("closes_at", new Date().toISOString())
    .order("closes_at", { ascending: true });
  const raffles = (data ?? []) as RaffleRow[];

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">SORTEOS</p>
            </div>
          </Link>
          <ButtonLink href="/raffles/new" icon={Plus}>
            Crear sorteo
          </ButtonLink>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_10%,rgba(250,204,21,0.22),transparent_26rem),linear-gradient(180deg,#172554,#0f172a)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
          Premios de la comunidad
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">Sorteos activos</h1>
        <p className="mt-3 max-w-2xl text-blue-100">
          Participá en eventos moderados por la comunidad o creá el primero para activar nuevos coleccionistas.
        </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {raffles.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {raffles.map((raffle) => {
              const entryCount = raffle.raffle_entries[0]?.count ?? 0;
              const capacityLabel = raffle.entry_limit
                ? `${entryCount}/${raffle.entry_limit} participantes`
                : `${entryCount} participante${entryCount === 1 ? "" : "s"}`;

              return (
                <article
                  className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_12px_35px_rgba(30,64,175,0.10)]"
                  key={raffle.id}
                >
                <div className="relative aspect-[16/10] bg-[linear-gradient(145deg,#1d4ed8,#10245e)]">
                  {raffle.image_path ? (
                    <Image
                      alt={raffle.prize}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={raffle.image_path}
                      unoptimized
                    />
                  ) : (
                    <Gift className="absolute inset-0 m-auto h-20 w-20 text-yellow-300" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-red-500">
                    Sorteo gratuito
                  </p>
                  <h2 className="mt-2 text-xl font-black text-blue-950">{raffle.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{raffle.prize}</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <p className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-blue-600" />
                      Cierra{" "}
                      {new Intl.DateTimeFormat("es-AR", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(new Date(raffle.closes_at))}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      {capacityLabel}
                    </p>
                  </div>
                  <p className="mt-4 text-xs font-bold text-slate-400">
                    Organiza {creatorName(raffle.profiles)}
                  </p>
                  <Link
                    className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-3 font-black text-white transition hover:bg-blue-800"
                    href={`/raffles/${raffle.id}`}
                  >
                    Ver sorteo
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <>
          <div className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-6 text-center">
            <div>
              <Gift className="mx-auto h-11 w-11 text-yellow-300" />
              <h2 className="mt-4 text-xl font-black text-white">
                Todavía no hay sorteos activos
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-slate-300">
                Podés crear el primero para la comunidad. Mientras tanto, estos ejemplos muestran cómo se verán los eventos.
              </p>
              <ButtonLink href="/raffles/new" icon={Plus}>
                Crear sorteo
              </ButtonLink>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {demoRaffles.map((raffle) => (
              <article
                className="rounded-lg border border-white/10 bg-slate-950/88 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.22)]"
                key={raffle.title}
              >
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-blue-950">
                  Ejemplo visual
                </span>
                <h2 className="mt-4 text-xl font-black text-white">{raffle.title}</h2>
                <p className="mt-2 text-sm font-semibold text-yellow-200">{raffle.type}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">{raffle.requirements}</p>
                <div className="mt-5 flex items-center justify-between gap-3 text-sm font-bold text-blue-100">
                  <span>{raffle.endsIn}</span>
                  <span>{raffle.entries} participantes</span>
                </div>
              </article>
            ))}
          </div>
          </>
        )}
      </section>
    </main>
  );
}
