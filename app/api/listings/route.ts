import { NextResponse } from "next/server";
import { z } from "zod";
import { invalidJsonResponse, readJsonBody } from "@/lib/api";
import { getCardById } from "@/lib/pokemon-tcg-api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const listingSchema = z
  .object({
    accessoryType: z.string().trim().max(80).nullable().optional(),
    cardId: z.string().min(1).max(120).nullable().optional(),
    condition: z.enum([
      "Mint",
      "Near Mint",
      "Lightly Played",
      "Moderately Played",
      "Heavily Played",
      "Damaged"
    ]),
    description: z.string().trim().min(10).max(2000),
    locationCity: z.string().trim().min(2).max(100),
    locationCountry: z.string().trim().min(2).max(100),
    price: z.number().positive().max(999999999).nullable(),
    productCategory: z.enum(["card", "sealed", "accessory"]).default("card"),
    productLanguage: z.string().trim().min(2).max(40),
    productTitle: z.string().trim().max(140).nullable().optional(),
    sealedType: z.string().trim().max(80).nullable().optional(),
    tradeWants: z.string().trim().max(1000).nullable(),
    type: z.enum(["sale", "trade", "free"])
  })
  .superRefine((value, context) => {
    if (value.productCategory === "card" && !value.cardId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona una carta oficial antes de publicar.",
        path: ["cardId"]
      });
    }

    if (value.productCategory !== "card" && !value.productTitle) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica el nombre del producto.",
        path: ["productTitle"]
      });
    }

    if (value.productCategory === "sealed" && !value.sealedType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona el tipo de producto sellado.",
        path: ["sealedType"]
      });
    }

    if (value.productCategory === "accessory" && !value.accessoryType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona el tipo de accesorio.",
        path: ["accessoryType"]
      });
    }

    if (value.type === "sale" && value.price === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las publicaciones de venta requieren un precio.",
        path: ["price"]
      });
    }

    if (value.type === "trade" && !value.tradeWants) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica que buscas a cambio.",
        path: ["tradeWants"]
      });
    }
  });

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { data: null, error: "Debes iniciar sesión para publicar." },
      { status: 401 }
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return invalidJsonResponse("Datos de publicacion invalidos.");
  }

  const parsed = listingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: parsed.error.issues[0]?.message ?? "Datos de publicación inválidos."
      },
      { status: 400 }
    );
  }

  try {
    let databaseCardId: string | null = null;
    let productTitle = parsed.data.productTitle ?? "";
    let listingTitle = parsed.data.productTitle ?? "";

    if (parsed.data.productCategory === "card") {
      const officialCard = await getCardById(parsed.data.cardId!);
      const { data: existingCard } = await supabase
        .from("cards")
        .select("id")
        .eq("pokemon_tcg_id", officialCard.id)
        .maybeSingle();

      databaseCardId = existingCard?.id ?? null;
      productTitle = officialCard.name;
      listingTitle = `${officialCard.name} - ${officialCard.set.name}`;

      if (!databaseCardId) {
        const { data: insertedCard, error: cardError } = await supabase
          .from("cards")
          .insert({
            image_large: officialCard.images.large,
            image_small: officialCard.images.small,
            number: officialCard.number ?? null,
            official_name: officialCard.name,
            official_payload: officialCard,
            pokemon_tcg_id: officialCard.id,
            rarity: officialCard.rarity ?? null,
            set_id: officialCard.set.id,
            set_name: officialCard.set.name
          })
          .select("id")
          .single();

        if (cardError) {
          if (cardError.code !== "23505") {
            throw cardError;
          }

          const { data: concurrentCard, error: concurrentCardError } = await supabase
            .from("cards")
            .select("id")
            .eq("pokemon_tcg_id", officialCard.id)
            .single();

          if (concurrentCardError) {
            throw concurrentCardError;
          }

          databaseCardId = concurrentCard.id;
        } else {
          databaseCardId = insertedCard.id;
        }
      }
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        card_id: databaseCardId,
        category: parsed.data.productCategory,
        condition: parsed.data.condition,
        description: parsed.data.description,
        language: parsed.data.productLanguage,
        accessory_type:
          parsed.data.productCategory === "accessory" ? parsed.data.accessoryType : null,
        owner_id: user.id,
        sealed_type: parsed.data.productCategory === "sealed" ? parsed.data.sealedType : null,
        title: productTitle
      })
      .select("id")
      .single();

    if (productError) {
      throw productError;
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        description: parsed.data.description,
        location_city: parsed.data.locationCity,
        location_country: parsed.data.locationCountry,
        moderation_status: "pending",
        price: parsed.data.type === "sale" ? parsed.data.price : null,
        product_id: product.id,
        seller_id: user.id,
        status: "pending",
        title: listingTitle,
        trade_wants: parsed.data.type === "trade" ? parsed.data.tradeWants : null,
        type: parsed.data.type
      })
      .select("id, moderation_status")
      .single();

    if (listingError) {
      await supabase.from("products").delete().eq("id", product.id);
      throw listingError;
    }

    return NextResponse.json({ data: listing, error: null });
  } catch (error) {
    console.error("Create listing error", error);
    return NextResponse.json(
      {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "No pudimos crear la publicación. Intentá nuevamente."
      },
      { status: 500 }
    );
  }
}
