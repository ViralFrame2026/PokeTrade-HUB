import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";

type MarketplaceFiltersProps = {
  condition: string;
  location: string;
  query: string;
  type: string;
};

const fieldClass =
  "h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export function MarketplaceFilters({
  condition,
  location,
  query,
  type
}: MarketplaceFiltersProps) {
  return (
    <form
      action="/marketplace"
      className="grid gap-3 border-y border-blue-100 bg-white py-5 md:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_0.8fr_1fr_auto]"
    >
      <label>
        <span className="mb-2 block text-xs font-black uppercase text-blue-900">
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
        <span className="mb-2 block text-xs font-black uppercase text-blue-900">
          Operacion
        </span>
        <select className={fieldClass} defaultValue={type} name="type">
          <option value="">Todas</option>
          <option value="sale">Venta</option>
          <option value="trade">Intercambio</option>
          <option value="free">Gratis</option>
        </select>
      </label>

      <label>
        <span className="mb-2 block text-xs font-black uppercase text-blue-900">
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
        <span className="mb-2 block text-xs font-black uppercase text-blue-900">
          Ubicacion
        </span>
        <input
          className={fieldClass}
          defaultValue={location}
          name="location"
          placeholder="Ciudad o pais"
          type="search"
        />
      </label>

      <div className="flex items-end gap-2">
        <button
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-blue-950 transition hover:bg-yellow-300 xl:flex-none"
          type="submit"
        >
          <Search className="h-4 w-4" />
          Buscar
        </button>
        <Link
          aria-label="Limpiar filtros"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
          href="/marketplace"
          title="Limpiar filtros"
        >
          <RotateCcw className="h-4 w-4" />
        </Link>
      </div>
    </form>
  );
}
