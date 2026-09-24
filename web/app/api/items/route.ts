import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get("room_id");

  if (!roomId) {
    return NextResponse.json({ error: "room_id is required" }, { status: 400 });
  }

  let limit = 200;
  const limitParam = searchParams.get("limit");
  if (limitParam !== null) {
    const parsedLimit = Number(limitParam);
    if (Number.isInteger(parsedLimit)) {
      if (parsedLimit < 1) {
        limit = 200;
      } else if (parsedLimit > 1000) {
        limit = 1000;
      } else {
        limit = parsedLimit;
      }
    }
  }

  let offset = 0;
  const offsetParam = searchParams.get("offset");
  if (offsetParam !== null) {
    const parsedOffset = Number(offsetParam);
    if (Number.isInteger(parsedOffset) && parsedOffset >= 0) {
      offset = parsedOffset;
    }
  }

  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .eq("room_id", roomId)
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(items);
}
