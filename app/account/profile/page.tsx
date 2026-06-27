import Link from "next/link";
import { ArrowLeft, Bell, Heart, IdCard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi perfil"
};

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

  const completedFields = [
    profile.display_name,
    profile.city,
    profile.country,
    profile.bio,
    profile.whatsapp || profile.instagram
  ].filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / 5) * 100);

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MI PERFIL</p>
            </div>
          </Link>
          <div className="flex gap-2">
            <Link
              aria-label="Notificaciones"
              className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
              href="/account/notifications"
              title="Notificaciones"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <Link
              aria-label="Mis favoritos"
              className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
              href="/account/favorites"
              title="Mis favoritos"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              aria-label="Mis publicaciones"
              className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
              href="/account/listings"
              title="Mis publicaciones"
            >
              <ListChecks className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_82%_0%,rgba(250,204,21,.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-yellow-300"
          href="/account"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mi cuenta
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <section>
            <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-yellow-300 bg-blue-950 text-yellow-300">
              <IdCard className="h-8 w-8" />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-yellow-300">
              Cuenta de vendedor
            </p>
            <h1 className="mt-2 text-4xl font-black text-white">Mi perfil</h1>
            <p className="mt-4 leading-7 text-blue-100">
              Estos datos ayudan a generar confianza y permiten que los compradores
              se comuniquen contigo.
            </p>
            {profile.is_verified ? (
              <p className="mt-5 inline-flex rounded-full bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">
                Perfil verificado
              </p>
            ) : null}
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-white">Perfil completo</p>
                <p className="text-sm font-black text-yellow-300">{profileCompletion}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-950">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-semibold leading-5 text-blue-100">
                Nombre, ubicación, presentación y contacto ayudan a que otros usuarios
                confíen antes de escribirte.
              </p>
            </div>
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
      </section>
    </main>
  );
}
