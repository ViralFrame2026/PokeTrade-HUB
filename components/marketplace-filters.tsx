import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";

type MarketplaceFiltersProps = {
  condition: string;
  location: string;
  maxPrice: string;
  minPrice: string;
  query: string;
  rarity: string;
  sort: string;
  set: string;
  type: string;
};

const fieldClass =
  "h-12 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-300/70 focus:ring-2 focus:ring-yellow-300/10";

function filterHref(removeKey: string, filters: Record<string, string>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (key !== removeKey && value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `/marketplace?${query}` : "/marketplace";
}

export function MarketplaceFilters({
  condition,
  location,
  maxPrice,
  minPrice,
  query,
  rarity,
  set,
  sort,
  type
}: MarketplaceFiltersProps) {
  const filterValues = {
    condition,
    location,
    maxPrice,
    minPrice,
    q: query,
    rarity,
    set,
    sort: sort === "recent" ? "" : sort,
    type
  };
  const activeFilters = [
    query ? ["q", `Carta: ${query}`] : null,
    type ? ["type", `Operación: ${type === "sale" ? "Venta" : type === "trade" ? "Intercambio" : "Gratis"}`] : null,
    condition ? ["condition", `Estado: ${condition}`] : null,
    set ? ["set", `Set: ${set}`] : null,
    rarity ? ["rarity", `Rareza: ${rarity}`] : null,
    location ? ["location", `Ubicación: ${location}`] : null,
    minPrice ? ["minPrice", `Desde $${minPrice}`] : null,
    maxPrice ? ["maxPrice", `Hasta $${maxPrice}`] : null,
    sort !== "recent" ? ["sort", "Orden personalizado"] : null
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <form action="/marketplace" className="mt-6 rounded-lg border border-white/10 bg-slate-950/82 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.2)] backdrop-blur sm:p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <label className="xl:col-span-2">
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
          Set
        </span>
        <input
          className={fieldClass}
          defaultValue={set}
          name="set"
          placeholder="Ej: Scarlet & Violet"
          type="search"
        />
      </label>

      <label>
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
          Rareza
        </span>
        <select className={fieldClass} defaultValue={rarity} name="rarity">
          <option value="">Todas</option>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Rare Holo">Rare Holo</option>
          <option value="Double Rare">Double Rare</option>
          <option value="Ultra Rare">Ultra Rare</option>
          <option value="Illustration Rare">Illustration Rare</option>
          <option value="Special Illustration Rare">Special Illustration Rare</option>
          <option value="Hyper Rare">Hyper Rare</option>
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

      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
            Mín.
          </span>
          <input
            className={fieldClass}
            defaultValue={minPrice}
            min="0"
            name="minPrice"
            placeholder="$"
            type="number"
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-yellow-300">
            Máx.
          </span>
          <input
            className={fieldClass}
            defaultValue={maxPrice}
            min="0"
            name="maxPrice"
            placeholder="$"
            type="number"
          />
        </label>
      </div>

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

      <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1">
        <button
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-blue-950 transition hover:bg-yellow-300 xl:flex-none"
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
      </div>
      {activeFilters.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-blue-200">
            Filtros activos
          </span>
          {activeFilters.map(([key, label]) => (
            <Link
              className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-1.5 text-xs font-black text-yellow-100 transition hover:border-yellow-300 hover:bg-yellow-300/20"
              href={filterHref(key, filterValues)}
              key={key}
              title={`Quitar ${label}`}
            >
              {label} ×
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}
