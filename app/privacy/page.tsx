import {
  Bell,
  Camera,
  Database,
  Eye,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const metadata = {
  title: "Privacidad",
  description: "Resumen de privacidad para usuarios de NexoTCG."
};

const privacyItems = [
  {
    icon: UserCheck,
    title: "Datos de cuenta",
    copy: "Usamos email, nombre visible, avatar, datos de perfil, reputación y permisos para identificarte dentro de la comunidad y habilitar funciones de cuenta."
  },
  {
    icon: Camera,
    title: "Publicaciones y fotos",
    copy: "Guardamos datos de productos, fotos reales, precios, ubicación aproximada, estado, descripción, categorías y estado de moderación de cada publicación."
  },
  {
    icon: MessageCircle,
    title: "Mensajes y operaciones",
    copy: "Conservamos conversaciones, operaciones marcadas como vendidas/intercambiadas/finalizadas y datos necesarios para resolver reportes o disputas."
  },
  {
    icon: Bell,
    title: "Actividad de comunidad",
    copy: "Registramos favoritos, sorteos, participaciones, notificaciones, valoraciones, reportes y acciones relevantes para que el marketplace funcione."
  },
  {
    icon: Eye,
    title: "Moderación y seguridad",
    copy: "El equipo puede revisar contenido reportado, publicaciones sospechosas y acciones administrativas para aplicar reglas y proteger a los usuarios."
  },
  {
    icon: LockKeyhole,
    title: "Servicios externos",
    copy: "La autenticación y base de datos funcionan con Supabase. El despliegue y hosting funcionan con Vercel. Estos servicios procesan datos necesarios para operar la app."
  }
];

const userControls = [
  "Editar datos de perfil visibles en la comunidad.",
  "Eliminar publicaciones propias cuando ya no estén disponibles.",
  "Cambiar contraseña y cerrar sesiones desde la cuenta.",
  "Reportar contenido sospechoso para revisión del equipo."
];

const retentionNotes = [
  "Algunas acciones pueden mantenerse por seguridad, auditoría, prevención de fraude o moderación.",
  "Los mensajes asociados a reportes u operaciones pueden conservarse para resolver problemas de confianza.",
  "No publicamos tu email en el marketplace como dato visible para otros usuarios.",
  "Las solicitudes manuales sobre datos pueden enviarse al soporte temporal mientras no haya dominio propio."
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
            Este resumen explica qué datos usa NexoTCG para operar la plataforma,
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
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {userControls.map((control) => (
              <p className="flex gap-2 text-sm font-semibold leading-6 text-blue-100" key={control}>
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                {control}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Database className="h-5 w-5 text-yellow-300" />
            Conservación de datos
          </h2>
          <div className="mt-4 grid gap-3">
            {retentionNotes.map((note) => (
              <p className="flex gap-2 text-sm font-semibold leading-6 text-blue-100" key={note}>
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                {note}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-yellow-300/30 bg-yellow-400/10 p-6">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Mail className="h-5 w-5 text-yellow-300" />
            Contacto por privacidad
          </h2>
          <p className="mt-3 leading-7 text-blue-100">
            Para consultas sobre privacidad o datos de cuenta, escribí al soporte temporal:
            {" "}
            {SUPPORT_EMAIL}
          </p>
          <div className="mt-5">
            <ButtonLink href={SUPPORT_MAILTO} variant="light">
              Escribir
            </ButtonLink>
          </div>
        </article>
      </section>
    </main>
  );
}
