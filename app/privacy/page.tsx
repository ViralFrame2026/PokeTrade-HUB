import { LockKeyhole, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Privacidad",
  description: "Resumen de privacidad para usuarios de PokeTrade HUB."
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="border-b-8 border-yellow-400 bg-[linear-gradient(135deg,#123cba_0%,#071535_74%)]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <ButtonLink href="/" variant="secondary">
            Volver al inicio
          </ButtonLink>
          <div className="mt-10 grid h-14 w-14 place-items-center rounded-full bg-yellow-400 text-blue-950">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-4xl font-black sm:text-6xl">Privacidad</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100">
            Este resumen explica que datos usa PokeTrade HUB para que la plataforma
            funcione. No reemplaza asesoramiento legal profesional.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-12 sm:px-6 lg:px-8">
        {[
          ["Datos de cuenta", "Usamos tu email, nombre visible y datos de perfil para identificarte dentro de la comunidad."],
          ["Publicaciones y mensajes", "Guardamos publicaciones, operaciones, favoritos, notificaciones y mensajes necesarios para operar dentro del marketplace."],
          ["Seguridad", "Podemos revisar contenido reportado o sospechoso para proteger a la comunidad y aplicar reglas."],
          ["Servicios externos", "La autenticación y base de datos funcionan con Supabase. El despliegue funciona con Vercel."]
        ].map(([title, copy]) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6" key={title}>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <ShieldCheck className="h-5 w-5 text-yellow-300" />
              {title}
            </h2>
            <p className="mt-3 leading-7 text-blue-100">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
