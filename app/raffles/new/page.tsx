import { CalendarClock, Gift, Image as ImageIcon, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Crear Sorteo"
};

export default function NewRafflePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ButtonLink href="/" variant="ghost">
        Volver
      </ButtonLink>
      <section className="mt-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
          Sorteos
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">Crear sorteo</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Flujo preparado para sorteo gratuito, pago o por numero con
          participantes, requisitos y fecha de cierre.
        </p>
      </section>
      <form className="glass mt-8 rounded-lg p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Premio", Gift, "Nombre del premio"],
            ["Fecha de cierre", CalendarClock, "YYYY-MM-DD HH:mm"],
            ["Participantes", Users, "Limite opcional"],
            ["Imagen", ImageIcon, "URL o archivo en Storage"]
          ].map(([label, Icon, placeholder]) => {
            const FieldIcon = Icon as typeof Gift;
            return (
              <label className="text-sm font-bold text-slate-200" key={label as string}>
                {label as string}
                <div className="relative mt-2">
                  <FieldIcon className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white outline-none focus:border-pokemonYellow/60"
                    placeholder={placeholder as string}
                  />
                </div>
              </label>
            );
          })}
        </div>
        <label className="mt-4 block text-sm font-bold text-slate-200">
          Requisitos
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
            placeholder="Condiciones de participacion"
          />
        </label>
        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950"
          type="button"
        >
          <Gift className="h-5 w-5" />
          Enviar sorteo a revision
        </button>
      </form>
    </main>
  );
}
