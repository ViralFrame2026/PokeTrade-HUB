import { BadgeCheck, Ban, Gift, ShieldCheck, Store, Trash2 } from "lucide-react";
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
    copy: "No se permiten cartas inventadas, imagenes falsas ni datos que no coincidan con la carta oficial seleccionada."
  },
  {
    icon: BadgeCheck,
    title: "Datos comerciales claros",
    copy: "El estado, precio, ubicacion, metodo de entrega y condiciones deben ser entendibles antes de contactar al vendedor."
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
    icon: Trash2,
    title: "Eliminacion libre",
    copy: "Cada usuario puede eliminar sus publicaciones y sorteos cuando ya no quiera vender, intercambiar, regalar o mostrar un producto."
  },
  {
    icon: Ban,
    title: "Sin engaños",
    copy: "No se permite simular stock, ocultar danos importantes, usar fotos robadas ni presionar a otros usuarios para aceptar acuerdos inseguros."
  }
];

const consequences = [
  "Correccion o rechazo de publicaciones.",
  "Pausa temporal de contenido reportado.",
  "Eliminacion de publicaciones, sorteos o reportes falsos.",
  "Retiro de permisos especiales si una cuenta administradora abusa de sus funciones."
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
            Reglas simples para mantener el marketplace verificable, util y seguro para
            coleccionistas, compradores, vendedores y moderadores.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule) => (
            <article className="rounded-lg border border-white/10 bg-white/[0.06] p-6" key={rule.title}>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-yellow-400 text-blue-950">
                <rule.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-black">{rule.title}</h2>
              <p className="mt-3 leading-7 text-blue-100">{rule.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-xl font-black">Que puede pasar si se incumplen</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {consequences.map((item) => (
              <p className="flex gap-2 text-sm font-semibold leading-6 text-blue-100" key={item}>
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
