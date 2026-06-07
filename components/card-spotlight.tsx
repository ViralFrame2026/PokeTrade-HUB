import Image from "next/image";

const heroProducts = [
  {
    alt: "Caja de entrenador elite Llamaradas Fantasmales",
    imageClassName:
      "max-h-[170px] sm:max-h-[210px] lg:max-h-[235px]",
    height: 477,
    src: "/assets/phantasmal-etb-transparent.png",
    width: 500
  },
  {
    alt: "Caja de entrenador elite Caos Creciente",
    imageClassName:
      "max-h-[170px] sm:max-h-[210px] lg:max-h-[235px]",
    height: 3840,
    src: "/assets/chaos-rising-etb.webp",
    width: 3840
  },
];

const looseCards = [
  {
    alt: "Carta oficial Charizard de Pokemon TCG",
    className: "-rotate-[5deg]",
    src: "/assets/hero-card-charizard.png"
  },
  {
    alt: "Carta oficial Venusaur ex de Pokemon TCG",
    className: "rotate-[2deg]",
    src: "/assets/hero-card-venusaur.png"
  },
  {
    alt: "Carta oficial Blastoise ex de Pokemon TCG",
    className: "rotate-[6deg]",
    src: "/assets/hero-card-blastoise.png"
  }
];

export function CardSpotlight() {
  return (
    <div className="relative flex h-full min-h-[350px] min-w-0 items-center justify-center overflow-hidden sm:min-h-[440px] lg:min-h-[520px]">
      <div
        className="absolute inset-x-[8%] bottom-[9%] h-[24%] rounded-[50%] bg-blue-950/45 blur-2xl"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 top-[2%] z-10 grid grid-cols-2 items-end gap-2 px-6 sm:px-10 lg:px-12">
        {heroProducts.map((product) => (
          <figure
            className="flex min-w-0 items-end justify-center"
            key={product.src}
          >
            <Image
              alt={product.alt}
              className={`h-auto min-w-0 w-auto max-w-full object-contain drop-shadow-[0_24px_20px_rgba(3,7,18,0.55)] transition duration-300 hover:-translate-y-2 ${product.imageClassName}`}
              height={product.height}
              priority
              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 280px"
              src={product.src}
              unoptimized
              width={product.width}
            />
          </figure>
        ))}
      </div>

      <div className="absolute left-1/2 top-[52%] z-30 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 sm:gap-3">
        {looseCards.map((card) => (
          <figure className="shrink-0" key={card.src}>
            <Image
              alt={card.alt}
              className={`h-auto w-[76px] object-contain drop-shadow-[0_18px_16px_rgba(3,7,18,0.65)] transition duration-300 hover:z-40 hover:-translate-y-2 hover:rotate-0 sm:w-[94px] lg:w-[108px] ${card.className}`}
              height={367}
              priority
              sizes="(max-width: 640px) 76px, (max-width: 1024px) 94px, 108px"
              src={card.src}
              width={263}
            />
          </figure>
        ))}
      </div>

      <Image
        alt="Latas oficiales Mega Charizard X y Mega Charizard Y"
        className="absolute bottom-[1%] left-1/2 z-20 h-auto max-h-[150px] w-auto max-w-[48%] -translate-x-1/2 object-contain drop-shadow-[0_22px_18px_rgba(3,7,18,0.55)] transition duration-300 hover:-translate-y-2 sm:max-h-[175px] lg:max-h-[195px]"
        height={533}
        priority
        sizes="(max-width: 640px) 48vw, 230px"
        src="/assets/mega-charizard-tins.webp"
        unoptimized
        width={533}
      />
    </div>
  );
}
