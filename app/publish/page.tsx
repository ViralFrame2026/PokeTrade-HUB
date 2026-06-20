import { ButtonLink } from "@/components/ui/button-link";
import { PublishForm } from "@/components/publish-form";

export const metadata = {
  title: "Publicar Producto"
};

export default function PublishPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ButtonLink href="/" variant="ghost">
        Volver
      </ButtonLink>
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
            Nueva publicación
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">Crear producto</h1>
          <p className="mt-4 leading-7 text-slate-300">
            La carta debe seleccionarse desde el catálogo oficial. El usuario
            completa estado, precio, descripcion, fotos reales y ubicacion.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Buscar carta oficial",
              "Completar datos comerciales",
              "Subir fotos reales",
              "Enviar a moderación"
            ].map((step, index) => (
              <div className="glass flex items-center gap-3 rounded-lg p-4" key={step}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-pokemonYellow font-black text-slate-950">
                  {index + 1}
                </span>
                <span className="font-semibold text-white">{step}</span>
              </div>
            ))}
          </div>
        </section>
        <PublishForm />
      </div>
    </main>
  );
}
