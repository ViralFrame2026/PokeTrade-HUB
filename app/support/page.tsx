import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Store
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const metadata = {
  title: "Soporte",
  description: "Canal temporal de contacto y ayuda para usuarios de NexoTCG."
};

const supportTopics = [
  {
    icon: Store,
    title: "Publicaciones",
    copy: "Consultas sobre productos en revisión, publicaciones rechazadas, cambios solicitados o eliminación de contenido."
  },
  {
    icon: ShieldCheck,
    title: "Seguridad",
    copy: "Reportes por fotos dudosas, productos sospechosos, datos inconsistentes o comportamiento inseguro."
  },
  {
    icon: MessageCircle,
    title: "Cuenta y mensajes",
    copy: "Problemas para iniciar sesión, recibir notificaciones, responder mensajes o actualizar el perfil."
  }
];

const beforeWriting = [
  "Incluí tu email de cuenta o nombre visible.",
  "Pegá el enlace de la publicación, sorteo o perfil si aplica.",
  "Explicá qué pasó y adjuntá capturas si ayudan a revisar el caso.",
  "No envíes contraseñas, códigos de acceso ni datos sensibles."
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="border-b-8 border-yellow-400 bg-[radial-gradient(circle_at_75%_15%,rgba(250,204,21,0.2),transparent_24rem),linear-gradient(135deg,#123cba_0%,#071535_74%)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <ButtonLink href="/" variant="secondary">
            Volver al inicio
          </ButtonLink>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.24em] text-yellow-300">
            Ayuda y contacto
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Soporte temporal de NexoTCG
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Hasta conectar dominio propio y correo profesional, este será el canal oficial
            para consultas, reportes y ayuda general.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={SUPPORT_MAILTO} icon={Mail}>
              Escribir a soporte
            </ButtonLink>
            <ButtonLink href="/rules" variant="light">
              Ver reglas
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="rounded-lg border border-yellow-300/50 bg-yellow-400/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Contacto oficial temporal</h2>
              <p className="mt-2 text-blue-100">
                Usá este email mientras dejamos dominio y pagos para la etapa final.
              </p>
            </div>
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-5 py-3 text-sm font-black text-blue-950 transition hover:bg-yellow-300"
              href={SUPPORT_MAILTO}
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </article>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {supportTopics.map((item) => (
            <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6" key={item.title}>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-yellow-400 text-blue-950">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100">{item.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
            <h2 className="text-xl font-black">Antes de escribir</h2>
            <div className="mt-4 grid gap-3">
              {beforeWriting.map((item) => (
                <p className="flex gap-2 text-sm font-semibold leading-6 text-blue-100" key={item}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                  {item}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-red-300/40 bg-red-500/12 p-6">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <AlertTriangle className="h-5 w-5 text-yellow-300" />
              Casos urgentes
            </h2>
            <p className="mt-3 leading-7 text-blue-100">
              Si hay sospecha de fraude, falsificación, presión indebida o datos falsos,
              reportá la publicación desde su ficha y escribí a soporte con el enlace.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

