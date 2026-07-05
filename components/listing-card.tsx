import Image from "next/image";
import { ExternalLink, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { ListingCardFavoriteButton } from "@/components/listing-card-favorite-button";
import type { Listing } from "@/lib/types";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const isExample = listing.id.startsWith("demo-") || listing.status === "Ejemplo visual";
  const detailHref = isExample ? "/publish" : `/listings/${listing.id}`;
  const sellerContent = (
    <>
      <ShieldCheck className="h-4 w-4 text-blue-600" />
      {listing.seller}
      {listing.verified ? (
        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase text-blue-700">
          Verificado
        </span>
      ) : null}
    </>
  );

  return (
    <article className="group overflow-hidden rounded-lg border border-white/10 bg-slate-950/88 text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition hover:-translate-y-1 hover:border-yellow-300/50 hover:shadow-[0_24px_70px_rgba(37,99,235,0.24)]">
      <Link
        aria-label={`Ver publicación de ${listing.title}`}
        className="block"
        href={detailHref}
      >
        <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_22%_16%,rgba(250,204,21,0.24),transparent_34%),linear-gradient(145deg,#172554,#0f172a_58%,#111827)]">
          <Image
            alt={listing.title}
            className="object-contain p-5 transition duration-300 group-hover:scale-[1.04]"
            fill
            sizes="420px"
            src={listing.image}
          />
          <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-blue-950 shadow-sm">
            {listing.type}
          </div>
          <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-blue-950/80 px-3 py-1 text-xs font-black text-blue-100 backdrop-blur">
            {listing.status}
          </div>
        </div>
        <div className="p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <h3 className="break-words text-lg font-black text-white">{listing.title}</h3>
              <p className="text-sm font-semibold text-blue-200">{listing.cardMeta}</p>
            </div>
            <p className="max-w-full break-words text-lg font-black text-yellow-300 sm:max-w-[42%] sm:text-right">
              {listing.price}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-300">
            {listing.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="break-words">{listing.location}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-yellow-200">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {listing.sellerRating}
            </span>
          </div>
        </div>
      </Link>

      <div className="grid gap-3 border-t border-white/10 px-5 py-4">
        {listing.sellerId ? (
          <Link
            className="flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-yellow-300"
            href={`/users/${listing.sellerId}`}
          >
            {sellerContent}
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
            {sellerContent}
          </div>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-black text-white transition hover:bg-blue-500"
            href={detailHref}
          >
            <ExternalLink className="h-4 w-4" />
            {isExample ? "Publicar similar" : "Ver detalle"}
          </Link>
          <ListingCardFavoriteButton
            detailHref={detailHref}
            initialFavorite={listing.isFavorite}
            isExample={isExample}
            listingId={listing.id}
          />
        </div>
      </div>
    </article>
  );
}
