import { AlertTriangle, CheckCircle2, Handshake, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Seguridad",
  description:
    "Buenas practicas para comprar, vender e intercambiar cartas Pokemon TCG en PokeTrade HUB."
};

const safeSteps = [
  {
    icon: ShieldCheck,
    title: "Usa publicaciones oficiales",
    copy: "Cada publicacion debe estar vinculada a una carta real del catalogo Pokemon TCG."
  },
  {
    icon: Handshake,
    title: "Acorda todo por mensajes",
    copy: "Deja precio, estado, entrega y condiciones claros antes de cerrar una operacion."
  },
  {
    icon: CheckCircle2,
    title: "Revisa reputacion",
    copy: "Antes de comprar o intercambiar, mira el perfil, historial y valoraciones del usuario."
  }
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
            Seguridad para operar con cartas Pokemon TCG
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            PokeTrade HUB ayuda a ordenar publicaciones, perfiles y reputacion. Aun asi,
            cada operacion entre usuarios requiere criterio, confirmacion y cuidado.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
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

        <div className="mt-8 rounded-lg border border-red-300/40 bg-red-500/12 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-yellow-300" />
            <div>
              <h2 className="text-xl font-black">Evita operaciones sospechosas</h2>
              <p className="mt-3 leading-7 text-blue-100">
                Desconfia de precios demasiado bajos, presion para salir de la plataforma,
                pedidos de pago sin comprobante o usuarios que no quieran mostrar fotos reales
                cuando el caso lo amerita.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/rules" variant="light">
            Ver reglas
          </ButtonLink>
          <ButtonLink href="/marketplace" variant="blue">
            Explorar marketplace
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
