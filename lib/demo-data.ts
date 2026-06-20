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
    id: "demo-001",
    cardMeta: "Scarlet & Violet 151 | Ultra Rare | #199",
    description: "Ejemplo visual de publicación con carta oficial, fotos reales y revisión del equipo.",
    image: "https://images.pokemontcg.io/sv3pt5/199_hires.png",
    location: "Buenos Aires, AR",
    price: "$ 58.000",
    seller: "Vendedor verificado",
    sellerRating: "4.9",
    status: "Ejemplo visual",
    title: "Venusaur ex 151",
    type: "Venta",
    verified: true
  },
  {
    id: "demo-002",
    cardMeta: "Vivid Voltage | Rare Holo | #25",
    description: "Busca intercambio por cartas de Gengar, Mew o sealed moderno.",
    image: "https://images.pokemontcg.io/swsh4/25_hires.png",
    location: "Montevideo, UY",
    price: "Intercambio",
    seller: "Intercambiador frecuente",
    sellerRating: "5.0",
    status: "Ejemplo visual",
    title: "Charizard holo",
    type: "Intercambio"
  },
  {
    id: "demo-003",
    cardMeta: "Scarlet & Violet 151 | Producto sellado",
    description: "Producto sellado publicado con fotos reales y aprobación pendiente.",
    image: "https://images.pokemontcg.io/sv3pt5/184_hires.png",
    location: "Santiago, CL",
    price: "$ 72.000",
    seller: "Tienda destacada",
    sellerRating: "4.8",
    status: "Ejemplo visual",
    title: "Blastoise ex 151",
    type: "Venta",
    verified: true
  }
];

export const raffles = [
  {
    entries: "184",
    endsIn: "Cierra en 2 días",
    requirements: "Seguir al organizador, comentar una publicación y tener perfil activo.",
    title: "Pack 151 para la comunidad",
    type: "Gratuito"
  },
  {
    entries: "63/100",
    endsIn: "Cierra en 18 h",
    requirements: "Participación por número con confirmación manual del administrador.",
    title: "Charizard chase night",
    type: "Por número"
  },
  {
    entries: "29",
    endsIn: "Cierra en 5 días",
    requirements: "Reservado para vendedores verificados con reputación mayor a 4.5.",
    title: "Accesorios premium",
    type: "Pago"
  }
];

export const topUsers = [
  {
    badge: "Vendedor destacado",
    city: "Córdoba, Argentina",
    initials: "LC",
    name: "Lucas Cards",
    rating: "4.98"
  },
  {
    badge: "Organizadora de sorteos",
    city: "Lima, Perú",
    initials: "MP",
    name: "Mica Poke",
    rating: "4.96"
  },
  {
    badge: "Intercambiador frecuente",
    city: "Bogotá, Colombia",
    initials: "JR",
    name: "Jota Rarezas",
    rating: "4.91"
  },
  {
    badge: "Vendedor verificado",
    city: "Rosario, Argentina",
    initials: "AN",
    name: "Andes TCG",
    rating: "4.94"
  }
];
