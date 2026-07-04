"use client";

import Image from "next/image";
import { Camera, Loader2, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_LANGUAGES } from "@/lib/product-language";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ListingType = "sale" | "trade" | "free";

type EditListingFormProps = {
  initial: {
    condition: string;
    description: string;
    existingPhotoCount: number;
    language: string;
    locationCity: string;
    locationCountry: string;
    price: number | null;
    productCategory: string;
    productTitle: string;
    tradeWants: string;
    type: ListingType;
  };
  listingId: string;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60";
const DESCRIPTION_MAX_LENGTH = 2000;
const TRADE_WANTS_MAX_LENGTH = 1000;

export function EditListingForm({ initial, listingId }: EditListingFormProps) {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>(initial.type);
  const [condition, setCondition] = useState(initial.condition);
  const [productLanguage, setProductLanguage] = useState(initial.language);
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [tradeWants, setTradeWants] = useState(initial.tradeWants);
  const [description, setDescription] = useState(initial.description);
  const [locationCity, setLocationCity] = useState(initial.locationCity);
  const [locationCountry, setLocationCountry] = useState(initial.locationCountry);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const descriptionRemaining = DESCRIPTION_MAX_LENGTH - description.length;
  const tradeWantsRemaining = TRADE_WANTS_MAX_LENGTH - tradeWants.length;
  const isCardProduct = initial.productCategory === "card";
  const realPhotoCount = initial.existingPhotoCount + photos.length;
  const canSubmit = isCardProduct || realPhotoCount > 0;

  useEffect(() => {
    const previews = photos.map((photo) => URL.createObjectURL(photo));
    setPhotoPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [photos]);

  function handlePhotos(files: FileList | null) {
    if (!files) return;

    const nextPhotos = Array.from(files);
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const maxNewPhotos = Math.max(0, 5 - initial.existingPhotoCount);

    if (nextPhotos.length > maxNewPhotos) {
      setError(`Puedes agregar hasta ${maxNewPhotos} foto(s) mas en esta publicacion.`);
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

  async function uploadPhotos() {
    if (photos.length === 0) return [];

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Tu sesion vencio. Inicia sesion nuevamente.");
    }

    const uploadedPaths: string[] = [];

    try {
      for (const [index, photo] of photos.entries()) {
        const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const storagePath = `${user.id}/${listingId}/${crypto.randomUUID()}.${extension}`;
        const sortOrder = initial.existingPhotoCount + index;
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
          alt_text: `Foto real ${sortOrder + 1} de ${initial.productTitle}`,
          listing_id: listingId,
          sort_order: sortOrder,
          storage_path: storagePath
        });

        if (imageError) throw imageError;
      }

      return uploadedPaths;
    } catch (uploadError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("listing-images").remove(uploadedPaths);
        await supabase.from("listing_images").delete().in("storage_path", uploadedPaths);
      }

      throw uploadError;
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError("Agrega al menos una foto real para reenviar este producto a revision.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    let uploadedPaths: string[] = [];

    try {
      uploadedPaths = await uploadPhotos();

      const response = await fetch(`/api/listings/${listingId}`, {
        body: JSON.stringify({
          condition,
          description,
          locationCity,
          locationCountry,
          price: listingType === "sale" && price ? Number(price) : null,
          productLanguage,
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
      if (uploadedPaths.length > 0) {
        const supabase = createSupabaseBrowserClient();
        await supabase.storage.from("listing-images").remove(uploadedPaths);
        await supabase.from("listing_images").delete().in("storage_path", uploadedPaths);
      }

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

        <label className="text-sm font-bold text-slate-200">
          Idioma
          <select
            className={inputClass}
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
              maxLength={TRADE_WANTS_MAX_LENGTH}
              onChange={(event) => setTradeWants(event.target.value)}
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
          maxLength={DESCRIPTION_MAX_LENGTH}
          minLength={10}
          onChange={(event) => setDescription(event.target.value)}
          required
          value={description}
        />
        <span className="mt-1 block text-xs text-slate-500">
          {description.length}/10 minimo | {descriptionRemaining} caracteres restantes
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
              {initial.existingPhotoCount > 0
                ? `Esta publicacion ya tiene ${initial.existingPhotoCount} foto(s) real(es).`
                : isCardProduct
                  ? "Puedes reenviar una carta sin fotos nuevas, aunque sumar fotos mejora la confianza."
                  : "Agrega al menos una foto real para que el equipo pueda aprobar el producto."}
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-pokemonYellow/50 bg-pokemonYellow/10 px-4 py-2 text-sm font-black text-pokemonYellow transition hover:bg-pokemonYellow/20">
            <Upload className="h-4 w-4" />
            Agregar fotos
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
                  alt={`Nueva foto real ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 45vw, 180px"
                  src={preview}
                  unoptimized
                />
                <span className="absolute left-2 top-2 rounded bg-blue-950/85 px-2 py-1 text-[10px] font-black uppercase text-white">
                  Nueva {index + 1}
                </span>
                <button
                  aria-label={`Eliminar foto nueva ${index + 1}`}
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
          <div className="mt-4 grid min-h-28 place-items-center rounded-lg border-2 border-dashed border-white/10 text-center text-sm text-slate-500">
            <div>
              <Camera className="mx-auto mb-2 h-7 w-7 text-pokemonYellow" />
              {canSubmit
                ? "Puedes reenviar con las fotos actuales."
                : "Este producto necesita al menos una foto real."}
            </div>
          </div>
        )}
      </section>
      {error ? (
        <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}

      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canSubmit || isSubmitting}
        type="submit"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Guardar y reenviar a revision
      </button>
    </form>
  );
}
