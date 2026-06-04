import type { FeaturedCard, Listing } from "@/lib/types";

export const featuredCards: FeaturedCard[] = [
  {
    id: "swsh4-25",
    image: "https://images.pokemontcg.io/swsh4/25_hires.png",
    name: "Charizard",
    set: "Vivid Voltage"
  },
  {
    id: "sv3pt5-199",
    image: "https://images.pokemontcg.io/sv3pt5/199_hires.png",
    name: "Venusaur ex",
    set: "Scarlet & Violet 151"
  },
  {
    id: "sv3pt5-184",
    image: "https://images.pokemontcg.io/sv3pt5/184_hires.png",
    name: "Blastoise ex",
    set: "Scarlet & Violet 151"
  }
];

export const latestListings: Listing[] = [
  {
    id: "lst-001",
    cardMeta: "sv3pt5-199 · Ultra Rare",
    description: "Carta oficial seleccionada desde catalogo, fotos reales listas para moderacion.",
    image: "https://images.pokemontcg.io/sv3pt5/199_hires.png",
    location: "Buenos Aires, AR",
    price: "$ 58.000",
    seller: "Vendedor verificado",
    sellerRating: "4.9",
    status: "Aprobada",
    title: "Venusaur ex 151",
    type: "Venta"
  },
  {
    id: "lst-002",
    cardMeta: "swsh4-25 · Rare Holo",
    description: "Busca intercambio por cartas de Gengar, Mew o sealed moderno.",
    image: "https://images.pokemontcg.io/swsh4/25_hires.png",
    location: "Montevideo, UY",
    price: "Intercambio",
    seller: "Intercambiador frecuente",
    sellerRating: "5.0",
    status: "Activo",
    title: "Charizard holo",
    type: "Intercambio"
  },
  {
    id: "lst-003",
    cardMeta: "Producto sellado · ETB",
    description: "Elite Trainer Box sellada, publicada con fotos reales y aprobacion pendiente.",
    image: "https://images.pokemontcg.io/sv3pt5/185_hires.png",
    location: "Santiago, CL",
    price: "$ 72.000",
    seller: "Tienda destacada",
    sellerRating: "4.8",
    status: "Pendiente",
    title: "ETB Scarlet & Violet",
    type: "Sellado"
  }
];

export const raffles = [
  {
    entries: "184",
    endsIn: "Cierra en 2 dias",
    requirements: "Seguir al organizador, comentar una publicacion y tener perfil activo.",
    title: "Pack 151 para la comunidad",
    type: "Gratuito"
  },
  {
    entries: "63/100",
    endsIn: "Cierra en 18 h",
    requirements: "Participacion por numero con confirmacion manual del administrador.",
    title: "Charizard chase night",
    type: "Por numero"
  },
  {
    entries: "29",
    endsIn: "Cierra en 5 dias",
    requirements: "Reservado para vendedores verificados con reputacion mayor a 4.5.",
    title: "Accesorios premium",
    type: "Pago"
  }
];

export const topUsers = [
  {
    badge: "Vendedor Destacado",
    city: "Cordoba, Argentina",
    initials: "LC",
    name: "Lucas Cards",
    rating: "4.98"
  },
  {
    badge: "Organizadora de Sorteos",
    city: "Lima, Peru",
    initials: "MP",
    name: "Mica Poke",
    rating: "4.96"
  },
  {
    badge: "Intercambiador Frecuente",
    city: "Bogota, Colombia",
    initials: "JR",
    name: "Jota Rarezas",
    rating: "4.91"
  },
  {
    badge: "Vendedor Verificado",
    city: "Rosario, Argentina",
    initials: "AN",
    name: "Andes TCG",
    rating: "4.94"
  }
];
