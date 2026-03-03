## types

### auditoria.ts

```typescript
// types\auditoria.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AuditoriaAcao = string;
export type AuditoriaEntidade = string;

export interface AuditoriaLogRaw {
  id: string;
  clinicaId: string;
  usuarioId?: string;
  usuarioNome?: string;
  perfilUsuario?: string;
  acao: string;
  entidade: string;
  idAlvo?: string | null;
  alvoId?: string | null; // some versions
  detalhes?: string | null;
  criadoEm: string; // ISO
  [key: string]: any;
}

export interface AuditoriaLog {
  id: string;
  clinicaId: string;
  usuarioId?: string;
  usuarioNome?: string;
  perfilUsuario?: string;
  acao: string;
  entidade: string;
  alvoId?: string | null;
  detalhes?: string | null;
  dataHora: string; // normalized from criadoEm
  [key: string]: any;
}

export interface AuditoriaListResponse {
  items?: AuditoriaLogRaw[]; // sometimes the generated client returns { items: [...] }
  data?: AuditoriaLogRaw[]; // alternate shape
  total?: number;
  [key: string]: any;
}

```

