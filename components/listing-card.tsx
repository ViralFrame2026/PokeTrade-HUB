import Image from "next/image";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import type { Listing } from "@/lib/types";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="glass overflow-hidden rounded-lg">
      <div className="relative aspect-[4/3] bg-slate-900">
        <Image alt={listing.title} className="object-cover" fill sizes="420px" src={listing.image} />
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-black text-pokemonYellow backdrop-blur">
          {listing.type}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200 backdrop-blur">
          {listing.status}
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white">{listing.title}</h3>
            <p className="text-sm font-semibold text-slate-400">{listing.cardMeta}</p>
          </div>
          <p className="whitespace-nowrap text-lg font-black text-pokemonYellow">{listing.price}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-300">{listing.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1 font-semibold text-white">
            <Star className="h-4 w-4 fill-pokemonYellow text-pokemonYellow" />
            {listing.sellerRating}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-sm font-semibold text-blue-100">
          <ShieldCheck className="h-4 w-4 text-pokemonYellow" />
          {listing.seller}
        </div>
      </div>
    </article>
  );
}
