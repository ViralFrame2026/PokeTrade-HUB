import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { EditListingForm } from "@/components/edit-listing-form";
import { firstRelated, productImage, productMeta, productTitle } from "@/lib/product-display";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editar publicacion"
};

type Related<T> = T | T[] | null;

type EditableListing = {
  description: string | null;
  id: string;
  location_city: string | null;
  location_country: string | null;
  moderation_status: string;
  price: number | null;
  rejection_reason: string | null;
  seller_id: string;
  trade_wants: string | null;
  type: "sale" | "trade" | "free";
  listing_images: Array<{
    sort_order: number;
    storage_path: string;
  }>;
  products: Related<{
    accessory_type: string | null;
    category: string | null;
    condition: string;
    sealed_type: string | null;
    title: string | null;
    cards: Related<{
      image_large: string;
      official_name: string;
      set_name: string;
    }>;
  }>;
};

export default async function EditListingPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/account/listings/${id}/edit`);

  const { data } = await supabase
    .from("listings")
    .select(
      "id, seller_id, type, moderation_status, rejection_reason, description, price, trade_wants, location_city, location_country, listing_images(storage_path, sort_order), products!listings_product_id_fkey(category, title, condition, sealed_type, accessory_type, cards!products_card_id_fkey(official_name, image_large, set_name))"
    )
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle();

  const listing = data as EditableListing | null;

  if (
    !listing ||
    !["pending", "rejected", "changes_requested"].includes(listing.moderation_status)
  ) {
    notFound();
  }

  const product = firstRelated(listing.products);

  if (!product) notFound();

  const displayTitle = productTitle(product, "Producto TCG");
  const displayImage = productImage(product);
  const displayMeta = productMeta(product);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-300 hover:text-yellow-300"
          href="/account/listings"
        >
          <ArrowLeft className="h-4 w-4" />
          Mis publicaciones
        </Link>

        <div className="mt-6 grid gap-6 sm:grid-cols-[150px_1fr] sm:items-center">
          <div className="relative mx-auto aspect-[0.72] w-[150px] overflow-hidden rounded-lg bg-slate-900 sm:mx-0">
            <Image
              alt={displayTitle}
              className="object-contain"
              fill
              sizes="150px"
              src={displayImage}
            />
          </div>
          <div>
            <p className="text-sm font-black uppercase text-yellow-300">Corregir publicación</p>
            <h1 className="mt-2 text-4xl font-black">{displayTitle}</h1>
            <p className="mt-2 text-slate-400">{displayMeta}</p>
            {listing.rejection_reason ? (
              <div className="mt-5 flex gap-3 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  <strong>Observacion del moderador:</strong> {listing.rejection_reason}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <EditListingForm
            initial={{
              condition: product.condition,
              description: listing.description ?? "",
              existingPhotoCount: listing.listing_images?.length ?? 0,
              locationCity: listing.location_city ?? "",
              locationCountry: listing.location_country ?? "",
              price: listing.price,
              productCategory: product.category ?? "card",
              productTitle: displayTitle,
              tradeWants: listing.trade_wants ?? "",
              type: listing.type
            }}
            listingId={listing.id}
          />
        </div>
      </div>
    </main>
  );
}
