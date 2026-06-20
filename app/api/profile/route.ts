import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const profileSchema = z
  .object({
    bio: z.string().trim().max(500),
    city: z.string().trim().max(100),
    country: z.string().trim().max(100),
    displayName: z.string().trim().min(2).max(80),
    instagram: z.string().trim().max(100),
    whatsapp: z.string().trim().max(30)
  })
  .superRefine((value, context) => {
    if (value.whatsapp && value.whatsapp.replace(/\D/g, "").length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Revisa el número de WhatsApp.",
        path: ["whatsapp"]
      });
    }
  });

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos de perfil invalidos." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      bio: parsed.data.bio || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      display_name: parsed.data.displayName,
      instagram: parsed.data.instagram || null,
      whatsapp: parsed.data.whatsapp || null
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}
