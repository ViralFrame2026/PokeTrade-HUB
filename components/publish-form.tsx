"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Store
} from "lucide-react";
import type { PokemonTcgCard } from "@/lib/pokemon-tcg-api";
import { cn } from "@/lib/utils";

type CardsSearchResponse = {
  data: PokemonTcgCard[];
  error: string | null;
};

export function PublishForm() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<PokemonTcgCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonTcgCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setError("Escribe al menos 2 caracteres para buscar una carta oficial.");
      setCards([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards/search?q=${encodeURIComponent(trimmedQuery)}`);
      const payload = (await response.json()) as CardsSearchResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos buscar cartas en este momento.");
      }

      setCards(payload.data);

      if (payload.data.length === 0) {
        setError("No encontramos cartas oficiales con esa busqueda.");
      }
    } catch (searchError) {
      setCards([]);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "No pudimos buscar cartas en este momento."
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <form className="glass rounded-lg p-5 sm:p-6" onSubmit={(event) => event.preventDefault()}>
      <label className="text-sm font-bold text-slate-200" htmlFor="card-search">
        Carta oficial
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
          <input
            className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white outline-none focus:border-pokemonYellow/60"
            id="card-search"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Buscar por nombre o set oficial"
            type="search"
            value={query}
          />
        </div>
        <button
          className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSearching}
          onClick={handleSearch}
          type="button"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Buscar
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-pokemonYellow/30 bg-pokemonYellow/5 p-4 text-sm text-slate-300">
        <CheckCircle2 className="mb-2 h-5 w-5 text-pokemonYellow" />
        {selectedCard ? (
          <span>
            Carta oficial seleccionada:
            <span className="font-semibold text-white"> {selectedCard.name}</span>
          </span>
        ) : (
          <span>
            Busca una carta oficial. La publicacion no puede continuar con cartas inventadas.
          </span>
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}

      {cards.length > 0 ? (
        <div className="mt-4 grid max-h-[460px] gap-3 overflow-y-auto pr-1">
          {cards.map((card) => (
            <button
              className={cn(
                "grid grid-cols-[72px_1fr] gap-4 rounded-lg border p-3 text-left transition",
                selectedCard?.id === card.id
                  ? "border-pokemonYellow bg-pokemonYellow/10"
                  : "border-white/10 bg-white/[0.04] hover:border-pokemonYellow/50"
              )}
              key={card.id}
              onClick={() => setSelectedCard(card)}
              type="button"
            >
              <div className="relative aspect-[0.72] overflow-hidden rounded-md bg-slate-950">
                <Image
                  alt={card.name}
                  className="object-cover"
                  fill
                  sizes="72px"
                  src={card.images.small}
                />
              </div>
              <span className="min-w-0">
                <span className="block font-black text-white">{card.name}</span>
                <span className="mt-1 block text-sm font-semibold text-pokemonYellow">
                  {card.set.name}
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-400">
                  ID oficial: {card.id} · Numero: {card.number ?? "N/D"} · Rareza:{" "}
                  {card.rarity ?? "N/D"}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedCard ? (
        <section className="mt-6 rounded-lg border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pokemonYellow">
            Datos bloqueados desde Pokemon TCG API
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-400">Nombre oficial</dt>
              <dd className="mt-1 font-bold text-white">{selectedCard.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-400">Set</dt>
              <dd className="mt-1 font-bold text-white">{selectedCard.set.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-400">Rareza</dt>
              <dd className="mt-1 font-bold text-white">{selectedCard.rarity ?? "N/D"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-400">Numero</dt>
              <dd className="mt-1 font-bold text-white">{selectedCard.number ?? "N/D"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          ["Tipo", "Venta, Intercambio, Sorteo o Gratis"],
          ["Estado", "Near Mint, Light Played, etc."],
          ["Precio", "Solo para ventas"],
          ["Busca a cambio", "Solo para intercambios"]
        ].map(([label, placeholder]) => (
          <label className="text-sm font-bold text-slate-200" key={label}>
            {label}
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>
      <label className="mt-4 block text-sm font-bold text-slate-200">
        Descripcion
        <textarea
          className="mt-2 min-h-32 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
          placeholder="Describe condicion, detalles y forma de entrega"
        />
      </label>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <Camera className="mb-3 h-5 w-5 text-pokemonYellow" />
          Fotos reales
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <MapPin className="mb-3 h-5 w-5 text-pokemonYellow" />
          Ubicacion
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <ShieldCheck className="mb-3 h-5 w-5 text-pokemonYellow" />
          Moderacion
        </div>
      </div>
      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!selectedCard}
        type="button"
      >
        <Store className="h-5 w-5" />
        Enviar a revision
      </button>
    </form>
  );
}
