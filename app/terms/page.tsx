import {
  BadgeDollarSign,
  Handshake,
  MegaphoneOff,
  PackageCheck,
  Scale,
  ShieldAlert,
  Store,
  UserCog
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Terminos",
  description: "Condiciones basicas de uso para PokeTrade HUB."
};

const terms = [
  {
    icon: Store,
    title: "Uso de la plataforma",
    copy: "PokeTrade HUB permite publicar, buscar y coordinar operaciones sobre productos Pokemon TCG: cartas individuales, productos sellados, accesorios y sorteos."
  },
  {
    icon: PackageCheck,
    title: "Responsabilidad del usuario",
    copy: "Cada usuario es responsable de la veracidad de sus publicaciones, fotos, estado del producto, precio, mensajes, sorteos, acuerdos y datos de entrega."
  },
  {
    icon: Handshake,
    title: "Operaciones entre usuarios",
    copy: "La plataforma facilita contacto, reputacion, moderacion y organizacion, pero cada comprador y vendedor debe verificar autenticidad, estado, pago, envio y entrega."
  },
  {
    icon: BadgeDollarSign,
    title: "Comisiones y monetizacion",
    copy: "PokeTrade HUB puede registrar comisiones por ventas concretadas, mostrar metricas internas y aplicar condiciones comerciales para sostener la plataforma."
  },
  {
    icon: ShieldAlert,
    title: "Contenido y moderacion",
    copy: "Podemos revisar, rechazar, pausar o eliminar contenido que incumpla reglas, use datos falsos, afecte la confianza o represente riesgo para otros usuarios."
  },
  {
    icon: MegaphoneOff,
    title: "Conductas prohibidas",
    copy: "No se permite publicar falsificaciones, productos re-sellados como nuevos, fotos robadas, spam, amenazas, fraude, presion indebida o acuerdos pensados para evadir seguridad."
  },
  {
    icon: UserCog,
    title: "Cuentas administradoras",
    copy: "Las cuentas con permisos de administrador pueden moderar contenido, resolver reportes, gestionar permisos internos y registrar acciones de seguridad dentro del panel."
  }
];

const importantNotes = [
  "PokeTrade HUB no fabrica, vende ni garantiza directamente los productos publicados por usuarios.",
  "Las operaciones de pago, envio o entrega acordadas entre usuarios quedan bajo responsabilidad de quienes participan.",
  "Los reportes falsos, abusivos o hechos para perjudicar a otro usuario tambien pueden ser moderados.",
  "Si se integran pagos o planes mas adelante, sus condiciones se comunicaran dentro de la plataforma."
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="border-b-8 border-yellow-400 bg-[linear-gradient(135deg,#123cba_0%,#071535_74%)]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <ButtonLink href="/" variant="secondary">
            Volver al inicio
          </ButtonLink>
          <div className="mt-10 grid h-14 w-14 place-items-center rounded-full bg-yellow-400 text-blue-950">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-4xl font-black sm:text-6xl">Terminos de uso</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100">
            PokeTrade HUB es una plataforma de comunidad para publicar, encontrar y coordinar
            operaciones de productos Pokemon TCG entre usuarios.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-12 sm:px-6 lg:px-8">
        {terms.map((item) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6" key={item.title}>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <item.icon className="h-5 w-5 text-yellow-300" />
              {item.title}
            </h2>
            <p className="mt-3 leading-7 text-blue-100">{item.copy}</p>
          </article>
        ))}

        <article className="rounded-lg border border-yellow-300/40 bg-yellow-400/10 p-6">
          <h2 className="text-xl font-black">Puntos importantes</h2>
          <div className="mt-4 grid gap-3">
            {importantNotes.map((note) => (
              <p className="flex gap-2 text-sm font-semibold leading-6 text-blue-100" key={note}>
                <Scale className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                {note}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-xl font-black">Cambios y continuidad</h2>
          <p className="mt-3 leading-7 text-blue-100">
            Estas condiciones pueden actualizarse a medida que la plataforma crece, suma
            monetizacion, integra pagos, mejora seguridad o incorpora nuevas herramientas para
            usuarios y administradores.
          </p>
        </article>
      </section>
    </main>
  );
}
