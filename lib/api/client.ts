const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export function buildParams(
  filters: Record<string, string | undefined>,
): URLSearchParams {
  const fromValue = filters.from ?? filters.periodStart;
  const toValue = filters.to ?? filters.periodEnd;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "periodStart" || key === "periodEnd") {
      continue;
    }
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  }

  if (fromValue !== undefined && fromValue !== null && fromValue !== "") {
    params.set("from", fromValue);
  }
  if (toValue !== undefined && toValue !== null && toValue !== "") {
    params.set("to", toValue);
  }

  return params;
}

export async function apiGet<T>(
  path: string,
  params?: URLSearchParams,
): Promise<T> {
  const url = `${API_BASE}${path}${params?.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch {
      // ignore
    }
    throw new Error(
      `API ${res.status}: ${res.statusText}${errorText ? ` - ${errorText}` : ""}`,
    );
  }
  return res.json() as Promise<T>;
}

export function createApiMethod<T>(path: string) {
  return (filters: Record<string, string | undefined> = {}) =>
    apiGet<T>(path, buildParams(filters));
}
