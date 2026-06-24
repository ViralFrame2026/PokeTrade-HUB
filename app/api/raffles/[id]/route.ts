import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { data: raffle } = await supabase
    .from("raffles")
    .select("creator_id, title")
    .eq("id", id)
    .maybeSingle();

  if (!raffle || (raffle.creator_id !== user.id && !profile?.is_admin)) {
    return NextResponse.json(
      { error: "El sorteo no puede eliminarse." },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("raffles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No pudimos eliminar el sorteo." }, { status: 500 });
  }

  const deletedByAdmin = raffle.creator_id !== user.id && Boolean(profile?.is_admin);

  if (deletedByAdmin) {
    await supabase.from("notifications").insert({
      body: "Un administrador elimino tu sorteo por motivos de moderacion o seguridad.",
      payload: {
        raffle_id: id
      },
      title: `Sorteo eliminado: ${raffle.title}`,
      type: "raffle_deleted",
      user_id: raffle.creator_id
    });
  }

  await supabase.from("audit_logs").insert({
    action: "raffle.deleted",
    actor_id: user.id,
    entity_id: id,
    entity_type: "raffle",
    metadata: {
      creator_id: raffle.creator_id,
      deleted_by_admin: deletedByAdmin
    }
  });

  return NextResponse.json({ error: null });
}
