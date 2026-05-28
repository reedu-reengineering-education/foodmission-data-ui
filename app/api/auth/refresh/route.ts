import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  SESSION_COOKIE,
  REFRESH_COOKIE,
  SessionUser,
  createSessionToken,
} from "@/lib/auth";

const sessionSecret = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET ?? "change-me-in-production",
);

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function GET(request: NextRequest) {
  const baseUrl = process.env.BETTER_AUTH_URL!;
  const issuer = process.env.KEYCLOAK_ISSUER!;
  const clientId = process.env.KEYCLOAK_CLIENT_ID!;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET!;

  const rawNext = request.nextUrl.searchParams.get("next") ?? "/";
  const safePath = rawNext.startsWith("/") ? rawNext : "/";

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${encodeURIComponent(safePath)}`, baseUrl),
    );
  }

  // Carry over existing identity from current session if still decodable
  let existing: Omit<SessionUser, "createdAt"> | null = null;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, sessionSecret);
      existing = {
        sub: payload.sub!,
        name: payload.name as string,
        email: payload.email as string,
        image: (payload.image as string | null) ?? null,
        role: (payload.role as "admin" | "user") ?? "user",
      };
    } catch {
      /* session JWT expired — will repopulate from new tokens below */
    }
  }

  const tokenRes = await fetch(`${issuer}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!tokenRes.ok) {
    // Refresh token expired or revoked — clear cookies and send to sign-in
    const res = NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${encodeURIComponent(safePath)}`, baseUrl),
    );
    res.cookies.delete(SESSION_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  const tokens: { access_token: string; refresh_token: string } =
    await tokenRes.json();

  // Parse the new access token for role and identity (if we had no session)
  let role: "admin" | "user" = existing?.role ?? "user";
  let sub = existing?.sub ?? "";
  let name = existing?.name ?? "";
  let email = existing?.email ?? "";

  try {
    const atPayload = JSON.parse(
      Buffer.from(tokens.access_token.split(".")[1], "base64url").toString(),
    );
    const realmRoles: string[] = atPayload?.realm_access?.roles ?? [];
    role = realmRoles.includes("admin") ? "admin" : "user";
    if (!existing) {
      sub = atPayload.sub ?? "";
      name = atPayload.name ?? atPayload.preferred_username ?? "";
      email = atPayload.email ?? "";
    }
  } catch {
    /* keep existing values */
  }

  const user: Omit<SessionUser, "createdAt"> = {
    sub,
    name,
    email,
    image: existing?.image ?? null,
    role,
    accessToken: tokens.access_token,
  };

  const newSessionToken = await createSessionToken(user);
  const res = NextResponse.redirect(new URL(safePath, baseUrl));

  res.cookies.set(SESSION_COOKIE, newSessionToken, COOKIE_OPTS);
  res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, COOKIE_OPTS);

  return res;
}
