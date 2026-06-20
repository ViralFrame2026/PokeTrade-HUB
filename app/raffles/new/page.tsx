import { ArrowLeft, Gift, ShieldCheck, Users } from "lucide-react";
import { RaffleForm } from "@/components/raffle-form";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Crear Sorteo"
};

export default function NewRafflePage() {
  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_82%_0%,rgba(250,204,21,.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <ButtonLink href="/raffles" icon={ArrowLeft} variant="secondary">
            Volver a sorteos
          </ButtonLink>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-yellow-300/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
            <Gift className="h-4 w-4" />
            Comunidad
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Crear sorteo gratuito
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
            Publica un premio para la comunidad. Todos los sorteos pasan por moderación antes de recibir participantes.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <section>
          <div className="mt-8 grid gap-3">
            <Info icon={Gift} text="Describe claramente el premio" />
            <Info icon={Users} text="Define fecha y límite de participantes" />
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
