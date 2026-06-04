import Image from "next/image";
import type { FeaturedCard } from "@/lib/types";

type CardSpotlightProps = {
  cards: FeaturedCard[];
};

export function CardSpotlight({ cards }: CardSpotlightProps) {
  return (
    <div className="absolute inset-0">
      {cards.map((card, index) => (
        <article
          className="foil glass absolute w-[220px] rounded-lg p-3 shadow-foil transition hover:-translate-y-2 sm:w-[260px]"
          key={card.id}
          style={{
            left: `${index * 22}%`,
            top: `${index % 2 === 0 ? 6 + index * 9 : 18 + index * 10}%`,
            rotate: `${index === 0 ? "-7deg" : index === 1 ? "8deg" : "-2deg"}`
          }}
        >
          <div className="relative aspect-[0.72] overflow-hidden rounded-md bg-slate-900">
            <Image
              alt={card.name}
              className="object-cover"
              fill
              priority={index === 0}
              sizes="260px"
              src={card.image}
            />
          </div>
          <div className="relative mt-3">
            <h3 className="font-black text-white">{card.name}</h3>
            <p className="text-sm font-semibold text-pokemonYellow">{card.set}</p>
          </div>
        </article>
      ))}
      <div className="absolute bottom-2 right-2 max-w-xs rounded-lg border border-white/10 bg-slate-950/80 p-5 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-pokemonYellow">
          Sin cartas inventadas
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Las publicaciones de cartas se enlazan con IDs oficiales de la API
          Pokemon TCG.
        </p>
      </div>
    </div>
  );
}
