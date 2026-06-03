import { NextResponse } from "next/server";
import { SESSION_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export async function GET() {
  const baseUrl = process.env.BETTER_AUTH_URL!;
  const issuer = process.env.KEYCLOAK_ISSUER!;
  const clientId = process.env.KEYCLOAK_CLIENT_ID!;

  const redirectUri = encodeURIComponent(`${baseUrl}/sign-in`);
  const logoutUrl = `${issuer}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;

  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
