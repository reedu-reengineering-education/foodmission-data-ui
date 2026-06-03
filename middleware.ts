import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "fm_session";
const sessionSecret = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET ?? "change-me-in-production",
);

// Decode a JWT payload WITHOUT signature verification (safe for our own data read)
function decodePayload(jwt: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
  } catch {
    return null;
  }
}

const PROTECTED_PATHS = ["/personal-profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const { payload } = await jwtVerify(token, sessionSecret);

    // If the embedded Keycloak access token has expired (or expires within 30s),
    // redirect to the refresh endpoint which will get a new one and come back here.
    const at = payload.accessToken as string | null | undefined;
    if (at) {
      const atPayload = decodePayload(at);
      const atExp = (atPayload?.exp as number | undefined) ?? 0;
      if (Date.now() > atExp * 1000 - 30_000) {
        const refreshUrl = new URL("/api/auth/refresh", request.url);
        refreshUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(refreshUrl);
      }
    }

    return NextResponse.next();
  } catch {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: ["/personal-profile/:path*"],
};
