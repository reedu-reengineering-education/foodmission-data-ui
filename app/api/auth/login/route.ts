import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") ?? "/";

  const issuer = process.env.KEYCLOAK_ISSUER!;
  const clientId = process.env.KEYCLOAK_CLIENT_ID!;
  const baseUrl = process.env.BETTER_AUTH_URL!;
  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/callback`,
    scope: "openid profile email",
    state: `${state}:${encodeURIComponent(callbackUrl)}`,
  });

  const authUrl = `${issuer}/protocol/openid-connect/auth?${params}`;
  const response = NextResponse.redirect(authUrl);

  response.cookies.set("fm_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
