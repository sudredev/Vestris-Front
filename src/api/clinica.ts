/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper mínimo para obter a clínica do usuário logado
 * usa REACT_APP_API_BASE / import.meta.env.VITE_API_BASE ou fallback http://localhost:8080
 */

export interface MinhaClinicaDados {
  id: string;
  nomeFantasia?: string;
  razaoSocial?: string;
  [key: string]: any;
}

const API_BASE = (() => {
  try {
    // vite
    // @ts-ignore
    const vite =
      typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_API_BASE;
    if (vite) return String(vite).replace(/\/$/, "");
  } catch {}
  const reactEnv = (globalThis as any)?.process?.env?.REACT_APP_API_BASE;
  if (reactEnv) return String(reactEnv).replace(/\/$/, "");
  return "http://localhost:8080";
})();

export async function fetchMinhaClinica(
  token?: string | null,
  usuarioId?: string,
): Promise<MinhaClinicaDados | undefined> {
  const qs = new URLSearchParams();
  if (usuarioId) qs.set("usuarioId", usuarioId);
  const url = `${API_BASE}/api/v1/minha-clinica${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // eslint-disable-next-line no-console
  console.debug("[fetchMinhaClinica] GET", url, { headers });

  const res = await fetch(url, { method: "GET", headers });
  const text = await res.text().catch(() => "");

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn("[fetchMinhaClinica] status", res.status, text);
    return undefined;
  }

  try {
    const json = JSON.parse(text);
    if (json && typeof json === "object") {
      if (
        json.sucesso === true &&
        json.dados &&
        typeof json.dados === "object"
      ) {
        return json.dados as MinhaClinicaDados;
      }
      if (json.id) return json as MinhaClinicaDados;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[fetchMinhaClinica] parse error", e);
  }
  return undefined;
}
