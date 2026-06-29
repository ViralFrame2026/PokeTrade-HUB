import {
  BadgeCheck,
  Ban,
  Camera,
  Gift,
  PackageCheck,
  ShieldCheck,
  Store,
  Trash2
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Reglas de comunidad",
  description:
    "Reglas basicas para publicar, intercambiar, vender y crear sorteos en PokeTrade HUB."
};

const rules = [
  {
    icon: Store,
    title: "Productos reales",
    copy: "Solo se pueden publicar productos Pokemon TCG reales: cartas individuales, productos sellados oficiales y accesorios relacionados al coleccionismo."
  },
  {
    icon: BadgeCheck,
    title: "Cartas verificadas",
    copy: "Las cartas individuales deben seleccionarse desde el catalogo oficial. No se permiten cartas inventadas, proxies, falsificaciones ni datos alterados."
  },
  {
    icon: Camera,
    title: "Fotos reales obligatorias",
    copy: "Los sellados y accesorios deben incluir fotos reales tomadas por el vendedor. No se aceptan imagenes de internet como unica referencia."
  },
  {
    icon: PackageCheck,
    title: "Descripcion completa",
    copy: "Cada publicacion debe aclarar estado, contenido, defectos visibles, precio, ubicacion, entrega y condiciones de venta o intercambio."
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
    title: "Sin enganos",
    copy: "No se permite simular stock, ocultar danos importantes, vender productos re-sellados como nuevos, usar fotos robadas ni presionar por acuerdos inseguros."
  }
];

const allowedProducts = [
  "Cartas individuales oficiales enlazadas al catalogo Pokemon TCG.",
  "Productos sellados oficiales: ETB, booster box, booster packs, latas, colecciones, bundles y similares.",
  "Accesorios TCG: binders, sleeves, deck boxes, playmats, toploaders, cajas y organizadores.",
  "Sorteos de productos Pokemon TCG con premio, cierre y condiciones claras."
];

const requiredByType = [
  {
    title: "Carta individual",
    copy: "Seleccion obligatoria desde la API oficial. Las fotos reales ayudan a vender mejor, pero pueden ser opcionales."
  },
  {
    title: "Sellado",
    copy: "Fotos reales obligatorias, estado del empaque, idioma, expansion, contenido incluido y cualquier golpe, apertura o detalle visible."
  },
  {
    title: "Accesorio",
    copy: "Fotos reales obligatorias, marca o modelo si aplica, medidas/capacidad, estado, desgaste y compatibilidad con cartas Pokemon TCG."
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

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-yellow-300/40 bg-yellow-400/10 p-6">
            <h2 className="text-xl font-black">Que se puede publicar</h2>
            <div className="mt-4 space-y-3">
              {allowedProducts.map((item) => (
                <p className="flex gap-2 text-sm font-semibold leading-6 text-blue-100" key={item}>
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
            <h2 className="text-xl font-black">Requisitos por tipo de producto</h2>
            <div className="mt-4 grid gap-3">
              {requiredByType.map((item) => (
                <div className="rounded-lg border border-white/10 bg-blue-950/35 p-4" key={item.title}>
                  <h3 className="text-sm font-black uppercase tracking-[0.14em] text-yellow-300">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-blue-100">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
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
