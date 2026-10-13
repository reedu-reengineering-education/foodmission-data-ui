import { NextRequest, NextResponse } from "next/server";
import { getAdminStatus } from "@/lib/admin";

export async function GET(req: NextRequest) {
  return NextResponse.json(await getAdminStatus(req.headers));
}
