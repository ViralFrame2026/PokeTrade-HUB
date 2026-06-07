import Image from "next/image";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import type { Listing } from "@/lib/types";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      aria-label={`Ver publicación de ${listing.title}`}
      className="block"
      href={`/listings/${listing.id}`}
    >
      <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_12px_35px_rgba(30,64,175,0.10)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(30,64,175,0.16)]">
        <div className="relative aspect-[4/3] bg-[linear-gradient(145deg,#eff6ff,#fffbea)]">
          <Image alt={listing.title} className="object-contain p-5" fill sizes="420px" src={listing.image} />
          <div className="absolute left-3 top-3 rounded-full bg-blue-700 px-3 py-1 text-xs font-black text-white shadow-sm">
            {listing.type}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
            {listing.status}
          </div>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-blue-950">{listing.title}</h3>
              <p className="text-sm font-semibold text-slate-500">{listing.cardMeta}</p>
            </div>
            <p className="whitespace-nowrap text-lg font-black text-red-500">{listing.price}</p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{listing.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {listing.location}
            </span>
            <span className="flex items-center gap-1 font-semibold text-blue-900">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {listing.sellerRating}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-blue-100 pt-4 text-sm font-semibold text-blue-700">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            {listing.seller}
            {listing.verified ? (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase text-blue-700">
                Verificado
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
