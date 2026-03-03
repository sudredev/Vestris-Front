## lib

### api-client.ts

```typescript
// lib\api-client.ts
import {
  Configuration,
  AutenticacaoApi,
  EspeciesApi,
  DoencasApi,
  ProtocolosApi,
  CalculadoraApi,
  PacientesApi,
  AtendimentosApi,
  SugestoesApi,
  GestaoUsuariosApi,
  ExamesFisicosApi,
  VacinasApi,
  VacinacaoPacienteApi,
  SegurancaClinicaApi,
  MedicamentosApi,
  ClinicaApi,
  PublicoApi,
  AdminGlobalApi,
  PlanosApi, // <--- Novo (se precisar listar planos)
  AssinaturasApi, // <--- IMPORTANTE
  ContraindicacoesApi,
  PrincipiosAtivosApi,
  ExamesApi,
  AuditoriaApi,
} from "../api";

const apiConfig = new Configuration({
  basePath: "http://localhost:8080",
  accessToken: () => localStorage.getItem("vestris_token") || "",
});

export const authService = new AutenticacaoApi(apiConfig);
export const speciesService = new EspeciesApi(apiConfig);
export const diseasesService = new DoencasApi(apiConfig);
export const protocolsService = new ProtocolosApi(apiConfig);
export const calcService = new CalculadoraApi(apiConfig);
export const patientsService = new PacientesApi(apiConfig);
export const recordsService = new AtendimentosApi(apiConfig);
export const feedbackService = new SugestoesApi(apiConfig);
export const usersService = new GestaoUsuariosApi(apiConfig);
export const examination = new ExamesFisicosApi(apiConfig);
export const vacinasService = new VacinasApi(apiConfig);
export const patientVaccinationService = new VacinacaoPacienteApi(apiConfig);
export const segurancaService = new SegurancaClinicaApi(apiConfig);
export const medicamentosService = new MedicamentosApi(apiConfig);
export const clinicaService = new ClinicaApi(apiConfig);
export const publicService = new PublicoApi(apiConfig);
export const adminService = new AdminGlobalApi(apiConfig);

// NOVOS EXPORTS SAAS
export const planosService = new PlanosApi(apiConfig);
export const assinaturaService = new AssinaturasApi(apiConfig);
export const contraindicacoesService = new ContraindicacoesApi(apiConfig);
export const principiosService = new PrincipiosAtivosApi(apiConfig);
export const examesService = new ExamesApi(apiConfig);
export const auditoriaService = new AuditoriaApi(apiConfig);

```

### auth.ts

```typescript
// lib\auth.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/auth.ts

import { jwtDecode } from "jwt-decode";

export interface User {
  id: string;
  email: string;
  role:
    | "ADMIN_GLOBAL"
    | "ADMIN_GESTOR"
    | "ADMIN_CLINICO"
    | "VETERINARIO"
    | "ESTUDANTE";
  scope?: string;
  clinicaId?: string;
  exp: number;
}

export function getAuthUser(): User | null {
  const token = localStorage.getItem("vestris_token");
  if (!token) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded: any = jwtDecode(token);

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.perfil,
      scope: decoded.scope,
      clinicaId: decoded.clinicaId, // O Backend vai começar a mandar isso agora
      exp: decoded.exp,
    };
  } catch (error) {
    return null;
  }
}

// --- CORREÇÃO: Limpar todos os vestígios de Admin/Modos ---
export function logout() {
  localStorage.removeItem("vestris_token");
  localStorage.removeItem("vestris_admin_token"); // Remove o modo impersonate
  localStorage.removeItem("vestris_view_mode"); // Remove a preferência de Vet/Gestor
  window.location.href = "/login";
}

```

### pdf-service.ts

```typescript
// lib\pdf-service.ts
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  TDocumentDefinitions,
  Content,
  DynamicContent,
} from "pdfmake/interfaces";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfFonts && (pdfFonts as any).pdfMake
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfFonts as any).pdfMake.vfs
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfFonts as any).vfs;

export interface DadosCabecalho {
  nomeVeterinario: string;
  crmv: string;
  nomeClinica?: string;
  endereco?: string;
  contato?: string;
  cnpj?: string; // <--- NOVO CAMPO
  logo?: string;
}

export interface DadosPaciente {
  nome: string;
  especie: string;
  tutor: string;
  sexo?: string;
  peso?: string;
  idade?: string;
  nascimento?: string;
  idAnimal?: string;
  microchip?: string;
}

export interface ItemReceita {
  farmaco: string;
  instrucoes: string;
}

export interface DadosManejo {
  ambiente: string;
  clima: string;
  alimentacao: string;
  hidratacao: string;
  manuseio: string;
  higiene: string;
  alertas: string;
  rotina: string;
}

// --- ESTILOS GERAIS ---
const stylesComuns = {
  headerNome: { fontSize: 16, bold: true, color: "#1e293b" },
  headerSub: { fontSize: 10, color: "#64748b", margin: [0, 2, 0, 2] },
  headerSmall: { fontSize: 8, color: "#94a3b8" },
  sectionTitle: {
    fontSize: 13,
    bold: true,
    color: "#0f172a",
    margin: [0, 10, 0, 5],
    decoration: "underline",
    decorationStyle: "dotted",
  },
  subTitle: {
    fontSize: 10,
    bold: true,
    color: "#475569",
    margin: [0, 10, 0, 2],
    opacity: 0.9,
  },
  label: { fontSize: 8, bold: true, color: "#64748b", margin: [0, 0, 0, 1] },
  value: { fontSize: 10, bold: true, color: "#0f172a" },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#334155",
    margin: [0, 0, 0, 5],
  },
  date: { fontSize: 9, italics: true, color: "#64748b", alignment: "right" },
  footerSmall: { fontSize: 8, color: "#cbd5e1" },
  docTitle: {
    fontSize: 18,
    bold: true,
    alignment: "center",
    margin: [0, 0, 0, 20],
    color: "#0f172a",
  },
  medName: { fontSize: 11, bold: true, color: "#0f172a" },
  medInst: { fontSize: 11, color: "#334155", lineHeight: 1.3 },
};

// --- HELPER: CABEÇALHO ---
const gerarCabecalho = (dados: DadosCabecalho): Content => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elementos: any[] = [];

  if (dados.logo) {
    elementos.push({
      image: dados.logo,
      width: 80,
      alignment: "center",
      margin: [0, 0, 0, 10],
    });
  }

  elementos.push({
    text: dados.nomeClinica || dados.nomeVeterinario,
    style: "headerNome",
    alignment: "center",
  });
  elementos.push({
    text: dados.nomeClinica
      ? `Dr(a). ${dados.nomeVeterinario} - ${dados.crmv}`
      : `Médico(a) Veterinário(a) - ${dados.crmv}`,
    style: "headerSub",
    alignment: "center",
  });

  // Linhas de Endereço, CNPJ e Telefone
  if (dados.endereco)
    elementos.push({
      text: dados.endereco,
      style: "headerSmall",
      alignment: "center",
    });

  // CNPJ e Telefone na mesma linha ou separados
  let linhaContato = "";
  if (dados.cnpj) linhaContato += `CNPJ: ${dados.cnpj}  `;
  if (dados.contato)
    linhaContato += `${dados.cnpj ? "|  " : ""}Tel: ${dados.contato}`;

  if (linhaContato) {
    elementos.push({
      text: linhaContato,
      style: "headerSmall",
      alignment: "center",
    });
  }

  elementos.push({
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 5,
        x2: 515,
        y2: 5,
        lineWidth: 1,
        lineColor: "#e2e8f0",
      },
    ],
    margin: [0, 5, 0, 0],
  });

  return { stack: elementos, margin: [0, 0, 0, 15] } as Content;
};

// --- HELPER: IDENTIFICAÇÃO COMPLETA (REUTILIZÁVEL) ---
const gerarBlocoIdentificacao = (paciente: DadosPaciente): Content => {
  let idadeTexto = "-";
  if (paciente.nascimento) {
    try {
      idadeTexto = format(new Date(paciente.nascimento), "dd/MM/yyyy");
    } catch {
      idadeTexto = paciente.nascimento;
    }
  }

  return {
    style: "tableExample",
    table: {
      widths: ["18%", "32%", "15%", "35%"],
      body: [
        [
          {
            stack: [
              { text: "PACIENTE", style: "label" },
              { text: paciente.nome, style: "value" },
            ],
          },
          {
            stack: [
              { text: "ESPÉCIE", style: "label" },
              { text: paciente.especie, style: "value" },
            ],
          },
          {
            stack: [
              { text: "SEXO", style: "label" },
              { text: paciente.sexo || "-", style: "value" },
            ],
          },
          {
            stack: [
              { text: "NASCIMENTO", style: "label" },
              { text: idadeTexto, style: "value" },
            ],
          },
        ],
        [
          {
            text: "",
            colSpan: 4,
            border: [false, false, false, false],
            margin: [0, 3, 0, 3],
          },
          {},
          {},
          {},
        ],
        [
          {
            stack: [
              { text: "PESO ATUAL", style: "label" },
              { text: paciente.peso || "-", style: "value" },
            ],
          },
          {
            stack: [
              { text: "IDENTIFICAÇÃO", style: "label" },
              { text: paciente.idAnimal || "-", style: "value" },
            ],
          },
          {
            stack: [
              { text: "MICROCHIP", style: "label" },
              { text: paciente.microchip || "-", style: "value" },
            ],
            colSpan: 2,
          },
          {},
        ],
        [
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 0.5,
                lineColor: "#e2e8f0",
              },
            ],
            colSpan: 4,
            margin: [0, 8, 0, 8],
            border: [false, false, false, false],
          },
          {},
          {},
          {},
        ],
        [
          {
            stack: [
              { text: "RESPONSÁVEL (TUTOR)", style: "label" },
              { text: paciente.tutor, style: "value" },
            ],
            colSpan: 4,
          },
          {},
          {},
          {},
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 20],
  } as Content;
};

const gerarRodape = (): DynamicContent => {
  return (currentPage: number, pageCount: number) => {
    return {
      stack: [
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: "#e2e8f0",
            },
          ],
        },
        {
          text: `Documento gerado pelo sistema Vestris em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
          style: "footerSmall",
          alignment: "center",
          margin: [0, 5, 0, 0],
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          style: "footerSmall",
          alignment: "right",
        },
      ],
      margin: [40, 0, 40, 0],
    } as Content;
  };
};

// ==========================================
// 1. PRONTUÁRIO
// ==========================================

export const gerarPDFProntuario = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  atendimento: any,
  paciente: DadosPaciente,
  vet: DadosCabecalho,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = [
    gerarCabecalho(vet),
    gerarBlocoIdentificacao(paciente),

    {
      text: `REGISTRO DE ATENDIMENTO: ${atendimento.titulo}`,
      style: "sectionTitle",
    },
    {
      text: `Data: ${format(new Date(atendimento.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
      style: "date",
      margin: [0, -20, 0, 20],
    },

    atendimento.queixaPrincipal
      ? {
          stack: [
            { text: "QUEIXA PRINCIPAL", style: "subTitle" },
            { text: atendimento.queixaPrincipal, style: "bodyText" },
          ],
        }
      : null,
    atendimento.historicoClinico
      ? {
          stack: [
            { text: "HISTÓRICO / ANAMNESE", style: "subTitle" },
            { text: atendimento.historicoClinico, style: "bodyText" },
          ],
        }
      : null,
    atendimento.exameFisico
      ? {
          stack: [
            { text: "EXAME FÍSICO", style: "subTitle" },
            { text: atendimento.exameFisico, style: "bodyText" },
          ],
        }
      : null,
    atendimento.diagnostico
      ? {
          stack: [
            { text: "DIAGNÓSTICO", style: "subTitle" },
            { text: atendimento.diagnostico, style: "bodyText" },
          ],
        }
      : null,

    {
      stack: [
        { text: "CONDUTA TERAPÊUTICA", style: "subTitle" },
        {
          text: atendimento.condutaClinica || "Não registrada.",
          style: "bodyText",
        },
      ],
    },
    atendimento.observacoes
      ? {
          stack: [
            { text: "OBSERVAÇÕES", style: "subTitle" },
            { text: atendimento.observacoes, style: "bodyText" },
          ],
        }
      : null,

    {
      stack: [
        {
          canvas: [
            { type: "line", x1: 150, y1: 0, x2: 365, y2: 0, lineWidth: 1 },
          ],
        },
        {
          text: vet.nomeVeterinario,
          alignment: "center",
          marginTop: 5,
          bold: true,
        },
        { text: vet.crmv, alignment: "center", fontSize: 10 },
      ],
      margin: [0, 60, 0, 0],
      unbreakable: true,
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: content.filter(Boolean) as any,
    footer: gerarRodape(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    styles: stylesComuns as any,
    defaultStyle: { font: "Roboto" },
  };

  pdfMake.createPdf(docDefinition).open();
};

// ==========================================
// 2. RECEITA
// ==========================================
export const gerarPDFReceita = (
  itens: ItemReceita[],
  obsGerais: string,
  paciente: DadosPaciente,
  vet: DadosCabecalho,
) => {
  const listaMedicamentos: Content[] = itens
    .map((item, idx) => {
      return [
        {
          text: `${idx + 1}. ${item.farmaco}`,
          style: "medName",
          margin: [0, 10, 0, 2],
        },
        { text: item.instrucoes, style: "medInst", margin: [15, 0, 0, 10] },
      ] as Content[];
    })
    .flat();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawContent: any[] = [
    gerarCabecalho(vet),
    { text: "RECEITA VETERINÁRIA", style: "docTitle" },

    gerarBlocoIdentificacao(paciente),

    { text: "PRESCRIÇÃO:", style: "sectionTitle", margin: [0, 0, 0, 10] },
    ...listaMedicamentos,
    obsGerais
      ? { text: "OBSERVAÇÕES:", style: "subTitle", margin: [0, 30, 0, 5] }
      : null,
    obsGerais ? { text: obsGerais, fontSize: 10 } : null,

    {
      stack: [
        {
          canvas: [
            { type: "line", x1: 150, y1: 0, x2: 365, y2: 0, lineWidth: 1 },
          ],
        },
        {
          text: vet.nomeVeterinario,
          alignment: "center",
          marginTop: 5,
          bold: true,
        },
        { text: vet.crmv, alignment: "center", fontSize: 10 },
        {
          text: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
          alignment: "center",
          fontSize: 9,
          marginTop: 2,
          color: "#64748b",
        },
      ],
      margin: [0, 80, 0, 0],
      unbreakable: true,
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: rawContent.filter(Boolean) as any,
    footer: gerarRodape(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    styles: stylesComuns as any,
  };
  pdfMake.createPdf(docDefinition).open();
};

// ==========================================
// 3. RECEITA DE MANEJO
// ==========================================
export const gerarPDFManejo = (
  dados: DadosManejo,
  paciente: DadosPaciente,
  vet: DadosCabecalho,
) => {
  const criarBloco = (titulo: string, conteudo: string) => {
    if (!conteudo || !conteudo.trim()) return null;
    const conteudoFormatado = conteudo.replace(/\\n/g, "\n");
    return {
      stack: [
        {
          text: titulo.toUpperCase(),
          style: "subTitle",
          margin: [0, 15, 0, 2],
          color: "#047857",
        },
        { text: conteudoFormatado, style: "bodyText" },
      ],
      unbreakable: true,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawContent: any[] = [
    gerarCabecalho(vet),
    {
      text: "ORIENTAÇÕES DE MANEJO E AMBIÊNCIA",
      style: "docTitle",
      color: "#064e3b",
      alignment: "center",
    },

    gerarBlocoIdentificacao(paciente),

    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: "#d1fae5",
        },
      ],
    },

    criarBloco("1. Ambiente & Recinto", dados.ambiente),
    criarBloco("2. Clima (Temperatura & Umidade)", dados.clima),
    criarBloco("3. Alimentação", dados.alimentacao),
    criarBloco("4. Hidratação", dados.hidratacao),
    criarBloco("5. Manuseio & Contenção", dados.manuseio),
    criarBloco("6. Higiene & Limpeza", dados.higiene),
    criarBloco("7. Sinais de Alerta (Quando buscar ajuda)", dados.alertas),
    criarBloco("8. Rotina & Acompanhamento", dados.rotina),

    {
      stack: [
        {
          canvas: [
            { type: "line", x1: 150, y1: 0, x2: 365, y2: 0, lineWidth: 1 },
          ],
        },
        {
          text: vet.nomeVeterinario,
          alignment: "center",
          marginTop: 5,
          bold: true,
        },
        { text: vet.crmv, alignment: "center", fontSize: 10 },
        {
          text: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
          alignment: "center",
          fontSize: 9,
          marginTop: 2,
          color: "#64748b",
        },
      ],
      margin: [0, 60, 0, 0],
      unbreakable: true,
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: rawContent.filter(Boolean) as any,
    footer: gerarRodape(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    styles: stylesComuns as any,
  };
  pdfMake.createPdf(docDefinition).open();
};

```

### utils.ts

```typescript
// lib\utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

