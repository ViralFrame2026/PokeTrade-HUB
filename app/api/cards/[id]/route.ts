import { NextResponse } from "next/server";
import { getCardById } from "@/lib/pokemon-tcg-api";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const card = await getCardById(id);
    return NextResponse.json({ data: card, error: null });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Error inesperado"
      },
      { status: 503 }
    );
  }
}
