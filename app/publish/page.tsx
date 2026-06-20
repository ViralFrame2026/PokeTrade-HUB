import { ArrowLeft, Camera, Search, ShieldCheck, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { PublishForm } from "@/components/publish-form";

export const metadata = {
  title: "Publicar Producto"
};

export default function PublishPage() {
  const steps = [
    { icon: Search, label: "Buscar carta oficial" },
    { icon: Store, label: "Completar datos comerciales" },
    { icon: Camera, label: "Agregar fotos reales opcionales" },
    { icon: ShieldCheck, label: "Enviar a moderación" }
  ];

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_82%_0%,rgba(250,204,21,.18),transparent_30%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <ButtonLink href="/account" icon={ArrowLeft} variant="secondary">
            Volver a mi cuenta
          </ButtonLink>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-yellow-300/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
            <Store className="h-4 w-4" />
            Nueva publicación
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Crear producto
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
            Selecciona una carta oficial, completa los datos comerciales y envíala
            a moderación. Las fotos reales ayudan, pero son opcionales.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <section>
          <div className="grid gap-3">
            {steps.map((step) => (
              <div className="glass flex items-center gap-3 rounded-lg p-4" key={step.label}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-pokemonYellow font-black text-slate-950">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="font-semibold text-white">{step.label}</span>
              </div>
            ))}
          </div>
        </section>
        <PublishForm />
      </div>
    </main>
  );
}
