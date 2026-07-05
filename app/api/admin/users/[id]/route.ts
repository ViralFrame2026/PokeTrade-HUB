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
    const messages: Record<string, string> = {
      "Primary administrator access required":
        "Solo el administrador principal puede gestionar permisos.",
      "The primary administrator cannot be demoted":
        "No puedes quitar el rol principal de la cuenta dueña.",
      "The primary administrator cannot remove their own access":
        "No puedes quitarte tus propios permisos principales."
    };

    return NextResponse.json(
      { error: messages[error.message] ?? "No pudimos actualizar los permisos." },
      { status: 403 }
    );
  }

  return NextResponse.json({ error: null });
}
