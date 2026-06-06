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
          className="foil absolute w-[220px] rounded-lg border border-blue-100 bg-white p-3 shadow-[0_22px_65px_rgba(37,99,235,0.20)] transition hover:-translate-y-2 sm:w-[260px]"
          key={card.id}
          style={{
            left: `${index * 22}%`,
            top: `${index % 2 === 0 ? 6 + index * 9 : 18 + index * 10}%`,
            rotate: `${index === 0 ? "-7deg" : index === 1 ? "8deg" : "-2deg"}`
          }}
        >
          <div className="relative aspect-[0.72] overflow-hidden rounded-md bg-blue-50">
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
            <h3 className="font-black text-blue-950">{card.name}</h3>
            <p className="text-sm font-semibold text-blue-600">{card.set}</p>
          </div>
        </article>
      ))}
      <div className="absolute bottom-2 right-2 max-w-xs rounded-lg border border-yellow-300 bg-white/95 p-5 shadow-lg backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-500">
          Sin cartas inventadas
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Las publicaciones de cartas se enlazan con IDs oficiales de la API
          Pokemon TCG.
        </p>
      </div>
    </div>
  );
}
