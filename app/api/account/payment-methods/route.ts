import { NextResponse } from "next/server";
import { z } from "zod";
import { internalErrorResponse, invalidJsonResponse, readJsonBody } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paymentMethodsSchema = z.object({
  paymentAlias: z.string().trim().max(120),
  paymentCvu: z.string().trim().max(80),
  paymentHolderName: z.string().trim().max(120),
  paymentNotes: z.string().trim().max(700)
});

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 });
  }

  const body = await readJsonBody(request);
  if (!body) {
    return invalidJsonResponse("Datos de pago invalidos.");
  }

  const parsed = paymentMethodsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos de pago invalidos." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      payment_alias: parsed.data.paymentAlias || null,
      payment_cvu: parsed.data.paymentCvu || null,
      payment_holder_name: parsed.data.paymentHolderName || null,
      payment_notes: parsed.data.paymentNotes || null,
      payment_updated_at: new Date().toISOString()
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (error) {
    return internalErrorResponse("No pudimos actualizar tus metodos de cobro.", error);
  }

  return NextResponse.json({ error: null });
}
