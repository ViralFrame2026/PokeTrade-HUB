import { Mail } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Ingresar"
};

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl place-items-center px-4 py-10">
      <section className="glass w-full max-w-md rounded-lg p-6">
        <ButtonLink href="/" variant="ghost">
          Volver
        </ButtonLink>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
            Cuenta
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">Ingresar</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Formulario preparado para Supabase Auth. Conecta la accion del
            formulario a `createSupabaseBrowserClient().auth.signInWithOtp()` o
            email/password segun la configuracion elegida.
          </p>
        </div>
        <form className="mt-6">
          <label className="text-sm font-bold text-slate-200">
            Email
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white outline-none focus:border-pokemonYellow/60"
                placeholder="tu@email.com"
                type="email"
              />
            </div>
          </label>
          <button
            className="mt-5 w-full rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950"
            type="button"
          >
            Continuar
          </button>
        </form>
      </section>
    </main>
  );
}
