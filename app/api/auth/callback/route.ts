import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  createSessionToken,
  SESSION_COOKIE,
  REFRESH_COOKIE,
  SessionUser,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("fm_oauth_state")?.value;

  const issuer = process.env.KEYCLOAK_ISSUER!;
  const clientId = process.env.KEYCLOAK_CLIENT_ID!;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET!;
  const baseUrl = process.env.BETTER_AUTH_URL!;

  const colonIdx = (state ?? ":").indexOf(":");
  const stateValue = state?.substring(0, colonIdx) ?? "";
  const rawCallback = state?.substring(colonIdx + 1) ?? "";
  const decoded = decodeURIComponent(rawCallback || "/");
  const callbackUrl = decoded.startsWith("/") ? decoded : "/";

  if (!code || !state || stateValue !== storedState) {
    return NextResponse.redirect(
      new URL("/sign-in?error=invalid_state", baseUrl),
    );
  }

  const tokenRes = await fetch(`${issuer}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${baseUrl}/api/auth/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/sign-in?error=token_exchange_failed", baseUrl),
    );
  }

  const tokens: {
    id_token: string;
    access_token: string;
    refresh_token: string;
  } = await tokenRes.json();

  const JWKS = createRemoteJWKSet(
    new URL(`${issuer}/protocol/openid-connect/certs`),
  );

  let idPayload: Record<string, unknown>;
  try {
    const { payload } = await jwtVerify(tokens.id_token, JWKS, { issuer });
    idPayload = payload as Record<string, unknown>;
  } catch {
    return NextResponse.redirect(
      new URL("/sign-in?error=invalid_token", baseUrl),
    );
  }

  let role: "admin" | "user" = "user";
  try {
    const atPayload = JSON.parse(
      Buffer.from(tokens.access_token.split(".")[1], "base64url").toString(),
    );
    const realmRoles: string[] = atPayload?.realm_access?.roles ?? [];
    if (realmRoles.includes("admin")) role = "admin";
  } catch {
    /* ignore, default user */
  }

  const user: Omit<SessionUser, "createdAt"> = {
    sub: idPayload.sub as string,
    name: (idPayload.name ?? idPayload.preferred_username ?? "") as string,
    email: idPayload.email as string,
    image: null,
    role,
    accessToken: tokens.access_token,
  };

  const sessionToken = await createSessionToken(user);
  const response = NextResponse.redirect(new URL(callbackUrl, baseUrl));

  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  response.cookies.delete("fm_oauth_state");

  return response;
}
