import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const raffleSchema = z.object({
  closesAt: z.string().datetime({ offset: true }).or(z.string().min(16)),
  entryLimit: z.number().int().min(2).max(100000).nullable(),
  imageUrl: z.string().url().max(1000).nullable(),
  prize: z.string().trim().min(5).max(160),
  requirements: z.string().trim().min(10).max(1000),
  title: z.string().trim().min(5).max(100)
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const parsed = raffleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisa los datos del sorteo." },
      { status: 400 }
    );
  }

  const closesAt = new Date(parsed.data.closesAt);
  if (Number.isNaN(closesAt.getTime()) || closesAt.getTime() < Date.now() + 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "El sorteo debe cerrar al menos una hora después de crearlo." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("raffles")
    .insert({
      closes_at: closesAt.toISOString(),
      creator_id: user.id,
      entry_limit: parsed.data.entryLimit,
      image_path: parsed.data.imageUrl,
      moderation_status: "pending",
      prize: parsed.data.prize,
      requirements: parsed.data.requirements,
      title: parsed.data.title,
      type: "free"
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}
