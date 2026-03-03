import { API_BASE } from "./resources";

export interface AuditoriaLog {
  id: string;
  clinicaId: string;
  usuarioId: string;
  acao: string;
  entidade: string;
  idAlvo: string;
  detalhes: string | null;
  metadados: string | null;
  criadoEm: string; // O Backend manda "criadoEm", não "dataHora" no JSON final
}

export interface AuditoriaListResponse {
  sucesso: boolean;
  dados: AuditoriaLog[];
}

export interface RegistrarEventoParams {
  acao: string;
  entidade: string;
  idAlvo: string;
  descricao: string;
  metadados?: string;
}

// GET - Listar
export async function fetchAuditoria(
  params: { clinicaId: string; dataInicio?: string; dataFim?: string },
  token: string,
): Promise<AuditoriaListResponse> {
  const qs = new URLSearchParams();
  qs.set("clinicaId", params.clinicaId);

  // Só envia se tiver valor real
  if (params.dataInicio) qs.set("dataInicio", params.dataInicio);
  if (params.dataFim) qs.set("dataFim", params.dataFim);

  const res = await fetch(`${API_BASE}/api/v1/auditoria?${qs.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("Falha ao buscar auditoria");
  return res.json();
}

// POST - Registrar Evento
export async function registrarEventoAuditoria(
  dados: RegistrarEventoParams,
  token: string,
): Promise<void> {
  await fetch(`${API_BASE}/api/v1/auditoria/evento`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
}
