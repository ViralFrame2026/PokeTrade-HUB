import { NextResponse } from "next/server";
import { z } from "zod";
import { invalidJsonResponse, readJsonBody } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ratingSchema = z.object({
  comment: z.string().trim().max(500).nullable(),
  listingId: z.string().uuid(),
  stars: z.number().int().min(1).max(5)
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const body = await readJsonBody(request);
  if (!body) {
    return invalidJsonResponse("Revisa la valoracion.");
  }

  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisa la valoración." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("submit_listing_rating", {
    rating_comment: parsed.data.comment,
    rating_stars: parsed.data.stars,
    target_listing_id: parsed.data.listingId
  });

  if (error) {
    const messages: Record<string, string> = {
      "Only the selected counterparty can rate this operation":
        "Solo la persona con quien se concreto la operación puede valorar.",
      "Sellers cannot rate themselves": "No puedes valorar tu propia publicación.",
      "The operation is not completed": "La operación todavía no fue finalizada.",
      "This operation has already been rated": "Ya valoraste esta operación."
    };
    return NextResponse.json(
      { error: messages[error.message] ?? error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: { id: data }, error: null });
}
