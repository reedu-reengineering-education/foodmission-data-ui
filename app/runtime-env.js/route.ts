import { PUBLIC_ENV_KEYS, type PublicEnv } from "@/lib/public-env";

export const dynamic = "force-dynamic";

/** Serves the public env vars of the running server as `window.__ENV`. */
export function GET() {
  const env: PublicEnv = {};
  for (const key of PUBLIC_ENV_KEYS) {
    const value = process.env[key];
    if (value !== undefined) env[key] = value;
  }

  return new Response(`window.__ENV=${JSON.stringify(env)};`, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
