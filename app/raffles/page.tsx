import { CalendarClock, Gift, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
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

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-red-500">
          Premios de la comunidad
        </p>
        <h1 className="mt-2 text-4xl font-black text-blue-950">Sorteos activos</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Participa sin costo en sorteos revisados por el equipo de moderacion.
        </p>

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
          <div className="mt-8 grid min-h-72 place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 text-center">
            <div>
              <Gift className="mx-auto h-11 w-11 text-blue-500" />
              <h2 className="mt-4 text-xl font-black text-blue-950">
                No hay sorteos activos
              </h2>
              <p className="mt-2 text-slate-600">Puedes enviar el primero a moderacion.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
