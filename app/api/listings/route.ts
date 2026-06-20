import { NextResponse } from "next/server";
import { z } from "zod";
import { getCardById } from "@/lib/pokemon-tcg-api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const listingSchema = z
  .object({
    cardId: z.string().min(1).max(120),
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
    tradeWants: z.string().trim().max(1000).nullable(),
    type: z.enum(["sale", "trade", "free"])
  })
  .superRefine((value, context) => {
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

  const parsed = listingSchema.safeParse(await request.json());

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
    const officialCard = await getCardById(parsed.data.cardId);
    const { data: existingCard } = await supabase
      .from("cards")
      .select("id")
      .eq("pokemon_tcg_id", officialCard.id)
      .maybeSingle();

    let databaseCardId = existingCard?.id;

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

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        card_id: databaseCardId,
        category: "card",
        condition: parsed.data.condition,
        description: parsed.data.description,
        owner_id: user.id,
        title: officialCard.name
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
        title: `${officialCard.name} - ${officialCard.set.name}`,
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
