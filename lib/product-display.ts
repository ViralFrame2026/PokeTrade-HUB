type Related<T> = T | T[] | null | undefined;

export type ProductDisplayCard = {
  image_large?: string | null;
  number?: string | null;
  official_name?: string | null;
  pokemon_tcg_id?: string | null;
  rarity?: string | null;
  set_name?: string | null;
};

export type ProductDisplayInput = {
  accessory_type?: string | null;
  cards?: Related<ProductDisplayCard>;
  category?: string | null;
  condition?: string | null;
  sealed_type?: string | null;
  title?: string | null;
};

export function firstRelated<T>(value: Related<T>) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export function productCategoryLabel(category?: string | null) {
  return {
    accessory: "Accesorio TCG",
    card: "Carta individual",
    sealed: "Producto sellado"
  }[category ?? ""] ?? "Producto TCG";
}

export function productTypeDetail(product?: ProductDisplayInput | null) {
  if (!product) return "Producto TCG";
  if (product.category === "sealed") return product.sealed_type || "Producto sellado";
  if (product.category === "accessory") return product.accessory_type || "Accesorio TCG";

  const card = firstRelated(product.cards);
  return card?.set_name || "Carta Pokemon TCG";
}

export function productTitle(product?: ProductDisplayInput | null, fallback = "Producto TCG") {
  const card = firstRelated(product?.cards);
  return card?.official_name || product?.title || fallback;
}

export function productImage(product?: ProductDisplayInput | null) {
  const card = firstRelated(product?.cards);
  if (card?.image_large) return card.image_large;
  if (product?.category === "sealed") return "/assets/chaos-rising-etb.webp";
  if (product?.category === "accessory") return "/assets/pokemon-card-banner.webp";
  return "/assets/mega-charizard-tins.webp";
}

export function productMeta(product?: ProductDisplayInput | null) {
  if (!product) return "Producto TCG";

  const card = firstRelated(product.cards);
  if (card) {
    return `${card.set_name ?? "Set no informado"} | ${card.rarity ?? "Rareza no informada"} | #${card.number ?? "N/D"}`;
  }

  return [
    productCategoryLabel(product.category),
    productTypeDetail(product),
    product.condition
  ]
    .filter(Boolean)
    .join(" | ");
}

export function isCardProduct(product?: ProductDisplayInput | null) {
  return product?.category === "card" || Boolean(firstRelated(product?.cards));
}
