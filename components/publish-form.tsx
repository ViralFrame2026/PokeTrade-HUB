"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  ImageOff,
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

type CreateListingResponse = {
  data: {
    id: string;
    moderation_status: string;
  } | null;
  error: string | null;
};

export function PublishForm() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<PokemonTcgCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonTcgCard | null>(null);
  const [listingType, setListingType] = useState<"sale" | "trade" | "free">("sale");
  const [condition, setCondition] = useState("Near Mint");
  const [price, setPrice] = useState("");
  const [tradeWants, setTradeWants] = useState("");
  const [description, setDescription] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setError("Escribe al menos 2 caracteres para buscar una carta oficial.");
      setCards([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuccess(null);

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

  async function handleSubmit() {
    if (!selectedCard) {
      setError("Selecciona una carta oficial antes de publicar.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        body: JSON.stringify({
          cardId: selectedCard.id,
          condition,
          description,
          locationCity,
          locationCountry,
          price: listingType === "sale" && price ? Number(price) : null,
          tradeWants: listingType === "trade" ? tradeWants : null,
          type: listingType
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const payload = (await response.json()) as CreateListingResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos crear la publicacion.");
      }

      setSuccess(
        `Publicacion ${payload.data?.id ?? ""} enviada. Quedo pendiente de moderacion.`
      );
      setCards([]);
      setSelectedCard(null);
      setQuery("");
      setDescription("");
      setPrice("");
      setTradeWants("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos crear la publicacion."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="glass rounded-lg p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
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
                event.preventDefault();
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Carta oficial seleccionada:
              <span className="font-semibold text-white"> {selectedCard.name}</span>
            </span>
            <button
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:border-pokemonYellow/60"
              onClick={handleSearch}
              type="button"
            >
              Cambiar carta
            </button>
          </div>
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
              onClick={() => {
                setSelectedCard(card);
                setCards([]);
                setError(null);
              }}
              type="button"
            >
              <div className="relative aspect-[0.72] overflow-hidden rounded-md bg-slate-950">
                {failedImages[card.id] ? (
                  <div className="grid h-full place-items-center text-slate-500">
                    <ImageOff className="h-6 w-6" />
                  </div>
                ) : (
                  <Image
                    alt={card.name}
                    className="object-cover"
                    fill
                    onError={() =>
                      setFailedImages((current) => ({ ...current, [card.id]: true }))
                    }
                    sizes="72px"
                    src={card.images.small}
                  />
                )}
              </div>
              <span className="min-w-0">
                <span className="block font-black text-white">{card.name}</span>
                <span className="mt-1 block text-sm font-semibold text-pokemonYellow">
                  {card.set.name}
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-400">
                  ID oficial: {card.id} | Numero: {card.number ?? "N/D"} | Rareza:{" "}
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
          <div className="mt-4 grid gap-5 sm:grid-cols-[150px_1fr] sm:items-start">
            <div className="relative mx-auto aspect-[0.72] w-[150px] overflow-hidden rounded-md bg-slate-950 shadow-foil sm:mx-0">
              <Image
                alt={selectedCard.name}
                className="object-contain"
                fill
                sizes="150px"
                src={selectedCard.images.large}
              />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
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
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-400">ID oficial</dt>
                <dd className="mt-1 font-bold text-white">{selectedCard.id}</dd>
              </div>
            </dl>
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-200">
          Tipo
          <select
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
            onChange={(event) =>
              setListingType(event.target.value as "sale" | "trade" | "free")
            }
            value={listingType}
          >
            <option value="sale">Venta</option>
            <option value="trade">Intercambio</option>
            <option value="free">Gratis</option>
          </select>
        </label>
        <label className="text-sm font-bold text-slate-200">
          Estado
          <select
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
            onChange={(event) => setCondition(event.target.value)}
            value={condition}
          >
            {[
              "Mint",
              "Near Mint",
              "Lightly Played",
              "Moderately Played",
              "Heavily Played",
              "Damaged"
            ].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        {listingType === "sale" ? (
          <label className="text-sm font-bold text-slate-200">
            Precio
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
              min="0.01"
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Ej: 58000"
              required
              step="0.01"
              type="number"
              value={price}
            />
          </label>
        ) : null}
        {listingType === "trade" ? (
          <label className="text-sm font-bold text-slate-200">
            Busca a cambio
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
              onChange={(event) => setTradeWants(event.target.value)}
              placeholder="Ej: cartas de Gengar o Mew"
              required
              value={tradeWants}
            />
          </label>
        ) : null}
        <label className="text-sm font-bold text-slate-200">
          Ciudad
          <input
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
            onChange={(event) => setLocationCity(event.target.value)}
            placeholder="Ej: Buenos Aires"
            required
            value={locationCity}
          />
        </label>
        <label className="text-sm font-bold text-slate-200">
          Pais
          <input
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
            onChange={(event) => setLocationCountry(event.target.value)}
            placeholder="Ej: Argentina"
            required
            value={locationCountry}
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-bold text-slate-200">
        Descripcion
        <textarea
          className="mt-2 min-h-32 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
          minLength={10}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe condicion, detalles y forma de entrega"
          required
          value={description}
        />
      </label>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <Camera className="mb-3 h-5 w-5 text-pokemonYellow" />
          Fotos reales (proximo paso)
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <MapPin className="mb-3 h-5 w-5 text-pokemonYellow" />
          Ubicacion requerida
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <ShieldCheck className="mb-3 h-5 w-5 text-pokemonYellow" />
          Queda pendiente
        </div>
      </div>
      {success ? (
        <div className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
          {success}
        </div>
      ) : null}
      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!selectedCard || isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Store className="h-5 w-5" />
        )}
        Enviar a revision
      </button>
    </form>
  );
}
