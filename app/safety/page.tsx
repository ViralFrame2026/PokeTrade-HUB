import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Handshake,
  MessageCircle,
  PackageSearch,
  ShieldCheck
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Seguridad",
  description:
    "Buenas prácticas para comprar, vender e intercambiar cartas, sellados y accesorios Pokemon TCG en NexoTCG."
};

const safeSteps = [
  {
    icon: ShieldCheck,
    title: "Validá el producto",
    copy: "Las cartas individuales deben enlazarse al catálogo Pokemon TCG. Los sellados y accesorios deben tener fotos reales claras."
  },
  {
    icon: Camera,
    title: "Revisá fotos reales",
    copy: "Para sellados y accesorios, las fotos son obligatorias. Para cartas de alto valor, pedí frente, reverso, bordes y detalles de estado."
  },
  {
    icon: PackageSearch,
    title: "Comprueba el contenido",
    copy: "En ETB, boosters, latas, binders o accesorios, confirmá idioma, expansión, cantidad, estado del empaque y piezas incluidas."
  },
  {
    icon: MessageCircle,
    title: "Dejá acuerdos por mensaje",
    copy: "Coordiná precio, estado, zona, entrega, envío y condiciones dentro de la conversación para mantener un registro."
  },
  {
    icon: CheckCircle2,
    title: "Revisá reputación",
    copy: "Mirá perfil, valoraciones, historial y comportamiento antes de comprar, vender, intercambiar o entregar productos."
  },
  {
    icon: Handshake,
    title: "Confirmá antes de cerrar",
    copy: "Marcá una operación como vendida, intercambiada o finalizada solo cuando realmente haya sido concretada."
  }
];

const redFlags = [
  "Precio demasiado bajo sin explicación clara.",
  "Fotos borrosas, recortadas o iguales a imágenes de internet.",
  "Negativa a mostrar fotos reales cuando el producto lo amerita.",
  "Sellados con dudas de apertura, re-sellado o contenido incompleto.",
  "Presión para salir de la plataforma de inmediato.",
  "Cambios de precio o condiciones después de acordar.",
  "Perfiles nuevos con comportamiento insistente o datos inconsistentes."
];

const checklist = [
  "Compará nombre, expansión, número y rareza en cartas individuales.",
  "Pedí fotos con buena luz y algún detalle que confirme que el producto está en mano.",
  "No entregues productos o dinero si las condiciones cambiaron a último momento.",
  "Usá reportes si ves falsificaciones, datos manipulados o actividad sospechosa."
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
            NexoTCG ordena publicaciones, mensajes, reputación y reportes. Aún así,
            cada acuerdo entre usuarios requiere criterio, confirmación y cuidado.
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
                <h2 className="text-xl font-black">Señales de alerta</h2>
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
            <h2 className="text-xl font-black">Checklist antes de cerrar</h2>
            <div className="mt-4 space-y-3">
              {checklist.map((item) => (
                <p className="flex gap-2 text-sm font-semibold leading-6 text-blue-100" key={item}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                  {item}
                </p>
              ))}
            </div>
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

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-xl font-black">Moderación y control</h2>
          <p className="mt-3 max-w-3xl leading-7 text-blue-100">
            Podés eliminar tus publicaciones cuando ya no estén disponibles. Si un reporte
            muestra información falsa, fotos engañadoras, productos re-sellados o actividad
            sospechosa, el equipo puede intervenir para proteger la confianza del marketplace.
          </p>
        </div>
      </section>
    </main>
  );
}
