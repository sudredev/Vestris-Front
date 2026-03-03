/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UsuarioResponse {
  id: string;
  nome?: string;
  email?: string;
  perfil?: string;
  crmv?: string;
  [key: string]: any;
}

const API_BASE = (() => {
  try {
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

/**
 * GET /api/v1/minha-clinica/equipe
 * optional clinicaId query param
 */
export async function fetchEquipe(
  clinicaId?: string,
  token?: string | null,
): Promise<UsuarioResponse[]> {
  const qs = new URLSearchParams();
  if (clinicaId) qs.set("clinicaId", clinicaId);
  const url = `${API_BASE}/api/v1/minha-clinica/equipe${qs.toString() ? `?${qs.toString()}` : ""}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // eslint-disable-next-line no-console
  console.debug("[fetchEquipe] GET", url);

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn("[fetchEquipe] failed", res.status);
    return [];
  }
  const text = await res.text().catch(() => "");
  try {
    const json = text ? JSON.parse(text) : null;
    // accept array or { items: [...] } or { sucesso:true, dados: [...] }
    if (Array.isArray(json)) return json;
    if (json?.items && Array.isArray(json.items)) return json.items;
    if (json?.sucesso === true && Array.isArray(json.dados)) return json.dados;
  } catch {
    // ignore
  }
  return [];
}

export async function fetchUsuarioById(
  id: string,
  token?: string | null,
): Promise<UsuarioResponse | null> {
  if (!id) return null;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const tryUrls = [
    `${API_BASE}/api/v1/usuarios/${encodeURIComponent(id)}`,
    `${API_BASE}/api/v1/usuarios?id=${encodeURIComponent(id)}`,
  ];

  for (const url of tryUrls) {
    try {
      // eslint-disable-next-line no-console
      console.debug("[fetchUsuarioById] GET", url);
      const res = await fetch(url, { method: "GET", headers });
      const text = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.debug(
        "[fetchUsuarioById] status/text",
        res.status,
        text?.slice?.(0, 100),
      );
      if (!res.ok) continue;
      try {
        const json = text ? JSON.parse(text) : null;
        // aceita {sucesso:true, dados: {...}} ou array/obj
        if (json?.sucesso === true && json?.dados)
          return json.dados as UsuarioResponse;
        if (Array.isArray(json) && json.length > 0 && json[0]?.id)
          return json[0] as UsuarioResponse;
        if (json?.id) return json as UsuarioResponse;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[fetchUsuarioById] parse error", e);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[fetchUsuarioById] request failed", e);
    }
  }
  return null;
}
