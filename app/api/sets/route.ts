import { NextResponse } from "next/server";
import { getSets } from "@/lib/pokemon-tcg-api";

export async function GET() {
  try {
    const sets = await getSets();
    return NextResponse.json({ data: sets, error: null });
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
