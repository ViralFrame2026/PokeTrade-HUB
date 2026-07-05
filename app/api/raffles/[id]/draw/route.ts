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

  const { data, error } = await supabase.rpc("draw_raffle_winner", {
    target_raffle_id: id
  });

  if (error) {
    const messages: Record<string, string> = {
      "A winner has already been selected": "Este sorteo ya tiene ganador.",
      "Only approved raffles can be drawn": "El sorteo debe estar aprobado.",
      "Only the organizer can draw this raffle": "Solo el organizador puede elegir al ganador.",
      "Raffle not found": "Sorteo no encontrado.",
      "The raffle has no participants": "El sorteo no tiene participantes.",
      "The raffle is still open": "Debes esperar hasta la fecha de cierre."
    };

    return NextResponse.json(
      { error: messages[error.message] ?? "No pudimos elegir al ganador." },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: { winnerId: data }, error: null });
}
