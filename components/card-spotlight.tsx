import Image from "next/image";
import type { FeaturedCard } from "@/lib/types";

type CardSpotlightProps = {
  cards: FeaturedCard[];
};

export function CardSpotlight({ cards }: CardSpotlightProps) {
  const primaryCard = cards[0];
  const sealedProducts = [
    {
      image: "/assets/official-etb.png",
      label: "Elite Trainer Box",
      position:
        "right-[1%] top-[4%] w-[44%] max-w-[255px] rotate-[2deg] sm:right-[2%]"
    },
    {
      image: "/assets/official-booster-display.png",
      label: "Booster Display",
      position:
        "bottom-[3%] right-[2%] w-[37%] max-w-[215px] rotate-[2deg] sm:right-[3%]"
    },
    {
      image: "/assets/official-booster-bundle.png",
      label: "Booster Bundle",
      position:
        "bottom-[4%] left-[43%] w-[29%] max-w-[165px] rotate-[-3deg] sm:left-[45%]"
    }
  ];

  if (!primaryCard) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-[2%] top-[10%] h-72 w-72 rounded-full border border-white/15 bg-white/10 blur-[1px] sm:h-80 sm:w-80"
        aria-hidden="true"
      />

      <article className="foil absolute left-[2%] top-[14%] z-20 w-[42%] max-w-[235px] rotate-[-5deg] rounded-lg border border-blue-100 bg-white p-2.5 shadow-[0_28px_70px_rgba(15,23,42,0.38)] transition hover:-translate-y-2 hover:rotate-[-2deg] sm:left-[5%] sm:p-3">
        <div className="relative aspect-[0.72] overflow-hidden rounded-md bg-blue-50">
          <Image
            alt={primaryCard.name}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 640px) 42vw, 235px"
            src={primaryCard.image}
          />
        </div>
        <div className="relative mt-3">
          <h3 className="font-black text-blue-950">{primaryCard.name}</h3>
          <p className="text-sm font-semibold text-blue-600">{primaryCard.set}</p>
        </div>
      </article>

      {sealedProducts.map((product) => (
        <figure
          className={`absolute z-10 transition hover:z-30 hover:-translate-y-1 ${product.position}`}
          key={product.label}
        >
          <Image
            alt={`Producto oficial Pokemon TCG: ${product.label}`}
            className="h-auto w-full object-contain drop-shadow-[0_18px_18px_rgba(15,23,42,0.36)]"
            height={325}
            priority
            sizes="(max-width: 640px) 52vw, 305px"
            src={product.image}
            unoptimized
            width={578}
          />
        </figure>
      ))}
    </div>
  );
}
