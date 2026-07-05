import { Search, Store } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_0%,rgba(250,204,21,0.16),transparent_26rem),linear-gradient(180deg,#172554,#070a12)] px-4 py-12 text-white">
      <section className="w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,.35)]">
        <div className="border-b-4 border-yellow-400 bg-blue-800 px-6 py-5">
          <Link className="flex w-fit items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.22em] text-yellow-300">NexoTCG</p>
              <p className="text-xs font-bold text-blue-100">Marketplace TCG</p>
            </div>
          </Link>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
            Ruta no encontrada
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
            Esta carta no esta en el mazo.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
            El enlace puede haber cambiado, la publicacion pudo eliminarse o la pagina ya no
            esta disponible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="light">
              Volver al inicio
            </ButtonLink>
            <ButtonLink href="/marketplace" icon={Search} variant="blue">
              Explorar marketplace
            </ButtonLink>
            <ButtonLink href="/publish" icon={Store}>
              Publicar producto
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
