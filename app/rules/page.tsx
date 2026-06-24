import { BadgeCheck, Gift, ShieldCheck, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Reglas de comunidad",
  description:
    "Reglas basicas para publicar, intercambiar, vender y crear sorteos en PokeTrade HUB."
};

const rules = [
  {
    icon: Store,
    title: "Publicaciones reales",
    copy: "No se permiten cartas inventadas, imagenes falsas ni datos que no coincidan con la carta oficial."
  },
  {
    icon: BadgeCheck,
    title: "Estado claro",
    copy: "El estado, precio, ubicacion, metodo de entrega y condiciones deben ser claros para el comprador."
  },
  {
    icon: Gift,
    title: "Sorteos transparentes",
    copy: "Los sorteos deben informar premio, fecha de cierre, condiciones y forma de seleccion del ganador."
  },
  {
    icon: ShieldCheck,
    title: "Moderacion activa",
    copy: "El equipo puede aprobar, rechazar, pausar o eliminar contenido que ponga en riesgo a la comunidad."
  },
  {
    icon: Store,
    title: "Eliminacion libre",
    copy: "Cada usuario puede eliminar sus publicaciones cuando ya no quiera vender, intercambiar, regalar o mostrar una carta."
  },
  {
    icon: BadgeCheck,
    title: "Sin fotos robadas",
    copy: "Las fotos reales son opcionales, pero si se suben deben representar la carta ofrecida y no deben engañar al comprador."
  }
];

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="border-b-8 border-yellow-400 bg-[linear-gradient(135deg,#244bb8_0%,#071535_74%)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <ButtonLink href="/" variant="secondary">
            Volver al inicio
          </ButtonLink>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.24em] text-yellow-300">
            Comunidad
          </p>
          <h1 className="mt-3 text-4xl font-black sm:text-6xl">Reglas de PokeTrade HUB</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Estas reglas mantienen el marketplace prolijo, verificable y util para
            coleccionistas, compradores y vendedores.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        {rules.map((rule) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6" key={rule.title}>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-yellow-400 text-blue-950">
              <rule.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-black">{rule.title}</h2>
            <p className="mt-3 leading-7 text-blue-100">{rule.copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
