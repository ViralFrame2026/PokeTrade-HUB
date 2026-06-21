import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const commissionSchema = z.object({
  status: z.enum(["pending", "invoiced", "paid", "waived"])
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
      { error: "Solo el administrador principal puede gestionar comisiones." },
      { status: 403 }
    );
  }

  const parsed = commissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado de comisión inválido." }, { status: 400 });
  }

  const { error } = await supabase
    .from("sale_commissions")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}
