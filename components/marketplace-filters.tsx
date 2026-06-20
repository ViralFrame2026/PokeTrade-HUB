import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";

type MarketplaceFiltersProps = {
  condition: string;
  location: string;
  query: string;
  sort: string;
  type: string;
};

const fieldClass =
  "h-12 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-300/70 focus:ring-2 focus:ring-yellow-300/10";

export function MarketplaceFilters({
  condition,
  location,
  query,
  sort,
  type
}: MarketplaceFiltersProps) {
  return (
    <form
      action="/marketplace"
      className="mt-6 grid gap-3 rounded-lg border border-white/10 bg-slate-950/82 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.2)] backdrop-blur md:grid-cols-2 xl:grid-cols-[1.4fr_0.75fr_0.8fr_0.9fr_0.9fr_auto]"
    >
      <label>
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
          Carta
        </span>
        <input
          className={fieldClass}
          defaultValue={query}
          name="q"
          placeholder="Ej: Charizard, Greninja..."
          type="search"
        />
      </label>

      <label>
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
          Operación
        </span>
        <select className={fieldClass} defaultValue={type} name="type">
          <option value="">Todas</option>
          <option value="sale">Venta</option>
          <option value="trade">Intercambio</option>
          <option value="free">Gratis</option>
        </select>
      </label>

      <label>
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
          Estado
        </span>
        <select className={fieldClass} defaultValue={condition} name="condition">
          <option value="">Todos</option>
          <option value="Mint">Mint</option>
          <option value="Near Mint">Near Mint</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Played">Played</option>
        </select>
      </label>

      <label>
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
          Ubicación
        </span>
        <input
          className={fieldClass}
          defaultValue={location}
          name="location"
          placeholder="Ciudad o país"
          type="search"
        />
      </label>

      <label>
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
          Ordenar
        </span>
        <select className={fieldClass} defaultValue={sort} name="sort">
          <option value="recent">Recientes</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
          <option value="seller_rating">Mejor vendedor</option>
        </select>
      </label>

      <div className="flex items-end gap-2">
        <button
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-blue-950 transition hover:bg-yellow-300 xl:flex-none"
          type="submit"
        >
          <Search className="h-4 w-4" />
          Buscar
        </button>
        <Link
          aria-label="Limpiar filtros"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
          href="/marketplace"
          title="Limpiar filtros"
        >
          <RotateCcw className="h-4 w-4" />
        </Link>
      </div>
    </form>
  );
}
