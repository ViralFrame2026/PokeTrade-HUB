import { NextResponse } from "next/server";
import { internalErrorResponse } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    return internalErrorResponse("No pudimos actualizar las notificaciones.", error);
  }

  return NextResponse.json({ error: null });
}
