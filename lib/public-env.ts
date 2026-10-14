// Public env vars read at runtime instead of being inlined by `next build`,
// so one Docker image can run in every environment. The browser gets them
// from /runtime-env.js (see app/runtime-env.js/route.ts), loaded in the root
// layout before hydration.

export const PUBLIC_ENV_KEYS = ["NEXT_PUBLIC_API_URL"] as const;

export type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number];
export type PublicEnv = Partial<Record<PublicEnvKey, string>>;

declare global {
  interface Window {
    __ENV?: PublicEnv;
  }
}

export function publicEnv(key: PublicEnvKey): string | undefined {
  if (typeof window !== "undefined") return window.__ENV?.[key];
  // Dynamic lookup keeps Next from inlining the build-time value
  return process.env[key];
}

export function apiBaseUrl(): string {
  return publicEnv("NEXT_PUBLIC_API_URL") ?? "http://localhost:3000/api/v1";
}
