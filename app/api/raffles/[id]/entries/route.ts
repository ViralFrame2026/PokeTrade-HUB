import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { data: raffle } = await supabase
    .from("raffles")
    .select("id, creator_id, closes_at, entry_limit, moderation_status, type")
    .eq("id", id)
    .maybeSingle();

  if (
    !raffle ||
    raffle.moderation_status !== "approved" ||
    raffle.type !== "free" ||
    new Date(raffle.closes_at).getTime() <= Date.now()
  ) {
    return NextResponse.json({ error: "Este sorteo no acepta participantes." }, { status: 400 });
  }

  if (raffle.creator_id === user.id) {
    return NextResponse.json(
      { error: "El organizador no puede participar en su propio sorteo." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("raffle_entries")
    .select("id")
    .eq("raffle_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Ya estas participando." }, { status: 409 });
  }

  const { error } = await supabase.from("raffle_entries").insert({
    raffle_id: id,
    user_id: user.id
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}
