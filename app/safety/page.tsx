import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Handshake,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Seguridad",
  description:
    "Buenas practicas para comprar, vender e intercambiar cartas, sellados y accesorios Pokemon TCG en PokeTrade HUB."
};

const safeSteps = [
  {
    icon: ShieldCheck,
    title: "Valida el producto",
    copy: "Las cartas individuales deben enlazarse al catalogo Pokemon TCG. Los sellados y accesorios deben tener fotos reales claras."
  },
  {
    icon: Camera,
    title: "Pide fotos cuando haga falta",
    copy: "Las fotos reales son obligatorias para sellados y accesorios. Para cartas caras tambien conviene pedir imagenes claras antes de cerrar."
  },
  {
    icon: MessageCircle,
    title: "Deja acuerdos por mensaje",
    copy: "Coordina precio, estado, zona, entrega, envio y condiciones dentro de la conversacion para mantener un registro."
  },
  {
    icon: CheckCircle2,
    title: "Revisa reputacion",
    copy: "Mira perfil, valoraciones, historial y comportamiento antes de comprar, vender, intercambiar o entregar productos."
  },
  {
    icon: Handshake,
    title: "Confirma antes de cerrar",
    copy: "Marca una operacion como vendida, intercambiada o finalizada solo cuando realmente haya sido concretada."
  },
  {
    icon: AlertTriangle,
    title: "Reporta riesgos",
    copy: "Si ves datos falsos, presion sospechosa, fotos enganadoras o intentos de estafa, reporta la publicacion."
  }
];

const redFlags = [
  "Precio demasiado bajo sin explicacion clara.",
  "Presion para salir de la plataforma de inmediato.",
  "Negativa a mostrar fotos reales cuando el producto lo amerita.",
  "Cambios de precio o condiciones despues de acordar.",
  "Perfiles nuevos con comportamiento insistente o datos inconsistentes."
];

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="relative overflow-hidden border-b-8 border-yellow-400 bg-[radial-gradient(circle_at_80%_10%,rgba(250,204,21,0.2),transparent_24rem),linear-gradient(135deg,#123cba_0%,#071535_70%)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <ButtonLink href="/" variant="secondary">
            Volver al inicio
          </ButtonLink>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.24em] text-yellow-300">
            Centro de confianza
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Seguridad para operar con productos Pokemon TCG
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            PokeTrade HUB ordena publicaciones, mensajes, reputacion y reportes. Aun asi,
            cada acuerdo entre usuarios requiere criterio, confirmacion y cuidado.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {safeSteps.map((item) => (
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
          <div className="rounded-lg border border-red-300/40 bg-red-500/12 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-yellow-300" />
              <div>
                <h2 className="text-xl font-black">Senales de alerta</h2>
                <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-blue-100">
                  {redFlags.map((flag) => (
                    <li className="flex gap-2" key={flag}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-300" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-300/40 bg-yellow-400/10 p-6">
            <h2 className="text-xl font-black">Moderacion y control</h2>
            <p className="mt-3 leading-7 text-blue-100">
              Puedes eliminar tus publicaciones cuando ya no esten disponibles. Si un reporte
              muestra informacion falsa, fotos enganadoras o actividad sospechosa, el equipo puede
              intervenir para proteger la confianza del marketplace.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/rules" variant="light">
                Ver reglas
              </ButtonLink>
              <ButtonLink href="/marketplace" variant="blue">
                Explorar marketplace
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
