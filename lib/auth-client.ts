export interface SessionUser {
  sub: string;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "user";
}

export async function getClientSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
