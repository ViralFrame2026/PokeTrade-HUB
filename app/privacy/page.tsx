import { Database, Eye, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Privacidad",
  description: "Resumen de privacidad para usuarios de PokeTrade HUB."
};

const privacyItems = [
  {
    icon: UserCheck,
    title: "Datos de cuenta",
    copy: "Usamos tu email, nombre visible, avatar y datos de perfil para identificarte dentro de la comunidad y permitir funciones de cuenta."
  },
  {
    icon: Database,
    title: "Contenido de la plataforma",
    copy: "Guardamos publicaciones, sorteos, favoritos, mensajes, valoraciones, reportes, notificaciones y operaciones necesarias para que el marketplace funcione."
  },
  {
    icon: Eye,
    title: "Moderacion y seguridad",
    copy: "El equipo puede revisar contenido reportado, publicaciones sospechosas y acciones administrativas para aplicar reglas y proteger a los usuarios."
  },
  {
    icon: LockKeyhole,
    title: "Servicios externos",
    copy: "La autenticacion y base de datos funcionan con Supabase. El despliegue y hosting funcionan con Vercel."
  }
];

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
            Este resumen explica que datos usa PokeTrade HUB para operar la plataforma,
            moderar contenido y mantener funciones de comunidad. No reemplaza asesoramiento
            legal profesional.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-12 sm:px-6 lg:px-8">
        {privacyItems.map((item) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6" key={item.title}>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <item.icon className="h-5 w-5 text-yellow-300" />
              {item.title}
            </h2>
            <p className="mt-3 leading-7 text-blue-100">{item.copy}</p>
          </article>
        ))}

        <article className="rounded-lg border border-yellow-300/40 bg-yellow-400/10 p-6">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <ShieldCheck className="h-5 w-5 text-yellow-300" />
            Control del usuario
          </h2>
          <p className="mt-3 leading-7 text-blue-100">
            Puedes editar tu perfil, cambiar contrasena, eliminar publicaciones propias y
            cerrar sesiones. Algunas acciones quedan registradas para seguridad, auditoria y
            moderacion.
          </p>
        </article>
      </section>
    </main>
  );
}
