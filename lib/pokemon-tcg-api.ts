import { z } from "zod";

const API_BASE_URL = "https://api.pokemontcg.io/v2";
const CACHE_TTL_MS = 1000 * 60 * 10;

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();

const cardSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z.object({
    small: z.string().url(),
    large: z.string().url()
  }),
  number: z.string().optional(),
  rarity: z.string().optional(),
  set: z.object({
    id: z.string(),
    name: z.string(),
    series: z.string().optional()
  })
});

const setSchema = z.object({
  id: z.string(),
  name: z.string(),
  series: z.string().optional(),
  printedTotal: z.number().optional(),
  total: z.number().optional(),
  releaseDate: z.string().optional(),
  images: z
    .object({
      symbol: z.string().url().optional(),
      logo: z.string().url().optional()
    })
    .optional()
});

const cardsResponseSchema = z.object({
  data: z.array(cardSchema)
});

const cardResponseSchema = z.object({
  data: cardSchema
});

const setsResponseSchema = z.object({
  data: z.array(setSchema)
});

export type PokemonTcgCard = z.infer<typeof cardSchema>;
export type PokemonTcgSet = z.infer<typeof setSchema>;

type RequestOptions = {
  page?: number;
  pageSize?: number;
  q?: string;
};

class PokemonTcgApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PokemonTcgApiError";
  }
}

async function request<T>(path: string, schema: z.Schema<T>, options: RequestOptions = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (options.q) {
    url.searchParams.set("q", options.q);
  }

  if (options.page) {
    url.searchParams.set("page", String(options.page));
  }

  if (options.pageSize) {
    url.searchParams.set("pageSize", String(options.pageSize));
  }

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const headers: HeadersInit = {
    Accept: "application/json"
  };

  if (process.env.POKEMON_TCG_API_KEY) {
    headers["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
  }

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      throw new PokemonTcgApiError(`Pokemon TCG API responded with ${response.status}`);
    }

    const parsed = schema.parse(await response.json());
    cache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value: parsed
    });

    return parsed;
  } catch (error) {
    console.error("Pokemon TCG API error", error);
    throw new PokemonTcgApiError(
      "No pudimos consultar el catalogo oficial en este momento. Intentá nuevamente."
    );
  }
}

function escapeQueryValue(value: string) {
  return value.replaceAll('"', '\\"').trim();
}

export async function searchCards(query: string, pageSize = 20) {
  const q = query.trim()
    ? `name:"*${escapeQueryValue(query)}*" OR set.name:"*${escapeQueryValue(query)}*"`
    : "";
  const result = await request("/cards", cardsResponseSchema, { pageSize, q });
  return result.data;
}

export async function getCardById(id: string) {
  const result = await request(`/cards/${encodeURIComponent(id)}`, cardResponseSchema);
  return result.data;
}

export async function getSets() {
  const result = await request("/sets", setsResponseSchema, { pageSize: 250 });
  return result.data;
}

export async function getCardsBySet(setId: string, pageSize = 50) {
  const result = await request("/cards", cardsResponseSchema, {
    pageSize,
    q: `set.id:${escapeQueryValue(setId)}`
  });
  return result.data;
}

export async function getCardsByPokemon(pokemonName: string, pageSize = 30) {
  const result = await request("/cards", cardsResponseSchema, {
    pageSize,
    q: `name:"${escapeQueryValue(pokemonName)}"`
  });
  return result.data;
}

export async function getCardsByRarity(rarity: string, pageSize = 30) {
  const result = await request("/cards", cardsResponseSchema, {
    pageSize,
    q: `rarity:"${escapeQueryValue(rarity)}"`
  });
  return result.data;
}
