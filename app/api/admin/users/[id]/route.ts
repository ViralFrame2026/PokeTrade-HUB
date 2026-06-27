import { NextResponse } from "next/server";
import { z } from "zod";
import { invalidJsonResponse, readJsonBody } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const roleSchema = z.object({
  enabled: z.boolean()
});

export async function PATCH(
  request: Request,
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
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    return NextResponse.json(
      { error: "Solo el administrador principal puede gestionar permisos." },
      { status: 403 }
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return invalidJsonResponse("Permiso invalido.");
  }

  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Permiso invalido." }, { status: 400 });
  }

  const { error } = await supabase.rpc("set_admin_role", {
    enabled: parsed.data.enabled,
    target_profile_id: id
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.json({ error: null });
}
