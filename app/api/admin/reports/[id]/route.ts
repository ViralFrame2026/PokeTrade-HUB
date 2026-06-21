import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Acceso de administrador requerido." }, { status: 403 });
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id, reporter_id, listing_id, reason")
    .eq("id", id)
    .is("resolved_at", null)
    .maybeSingle();

  if (!report) {
    return NextResponse.json({ error: "Reporte no encontrado." }, { status: 404 });
  }

  const { error } = await supabase
    .from("reports")
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id
    })
    .eq("id", id)
    .is("resolved_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("notifications").insert({
    body: "Revisamos tu reporte y ya quedó marcado como resuelto por el equipo.",
    payload: { listing_id: report.listing_id, report_id: report.id },
    title: "Reporte resuelto",
    type: "report_resolved",
    user_id: report.reporter_id
  });

  return NextResponse.json({ error: null });
}
