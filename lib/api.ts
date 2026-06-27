import { NextResponse } from "next/server";

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function invalidJsonResponse(message = "Revisa los datos enviados.") {
  return NextResponse.json({ error: message }, { status: 400 });
}
