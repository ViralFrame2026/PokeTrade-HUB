import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusSchema = z.object({
  counterpartyId: z.string().uuid().nullable(),
  status: z.enum(["active", "reserved", "sold", "traded", "finished"])
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
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const parsed = statusSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Estado invalido." }, { status: 400 });
  }

  const { error } = await supabase.rpc("set_own_listing_status", {
    counterparty_id: parsed.data.counterpartyId,
    next_status: parsed.data.status,
    target_listing_id: id
  });

  if (error) {
    return NextResponse.json(
      { error: "No pudimos actualizar esta publicación." },
      { status: 403 }
    );
  }

  return NextResponse.json({ error: null });
}
