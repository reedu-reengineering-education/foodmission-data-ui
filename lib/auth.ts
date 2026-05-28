import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "fm_session";
export const REFRESH_COOKIE = "fm_refresh";

const sessionSecret = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET ?? "change-me-in-production",
);

export interface SessionUser {
  sub: string;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "user";
  createdAt: Date;
  accessToken?: string;
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret);
    return {
      user: {
        sub: payload.sub!,
        name: payload.name as string,
        email: payload.email as string,
        image: (payload.image as string | null) ?? null,
        role: (payload.role as "admin" | "user") ?? "user",
        createdAt: new Date((payload.iat ?? 0) * 1000),
        accessToken: (payload.accessToken as string | undefined) ?? undefined,
      },
    };
  } catch {
    return null;
  }
}

export async function createSessionToken(
  user: Omit<SessionUser, "createdAt">,
): Promise<string> {
  return new SignJWT({
    sub: user.sub,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    accessToken: user.accessToken ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionSecret);
}
