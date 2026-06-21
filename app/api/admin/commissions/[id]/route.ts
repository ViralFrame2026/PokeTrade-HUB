import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const commissionSchema = z.object({
  status: z.enum(["pending", "invoiced", "paid", "waived"])
});

const statusLabels = {
  invoiced: "facturada",
  paid: "pagada",
  pending: "pendiente",
  waived: "perdonada"
};

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
    return NextResponse.json({ error: "Estado de comision invalido." }, { status: 400 });
  }

  const { data: commission } = await supabase
    .from("sale_commissions")
    .select("id, seller_id, listing_id, status, listings!sale_commissions_listing_id_fkey(title)")
    .eq("id", id)
    .maybeSingle();

  if (!commission) {
    return NextResponse.json({ error: "Comision no encontrada." }, { status: 404 });
  }

  const { error } = await supabase
    .from("sale_commissions")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (commission.status !== parsed.data.status) {
    const listing = Array.isArray(commission.listings)
      ? commission.listings[0]
      : commission.listings;

    await supabase.from("notifications").insert({
      body: `La comision de "${listing?.title ?? "tu venta"}" ahora figura como ${
        statusLabels[parsed.data.status]
      }.`,
      payload: { commission_id: commission.id, listing_id: commission.listing_id },
      title: "Estado de comision actualizado",
      type: "commission_status_updated",
      user_id: commission.seller_id
    });
  }

  return NextResponse.json({ error: null });
}
