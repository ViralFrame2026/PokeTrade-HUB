import { Loader2 } from "lucide-react";

type PageLoadingProps = {
  label?: string;
};

export function PageLoading({ label = "Cargando NexoTCG" }: PageLoadingProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_0%,rgba(250,204,21,0.16),transparent_26rem),linear-gradient(180deg,#172554,#070a12)] px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,.35)]">
        <span className="pokeball mx-auto block h-14 w-14" aria-hidden="true" />
        <div className="mt-6 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          {label}
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-blue-100">
          Preparando productos, perfiles y publicaciones.
        </p>
      </section>
    </main>
  );
}
