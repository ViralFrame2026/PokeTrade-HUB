import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { PasswordUpdateForm } from "@/components/password-update-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Seguridad de cuenta"
};

export default async function PasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/password");

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/account">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">NexoTCG</p>
              <p className="text-xs font-bold text-blue-100">SEGURIDAD</p>
            </div>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
          href="/account"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mi cuenta
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-700 text-white">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-red-500">
              Seguridad
            </p>
            <h1 className="mt-2 text-4xl font-black text-blue-950">Cambiar contraseña</h1>
            <p className="mt-3 leading-7 text-slate-600">
              Usa una contraseña única y evita compartirla fuera de NexoTCG.
            </p>
          </div>

          <PasswordUpdateForm />
        </div>
      </section>
    </main>
  );
}
