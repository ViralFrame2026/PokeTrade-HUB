import { Scale } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Términos",
  description: "Condiciones básicas de uso para PokeTrade HUB."
};

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
          <h1 className="mt-5 text-4xl font-black sm:text-6xl">Términos de uso</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100">
            PokeTrade HUB es una plataforma de comunidad para publicar, encontrar y
            coordinar operaciones de cartas Pokémon TCG entre usuarios.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-12 sm:px-6 lg:px-8">
        {[
          ["Responsabilidad del usuario", "Cada usuario es responsable de la veracidad de sus publicaciones, mensajes, sorteos y acuerdos."],
          ["Contenido y eliminacion", "Cada usuario puede eliminar sus propias publicaciones y sorteos cuando quiera. PokeTrade HUB tambien puede revisar, rechazar, pausar o eliminar contenido que incumpla reglas, use datos falsos, afecte la confianza de la comunidad o represente riesgo para otros usuarios."],
          ["Operaciones entre usuarios", "La plataforma facilita el contacto, pero no reemplaza la verificacion personal de estado, pago, envio o entrega."],
          ["Cuentas administradoras", "Las cuentas con permisos de administrador pueden moderar contenido, resolver reportes, gestionar permisos internos y registrar acciones de seguridad dentro del panel."],
          ["Cambios", "Estas condiciones pueden actualizarse a medida que la plataforma crece y suma nuevas funciones."]
        ].map(([title, copy]) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6" key={title}>
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-blue-100">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
