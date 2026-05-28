import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function GET() {
  const users = db.users.getAll().map(({ password: _, ...u }) => u);
  return NextResponse.json(users);
}
