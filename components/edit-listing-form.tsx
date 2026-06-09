"use client";

import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ListingType = "sale" | "trade" | "free";

type EditListingFormProps = {
  initial: {
    condition: string;
    description: string;
    locationCity: string;
    locationCountry: string;
    price: number | null;
    tradeWants: string;
    type: ListingType;
  };
  listingId: string;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60";

export function EditListingForm({ initial, listingId }: EditListingFormProps) {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>(initial.type);
  const [condition, setCondition] = useState(initial.condition);
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [tradeWants, setTradeWants] = useState(initial.tradeWants);
  const [description, setDescription] = useState(initial.description);
  const [locationCity, setLocationCity] = useState(initial.locationCity);
  const [locationCountry, setLocationCountry] = useState(initial.locationCountry);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        body: JSON.stringify({
          condition,
          description,
          locationCity,
          locationCountry,
          price: listingType === "sale" && price ? Number(price) : null,
          tradeWants: listingType === "trade" ? tradeWants : null,
          type: listingType
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos guardar los cambios.");
      }

      router.push("/account/listings?resubmitted=1");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos guardar los cambios."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="glass rounded-lg p-5 sm:p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-200">
          Tipo
          <select
            className={inputClass}
            onChange={(event) => setListingType(event.target.value as ListingType)}
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
            className={inputClass}
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
              className={inputClass}
              min="0.01"
              onChange={(event) => setPrice(event.target.value)}
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
              className={inputClass}
              onChange={(event) => setTradeWants(event.target.value)}
              required
              value={tradeWants}
            />
          </label>
        ) : null}

        <label className="text-sm font-bold text-slate-200">
          Ciudad
          <input
            className={inputClass}
            onChange={(event) => setLocationCity(event.target.value)}
            required
            value={locationCity}
          />
        </label>

        <label className="text-sm font-bold text-slate-200">
          Pais
          <input
            className={inputClass}
            onChange={(event) => setLocationCountry(event.target.value)}
            required
            value={locationCountry}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-bold text-slate-200">
        Descripcion
        <textarea
          className={`${inputClass} min-h-36`}
          minLength={10}
          onChange={(event) => setDescription(event.target.value)}
          required
          value={description}
        />
      </label>

      {error ? (
        <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}

      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Guardar y reenviar a revision
      </button>
    </form>
  );
}
