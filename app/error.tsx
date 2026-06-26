"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_0%,rgba(239,68,68,0.18),transparent_26rem),linear-gradient(180deg,#172554,#070a12)] px-4 py-12 text-white">
      <section className="w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,.35)]">
        <div className="border-b-4 border-yellow-400 bg-blue-800 px-6 py-5">
          <Link className="flex w-fit items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.22em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">HUB TCG</p>
            </div>
          </Link>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500 text-white">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
            Algo fallo
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
            No pudimos cargar esta parte.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
            Puede ser un problema temporal. Intenta de nuevo o vuelve al inicio.
          </p>
          {error.digest ? (
            <p className="mt-4 rounded-lg border border-white/10 bg-slate-950/50 p-3 font-mono text-xs text-slate-400">
              Codigo: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 text-sm font-black text-blue-950 transition hover:bg-yellow-300"
              onClick={reset}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition hover:border-yellow-300 hover:text-yellow-300"
              href="/"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
