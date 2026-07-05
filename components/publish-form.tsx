"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ImageOff,
  Layers,
  Loader2,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  Upload
} from "lucide-react";
import type { PokemonTcgCard } from "@/lib/pokemon-tcg-api";
import { DEFAULT_PRODUCT_LANGUAGE, PRODUCT_LANGUAGES } from "@/lib/product-language";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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

const DESCRIPTION_MAX_LENGTH = 2000;
const TRADE_WANTS_MAX_LENGTH = 1000;
const PUBLISH_DRAFT_KEY = "poketrade-publish-draft";

type ProductCategory = "card" | "sealed" | "accessory";

const productCategories = [
  {
    description: "Carta individual validada con Pokemon TCG API.",
    icon: Search,
    label: "Carta individual",
    value: "card"
  },
  {
    description: "ETB, booster box, sobres, tins, blisters o productos cerrados.",
    icon: Package,
    label: "Producto sellado",
    value: "sealed"
  },
  {
    description: "Binders, sleeves, deck boxes, playmats y otros accesorios.",
    icon: Layers,
    label: "Accesorio TCG",
    value: "accessory"
  }
] satisfies Array<{
  description: string;
  icon: typeof Search;
  label: string;
  value: ProductCategory;
}>;

const sealedTypes = [
  "Elite Trainer Box",
  "Booster Box",
  "Booster Pack",
  "Blister",
  "Tin",
  "Collection Box",
  "Build & Battle",
  "Lote sellado",
  "Otro producto sellado"
];

const accessoryTypes = [
  "Binder",
  "Sleeves",
  "Deck Box",
  "Playmat",
  "Toploader / proteccion",
  "Album",
  "Lote de accesorios",
  "Otro accesorio"
];

type PublishDraft = {
  accessoryType: string;
  condition: string;
  description: string;
  listingType: "sale" | "trade" | "free";
  locationCity: string;
  locationCountry: string;
  price: string;
  productCategory: ProductCategory;
  productLanguage: string;
  productTitle: string;
  query: string;
  selectedCard: PokemonTcgCard | null;
  sealedType: string;
  tradeWants: string;
};

export function PublishForm() {
  const [query, setQuery] = useState("");
  const [productCategory, setProductCategory] = useState<ProductCategory>("card");
  const [productTitle, setProductTitle] = useState("");
  const [sealedType, setSealedType] = useState(sealedTypes[0]);
  const [accessoryType, setAccessoryType] = useState(accessoryTypes[0]);
  const [cards, setCards] = useState<PokemonTcgCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonTcgCard | null>(null);
  const [listingType, setListingType] = useState<"sale" | "trade" | "free">("sale");
  const [condition, setCondition] = useState("Near Mint");
  const [price, setPrice] = useState("");
  const [tradeWants, setTradeWants] = useState("");
  const [description, setDescription] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [productLanguage, setProductLanguage] = useState(DEFAULT_PRODUCT_LANGUAGE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const descriptionRemaining = DESCRIPTION_MAX_LENGTH - description.length;
  const tradeWantsRemaining = TRADE_WANTS_MAX_LENGTH - tradeWants.length;
  const isCardProduct = productCategory === "card";
  const isReadyToSubmit =
    (isCardProduct && selectedCard) ||
    (productCategory === "sealed" &&
      productTitle.trim().length >= 3 &&
      sealedType &&
      photos.length > 0) ||
    (productCategory === "accessory" &&
      productTitle.trim().length >= 3 &&
      accessoryType &&
      photos.length > 0);
  const moderationChecklist = isCardProduct
    ? [
        "La carta oficial seleccionada debe coincidir con el producto real.",
        "El idioma elegido debe coincidir con la carta real.",
        "El estado debe ser honesto: Mint, Near Mint, Played, etc.",
        "La descripcion debe aclarar detalles, entrega y observaciones."
      ]
    : productCategory === "sealed"
      ? [
          "El producto sellado debe verse cerrado y autentico en las fotos.",
          "El tipo elegido debe coincidir: ETB, booster, blister, tin u otro.",
          "El idioma elegido debe coincidir con el producto o contenido principal.",
          "Si es venta, el precio debe ser el acordado para publicar."
        ]
      : [
          "El accesorio debe verse claramente en las fotos reales.",
          "El tipo elegido debe coincidir: binder, sleeves, deck box, playmat u otro.",
          "El idioma aplica si el accesorio tiene texto, packaging o producto asociado.",
          "Si es venta, el precio debe ser el acordado para publicar."
        ];

  useEffect(() => {
    const previews = photos.map((photo) => URL.createObjectURL(photo));
    setPhotoPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [photos]);

  useEffect(() => {
    try {
      const storedDraft = window.localStorage.getItem(PUBLISH_DRAFT_KEY);
      if (!storedDraft) return;

      const draft = JSON.parse(storedDraft) as Partial<PublishDraft>;
      setProductCategory(draft.productCategory ?? "card");
      setProductTitle(draft.productTitle ?? "");
      setSealedType(draft.sealedType ?? sealedTypes[0]);
      setAccessoryType(draft.accessoryType ?? accessoryTypes[0]);
      setQuery(draft.query ?? "");
      setSelectedCard(draft.selectedCard ?? null);
      setListingType(draft.listingType ?? "sale");
      setCondition(draft.condition ?? "Near Mint");
      setPrice(draft.price ?? "");
      setTradeWants(draft.tradeWants ?? "");
      setDescription(draft.description ?? "");
      setLocationCity(draft.locationCity ?? "");
      setLocationCountry(draft.locationCountry ?? "");
      setProductLanguage(draft.productLanguage ?? DEFAULT_PRODUCT_LANGUAGE);

      if (
        draft.selectedCard ||
        draft.productTitle ||
        draft.description ||
        draft.price ||
        draft.tradeWants ||
        draft.locationCity ||
        draft.locationCountry
      ) {
        setDraftNotice("Recuperamos tu borrador de publicación.");
      }
    } catch {
      window.localStorage.removeItem(PUBLISH_DRAFT_KEY);
    } finally {
      setIsDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftReady) return;

    const draft: PublishDraft = {
      accessoryType,
      condition,
      description,
      listingType,
      locationCity,
      locationCountry,
      price,
      productCategory,
      productLanguage,
      productTitle,
      query,
      selectedCard,
      sealedType,
      tradeWants
    };

    window.localStorage.setItem(PUBLISH_DRAFT_KEY, JSON.stringify(draft));
  }, [
    accessoryType,
    condition,
    description,
    isDraftReady,
    listingType,
    locationCity,
    locationCountry,
    price,
    productCategory,
    productLanguage,
    productTitle,
    query,
    selectedCard,
    sealedType,
    tradeWants
  ]);

  function clearDraft() {
    window.localStorage.removeItem(PUBLISH_DRAFT_KEY);
    setDraftNotice(null);
  }

  function resetForm() {
    setCards([]);
    setSelectedCard(null);
    setProductTitle("");
    setQuery("");
    setDescription("");
    setPrice("");
    setTradeWants("");
    setProductLanguage(DEFAULT_PRODUCT_LANGUAGE);
    setPhotos([]);
    clearDraft();
  }

  function handlePhotos(files: FileList | null) {
    if (!files) return;

    const nextPhotos = Array.from(files);
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (nextPhotos.length > 5) {
      setError("Puedes subir un máximo de 5 fotos reales.");
      return;
    }

    const invalidPhoto = nextPhotos.find(
      (photo) => !allowedTypes.has(photo.type) || photo.size > 8 * 1024 * 1024
    );

    if (invalidPhoto) {
      setError("Las fotos deben ser JPG, PNG o WEBP y pesar menos de 8 MB.");
      return;
    }

    setPhotos(nextPhotos);
    setError(null);
  }

  async function handleSearch() {
    if (!isCardProduct) return;

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
        setError("No encontramos cartas oficiales con esa búsqueda.");
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
    if (isCardProduct && !selectedCard) {
      setError("Selecciona una carta oficial antes de publicar.");
      return;
    }

    if (!isCardProduct && productTitle.trim().length < 3) {
      setError("Escribe el nombre del producto antes de publicar.");
      return;
    }

    if (!isCardProduct && photos.length === 0) {
      setError("Sube al menos una foto real para publicar este producto.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        body: JSON.stringify({
          accessoryType: productCategory === "accessory" ? accessoryType : null,
          cardId: selectedCard?.id ?? null,
          condition,
          description,
          locationCity,
          locationCountry,
          price: listingType === "sale" && price ? Number(price) : null,
          productCategory,
          productLanguage,
          productTitle: isCardProduct ? null : productTitle.trim(),
          sealedType: productCategory === "sealed" ? sealedType : null,
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
        throw new Error(payload.error ?? "No pudimos crear la publicación.");
      }

      const listingId = payload.data?.id;

      if (!listingId) {
        throw new Error("No recibimos el identificador de la publicación.");
      }

      const uploadedPaths: string[] = [];

      try {
        if (photos.length === 0) {
          setSuccess(
            `Publicación ${listingId} enviada. Quedó pendiente de moderación.`
          );
          resetForm();
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Tu sesión venció. Inicia sesión nuevamente.");
        }

        for (const [index, photo] of photos.entries()) {
          const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
          const storagePath = `${user.id}/${listingId}/${crypto.randomUUID()}.${extension}`;
          const { error: uploadError } = await supabase.storage
            .from("listing-images")
            .upload(storagePath, photo, {
              cacheControl: "3600",
              contentType: photo.type,
              upsert: false
            });

          if (uploadError) throw uploadError;
          uploadedPaths.push(storagePath);

          const { error: imageError } = await supabase.from("listing_images").insert({
            alt_text: `Foto real ${index + 1} de ${
              selectedCard?.name ?? productTitle.trim()
            }`,
            listing_id: listingId,
            sort_order: index,
            storage_path: storagePath
          });

          if (imageError) throw imageError;
        }
      } catch (uploadError) {
        const supabase = createSupabaseBrowserClient();
        if (uploadedPaths.length > 0) {
          await supabase.storage.from("listing-images").remove(uploadedPaths);
        }
        await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
        throw new Error(
          uploadError instanceof Error
            ? `No pudimos subir las fotos: ${uploadError.message}`
            : "No pudimos subir las fotos reales."
        );
      }

      setSuccess(
        `Publicación ${listingId} enviada con ${photos.length} foto(s). Quedó pendiente de moderación.`
      );
      resetForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos crear la publicación."
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
      <section className="mb-5">
        <p className="text-sm font-bold text-slate-200">Tipo de producto</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {productCategories.map((category) => {
            const Icon = category.icon;
            const active = productCategory === category.value;

            return (
              <button
                className={cn(
                  "rounded-lg border p-4 text-left transition",
                  active
                    ? "border-pokemonYellow bg-pokemonYellow/10 text-white"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-pokemonYellow/50"
                )}
                key={category.value}
                onClick={() => {
                  setProductCategory(category.value);
                  setError(null);
                  if (category.value !== "card") {
                    setCards([]);
                    setSelectedCard(null);
                  }
                }}
                type="button"
              >
                <Icon className="h-5 w-5 text-pokemonYellow" />
                <span className="mt-3 block font-black">{category.label}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-400">
                  {category.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {!isCardProduct ? (
        <section className="mb-5 grid gap-4 rounded-lg border border-white/10 bg-slate-950/45 p-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-200 sm:col-span-2">
            Nombre del producto
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
              maxLength={140}
              onChange={(event) => setProductTitle(event.target.value)}
              placeholder={
                productCategory === "sealed"
                  ? "Ej: ETB Chaos Rising, Booster Box, Tin Charizard"
                  : "Ej: Binder 9 bolsillos, sleeves, deck box"
              }
              required
              value={productTitle}
            />
          </label>
          {productCategory === "sealed" ? (
            <label className="text-sm font-bold text-slate-200">
              Tipo de sellado
              <select
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
                onChange={(event) => setSealedType(event.target.value)}
                value={sealedType}
              >
                {sealedTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {productCategory === "accessory" ? (
            <label className="text-sm font-bold text-slate-200">
              Tipo de accesorio
              <select
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
                onChange={(event) => setAccessoryType(event.target.value)}
                value={accessoryType}
              >
                {accessoryTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="rounded-lg border border-dashed border-pokemonYellow/30 bg-pokemonYellow/5 p-4 text-sm leading-6 text-slate-300 sm:col-span-2">
            <CheckCircle2 className="mb-2 h-5 w-5 text-pokemonYellow" />
            Estos productos no necesitan carta oficial. El equipo los revisa por fotos,
            descripcion, tipo de producto y coherencia del precio.
          </div>
        </section>
      ) : null}

      {isCardProduct ? (
        <>
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
            Busca una carta oficial. La publicación no puede continuar con cartas inventadas.
          </span>
        )}
      </div>
        </>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}

      {draftNotice ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-300/30 bg-blue-500/10 p-4 text-sm font-semibold text-blue-100">
          <span>{draftNotice}</span>
          <button
            className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:border-pokemonYellow/60 hover:text-pokemonYellow"
            onClick={() => {
              resetForm();
              setSuccess(null);
              setError(null);
            }}
            type="button"
          >
            Empezar de cero
          </button>
        </div>
      ) : null}

      {isCardProduct && cards.length > 0 ? (
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
                  ID oficial: {card.id} | Número: {card.number ?? "N/D"} | Rareza:{" "}
                  {card.rarity ?? "N/D"}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {isCardProduct && selectedCard ? (
        <section className="mt-6 rounded-lg border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pokemonYellow">
            Datos bloqueados desde Pokémon TCG API
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
                <dt className="font-semibold text-slate-400">Número</dt>
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
        <label className="text-sm font-bold text-slate-200">
          Idioma
          <select
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
            onChange={(event) => setProductLanguage(event.target.value)}
            required
            value={productLanguage}
          >
            {PRODUCT_LANGUAGES.map((value) => (
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
              maxLength={TRADE_WANTS_MAX_LENGTH}
              onChange={(event) => setTradeWants(event.target.value)}
              placeholder="Ej: cartas de Gengar o Mew"
              required
              value={tradeWants}
            />
            <span className="mt-1 block text-xs text-slate-500">
              {tradeWantsRemaining} caracteres restantes
            </span>
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
          País
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
        Descripción
        <textarea
          className="mt-2 min-h-32 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
          maxLength={DESCRIPTION_MAX_LENGTH}
          minLength={10}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe condición, detalles y forma de entrega"
          required
          value={description}
        />
        <span className="mt-1 block text-xs text-slate-500">
          {description.length}/10 mínimo | {descriptionRemaining} caracteres restantes
        </span>
      </label>
      <section className="mt-5 rounded-lg border border-white/10 bg-slate-950/45 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-white">
              Fotos reales del producto{" "}
              <span className="text-slate-400">
                {isCardProduct ? "(opcional)" : "(obligatorio)"}
              </span>
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {isCardProduct
                ? "Puedes subir hasta 5 fotos. Si no agregas ninguna, se usará la imagen oficial."
                : "Sube al menos una foto clara. La primera será la imagen principal del producto."}
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-pokemonYellow/50 bg-pokemonYellow/10 px-4 py-2 text-sm font-black text-pokemonYellow transition hover:bg-pokemonYellow/20">
            <Upload className="h-4 w-4" />
            Seleccionar fotos
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              multiple
              onChange={(event) => handlePhotos(event.target.files)}
              type="file"
            />
          </label>
        </div>

        {photoPreviews.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photoPreviews.map((preview, index) => (
              <figure
                className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-slate-950"
                key={preview}
              >
                <Image
                  alt={`Vista previa de foto real ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 45vw, 180px"
                  src={preview}
                  unoptimized
                />
                <span className="absolute left-2 top-2 rounded bg-blue-950/85 px-2 py-1 text-[10px] font-black uppercase text-white">
                  {index === 0 ? "Principal" : `Foto ${index + 1}`}
                </span>
                <button
                  aria-label={`Eliminar foto ${index + 1}`}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md bg-red-500 text-white shadow transition hover:bg-red-600"
                  onClick={() =>
                    setPhotos((current) =>
                      current.filter((_, photoIndex) => photoIndex !== index)
                    )
                  }
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid min-h-36 place-items-center rounded-lg border-2 border-dashed border-white/10 text-center text-sm text-slate-500">
            <div>
              <Camera className="mx-auto mb-2 h-7 w-7 text-pokemonYellow" />
              {isCardProduct
                ? "Puedes continuar sin fotos reales."
                : "Este producto necesita al menos una foto real."}
            </div>
          </div>
        )}
      </section>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <Camera className="mb-3 h-5 w-5 text-pokemonYellow" />
          {photos.length > 0
            ? `${photos.length} foto(s) lista(s)`
            : isCardProduct
              ? "Fotos reales opcionales"
              : "Foto real obligatoria"}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <MapPin className="mb-3 h-5 w-5 text-pokemonYellow" />
          Ubicación requerida
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <ShieldCheck className="mb-3 h-5 w-5 text-pokemonYellow" />
          Queda pendiente
        </div>
      </div>
      <section className="mt-5 rounded-lg border border-blue-300/20 bg-blue-500/10 p-4">
        <p className="flex items-center gap-2 text-sm font-black text-white">
          <CheckCircle2 className="h-5 w-5 text-pokemonYellow" />
          Antes de enviar a moderación
        </p>
        <p className="mt-2 text-xs leading-5 text-blue-100/80">
          {isCardProduct
            ? "Vamos a revisar que la carta coincida con el catálogo oficial y que los datos comerciales sean claros."
            : "Vamos a revisar las fotos reales, el tipo de producto, la descripcion y la coherencia del precio."}
        </p>
        <ul className="mt-3 grid gap-2 text-xs leading-5 text-blue-100 sm:grid-cols-2">
          {moderationChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      {success ? (
        <div className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
          {success}
        </div>
      ) : null}
      {!isReadyToSubmit ? (
        <p className="mt-4 text-center text-sm font-semibold text-slate-400">
          {isCardProduct
            ? "Primero selecciona una carta oficial para habilitar el envío."
            : "Completa el nombre, tipo y una foto real para habilitar el envío."}
        </p>
      ) : null}
      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isReadyToSubmit || isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Store className="h-5 w-5" />
        )}
        Enviar a revisión
      </button>
    </form>
  );
}
