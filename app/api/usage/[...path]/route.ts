import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

const ALLOWED_PATHS = new Set([
  "overview",
  "breakdown",
  "trend",
  "trend/breakdown",
]);

/**
 * Proxies the admin-only `/analytics/usage/*` endpoints with the signed-in
 * user's Keycloak access token, so the token never reaches the browser.
 * The backend enforces the admin role.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join("/");
  if (!ALLOWED_PATHS.has(path)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  let accessToken: string | undefined;
  let authHeaders: Headers | undefined;
  try {
    const result = await auth.api.getAccessToken({
      body: { providerId: "keycloak" },
      headers: req.headers,
      returnHeaders: true,
    });
    accessToken = result.response.accessToken;
    authHeaders = result.headers;
  } catch {
    // No session or no linked Keycloak account
  }
  if (!accessToken) {
    return NextResponse.json({ message: "Not signed in" }, { status: 401 });
  }

  const upstream = await fetch(
    `${API_BASE}/analytics/usage/${path}${req.nextUrl.search}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
  // Persist a refreshed token in the account cookie
  for (const cookie of authHeaders?.getSetCookie() ?? []) {
    res.headers.append("set-cookie", cookie);
  }
  return res;
}
