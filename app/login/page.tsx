import { Bell, Gift, Heart, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Ingresar"
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function safeNextPath(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function safeLoginError(value?: string) {
  if (!value) return null;
  return value.length > 200 ? "No pudimos completar el acceso." : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialError = safeLoginError(params.error);
  const nextPath = safeNextPath(params.next);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(250,204,21,0.18),transparent_28rem),linear-gradient(180deg,#172554,#070a12)] px-4 py-10">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <div className="text-white">
          <ButtonLink href="/" variant="ghost">
            Volver
          </ButtonLink>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
            Cuenta PokeTrade
          </p>
          <h1 className="mt-3 max-w-2xl text-5xl font-black leading-tight">
            Entrá a una comunidad TCG con reputación visible.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-blue-100">
            Publicá cartas, guardá favoritos, recibí mensajes y participá en sorteos
            moderados por la comunidad.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              [Store, "Publicar cartas"],
              [Gift, "Crear sorteos"],
              [Heart, "Guardar favoritos"],
              [MessageCircle, "Recibir mensajes"],
              [ShieldCheck, "Construir reputación"],
              [Bell, "Notificaciones claras"]
            ].map(([Icon, label]) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4" key={label as string}>
                <Icon className="h-5 w-5 text-yellow-300" />
                <p className="mt-3 font-black">{label as string}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass w-full rounded-lg p-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
              Acceso seguro
            </p>
            <h2 className="mt-2 text-4xl font-black text-white">Ingresar</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Usá tu cuenta para operar dentro de PokeTrade HUB.
            </p>
          </div>
          <AuthForm initialError={initialError} nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
