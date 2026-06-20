import { Gift, ShieldCheck, Users } from "lucide-react";
import { RaffleForm } from "@/components/raffle-form";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Crear Sorteo"
};

export default function NewRafflePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ButtonLink href="/raffles" variant="ghost">
        Volver a sorteos
      </ButtonLink>
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
            Comunidad
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">Crear sorteo gratuito</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Publica un premio para la comunidad. Todos los sorteos pasan por
            moderación antes de recibir participantes.
          </p>
          <div className="mt-8 grid gap-3">
            <Info icon={Gift} text="Describe claramente el premio" />
            <Info icon={Users} text="Define fecha y limite de participantes" />
            <Info icon={ShieldCheck} text="El equipo revisa el sorteo antes de publicarlo" />
          </div>
        </section>
        <RaffleForm />
      </div>
    </main>
  );
}

function Info({ icon: Icon, text }: { icon: typeof Gift; text: string }) {
  return (
    <div className="glass flex items-center gap-3 rounded-lg p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pokemonYellow text-slate-950">
        <Icon className="h-4 w-4" />
      </span>
      <span className="font-semibold text-white">{text}</span>
    </div>
  );
}
