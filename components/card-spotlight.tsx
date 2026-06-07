import Image from "next/image";

const heroProducts = [
  {
    alt: "Caja de entrenador elite Llamaradas Fantasmales",
    imageClassName:
      "col-span-1 max-h-[190px] justify-self-end sm:max-h-[235px] lg:max-h-[270px]",
    height: 477,
    src: "/assets/phantasmal-etb-transparent.png",
    width: 500
  },
  {
    alt: "Caja de entrenador elite Caos Creciente",
    imageClassName:
      "col-span-1 max-h-[190px] justify-self-start sm:max-h-[235px] lg:max-h-[270px]",
    height: 3840,
    src: "/assets/chaos-rising-etb.webp",
    width: 3840
  },
  {
    alt: "Latas oficiales Mega Charizard X y Mega Charizard Y",
    imageClassName:
      "col-span-2 max-h-[175px] justify-self-center sm:max-h-[210px] lg:max-h-[235px]",
    height: 533,
    src: "/assets/mega-charizard-tins.webp",
    width: 533
  }
];

const looseCards = [
  {
    alt: "Carta oficial Charizard de Pokemon TCG",
    className:
      "left-[1%] top-[19%] w-[72px] -rotate-[10deg] sm:left-[2%] sm:w-[90px] lg:left-[-1%] lg:w-[112px]",
    src: "/assets/hero-card-charizard.png"
  },
  {
    alt: "Carta oficial Venusaur ex de Pokemon TCG",
    className:
      "right-[1%] top-[21%] w-[70px] rotate-[9deg] sm:right-[2%] sm:w-[88px] lg:right-[-1%] lg:w-[108px]",
    src: "/assets/hero-card-venusaur.png"
  },
  {
    alt: "Carta oficial Blastoise ex de Pokemon TCG",
    className:
      "bottom-[8%] left-[12%] w-[68px] -rotate-[7deg] sm:left-[14%] sm:w-[84px] lg:bottom-[5%] lg:left-[16%] lg:w-[102px]",
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

      {looseCards.map((card) => (
        <Image
          alt={card.alt}
          className={`absolute z-10 h-auto object-contain drop-shadow-[0_18px_16px_rgba(3,7,18,0.6)] transition duration-300 hover:z-30 hover:-translate-y-2 hover:rotate-0 ${card.className}`}
          height={367}
          key={card.src}
          priority
          sizes="(max-width: 640px) 72px, (max-width: 1024px) 90px, 112px"
          src={card.src}
          width={263}
        />
      ))}

      <div className="relative z-20 grid min-w-0 w-full max-w-[610px] grid-cols-2 items-end gap-x-2 gap-y-1 px-10 sm:gap-x-4 sm:px-12 lg:px-14">
        {heroProducts.map((product) => (
          <figure
            className={`flex min-w-0 items-end justify-center ${
              product.imageClassName.includes("col-span-2") ? "col-span-2" : ""
            }`}
            key={product.src}
          >
            <Image
              alt={product.alt}
              className={`h-auto min-w-0 w-auto max-w-full object-contain drop-shadow-[0_24px_20px_rgba(3,7,18,0.55)] transition duration-300 hover:-translate-y-2 ${product.imageClassName.replace("col-span-2 ", "")}`}
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
    </div>
  );
}
