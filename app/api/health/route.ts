import { NextResponse } from "next/server";

export function GET() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const configured = hasSupabaseUrl && hasSupabaseAnonKey;

  return NextResponse.json(
    {
      ok: configured,
      service: "nexotcg",
      supabase: {
        anonKey: hasSupabaseAnonKey,
        url: hasSupabaseUrl
      },
      timestamp: new Date().toISOString()
    },
    {
      status: configured ? 200 : 503
    }
  );
}
