import Link from "next/link";
import { ArrowLeft, IdCard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, city, country, bio, whatsapp, instagram, is_verified")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/");

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MI PERFIL</p>
            </div>
          </Link>
          <Link
            aria-label="Mis publicaciones"
            className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
            href="/account/listings"
            title="Mis publicaciones"
          >
            <ListChecks className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <section>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-700 text-white">
              <IdCard className="h-8 w-8" />
            </div>
            <p className="mt-6 text-sm font-black uppercase text-red-500">Cuenta de vendedor</p>
            <h1 className="mt-2 text-4xl font-black text-blue-950">Mi perfil</h1>
            <p className="mt-4 leading-7 text-slate-600">
              Estos datos ayudan a generar confianza y permiten que los compradores
              se comuniquen contigo.
            </p>
            {profile.is_verified ? (
              <p className="mt-5 inline-flex rounded-full bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">
                Perfil verificado
              </p>
            ) : null}
          </section>

          <ProfileForm
            initial={{
              bio: profile.bio ?? "",
              city: profile.city ?? "",
              country: profile.country ?? "",
              displayName: profile.display_name,
              instagram: profile.instagram ?? "",
              whatsapp: profile.whatsapp ?? ""
            }}
          />
        </div>
      </div>
    </main>
  );
}
