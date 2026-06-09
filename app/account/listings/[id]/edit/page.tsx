import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { EditListingForm } from "@/components/edit-listing-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
  products: Related<{
    condition: string;
    cards: Related<{
      image_large: string;
      official_name: string;
      set_name: string;
    }>;
  }>;
};

function firstRelated<T>(value: Related<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

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
      "id, seller_id, type, moderation_status, rejection_reason, description, price, trade_wants, location_city, location_country, products!listings_product_id_fkey(condition, cards!products_card_id_fkey(official_name, image_large, set_name))"
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
  const card = firstRelated(product?.cards ?? null);

  if (!product || !card) notFound();

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
              alt={card.official_name}
              className="object-contain"
              fill
              sizes="150px"
              src={card.image_large}
            />
          </div>
          <div>
            <p className="text-sm font-black uppercase text-yellow-300">Corregir publicacion</p>
            <h1 className="mt-2 text-4xl font-black">{card.official_name}</h1>
            <p className="mt-2 text-slate-400">{card.set_name}</p>
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
              locationCity: listing.location_city ?? "",
              locationCountry: listing.location_country ?? "",
              price: listing.price,
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
