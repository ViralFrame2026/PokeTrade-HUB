import { ButtonLink } from "@/components/ui/button-link";
import { AuthForm } from "@/components/auth-form";

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
            Accede para publicar, crear sorteos y construir reputación dentro de
            la comunidad.
          </p>
        </div>
        <AuthForm initialError={initialError} nextPath={nextPath} />
      </section>
    </main>
  );
}
