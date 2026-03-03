/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function fetchPacienteById(id: string, token?: string | null) {
  if (!id) return null;
  const url = `${API_BASE}/api/v1/pacientes/${encodeURIComponent(id)}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  // eslint-disable-next-line no-console
  console.debug("[fetchPacienteById] GET", url);
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const json = await safeJson(res);
  if (!json) return null;
  // aceitar {sucesso:true,dados:{...}} ou objeto direto
  return json.sucesso === true && json.dados ? json.dados : json;
}

export async function fetchAtendimentoById(id: string, token?: string | null) {
  if (!id) return null;
  const url = `${API_BASE}/api/v1/atendimentos/${encodeURIComponent(id)}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  // eslint-disable-next-line no-console
  console.debug("[fetchAtendimentoById] GET", url);
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const json = await safeJson(res);
  if (!json) return null;
  return json.sucesso === true && json.dados ? json.dados : json;
}
