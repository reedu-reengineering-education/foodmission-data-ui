import "server-only";
import { auth } from "@/lib/auth";

export interface AdminStatus {
  signedIn: boolean;
  admin: boolean;
}

/**
 * Whether the signed-in user has the `admin` client role, read from their
 * Keycloak access token. Only used to decide what to show; the backend
 * verifies the token and enforces the role on every admin endpoint.
 */
export async function getAdminStatus(headers: Headers): Promise<AdminStatus> {
  let accessToken: string | undefined;
  try {
    ({ accessToken } = await auth.api.getAccessToken({
      body: { providerId: "keycloak" },
      headers,
    }));
  } catch {
    // No session or no linked Keycloak account
  }
  if (!accessToken) return { signedIn: false, admin: false };

  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64url").toString(),
    ) as { resource_access?: Record<string, { roles?: string[] }> };
    const roles =
      payload.resource_access?.[process.env.KEYCLOAK_CLIENT_ID ?? ""]?.roles ??
      [];
    return { signedIn: true, admin: roles.includes("admin") };
  } catch {
    return { signedIn: true, admin: false };
  }
}
