import { NextResponse } from "next/server";
import { searchCards } from "@/lib/pokemon-tcg-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json({ data: [], error: null });
  }

  try {
    const cards = await searchCards(query);
    return NextResponse.json({ data: cards, error: null });
  } catch (error) {
    return NextResponse.json(
      {
        data: [],
        error: error instanceof Error ? error.message : "Error inesperado"
      },
      { status: 503 }
    );
  }
}
