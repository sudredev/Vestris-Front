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

// --- INTERFACES ---
export interface DadosCabecalho {
  nomeVeterinario: string;
  crmv: string;
  nomeClinica?: string;
  endereco?: string;
  contato?: string;
  cnpj?: string;
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

// NOVO: Interface para vacinas no PDF
export interface VacinaPDF {
  nome: string;
  lote?: string;
  dataAplicacao: string;
  proximaDose?: string;
  observacoes?: string; // Reação, local, etc
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
  sectionTitleVacina: {
    // Estilo especial para vacina
    fontSize: 14,
    bold: true,
    color: "#047857", // Emerald
    margin: [0, 15, 0, 10],
    alignment: "center",
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
  tableHeader: {
    fontSize: 9,
    bold: true,
    color: "#ffffff",
    fillColor: "#047857",
    alignment: "center",
  },
  tableCell: { fontSize: 9, color: "#334155" },
};

// --- HELPERS VISUAIS (Cabeçalho, Identificação, Rodapé) ---
// ... (Mantenha igual aos anteriores: gerarCabecalho, gerarBlocoIdentificacao, gerarRodape) ...
// (Vou omitir aqui para economizar espaço, mas use os mesmos do código anterior)

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
  if (dados.endereco)
    elementos.push({
      text: dados.endereco,
      style: "headerSmall",
      alignment: "center",
    });

  let linhaContato = "";
  if (dados.cnpj) linhaContato += `CNPJ: ${dados.cnpj}  `;
  if (dados.contato)
    linhaContato += `${dados.cnpj ? "|  " : ""}Tel: ${dados.contato}`;
  if (linhaContato)
    elementos.push({
      text: linhaContato,
      style: "headerSmall",
      alignment: "center",
    });

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
// 1. PRONTUÁRIO INTELIGENTE (COM TIPOS)
// ==========================================

export const gerarPDFProntuario = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  atendimento: any,
  paciente: DadosPaciente,
  vet: DadosCabecalho,
  // NOVO: Lista de vacinas aplicadas (opcional)
  vacinasAplicadas: VacinaPDF[] = [],
) => {
  const tipo = atendimento.tipo || "CONSULTA_CLINICA";

  // Base do conteúdo (Cabeçalho + Paciente + Título)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = [
    gerarCabecalho(vet),
    gerarBlocoIdentificacao(paciente),
    {
      text: `REGISTRO: ${atendimento.titulo.toUpperCase()}`,
      style: "sectionTitle",
    },
    {
      text: `Data: ${format(new Date(atendimento.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
      style: "date",
      margin: [0, -20, 0, 20],
    },
  ];

  // --- LÓGICA CONDICIONAL POR TIPO ---

  if (tipo === "VACINACAO") {
    // === LAYOUT DE VACINAÇÃO ===
    content.push({
      text: "CERTIFICADO DE APLICAÇÃO",
      style: "sectionTitleVacina",
    });

    if (vacinasAplicadas.length > 0) {
      const bodyTable = [
        [
          { text: "Vacina", style: "tableHeader" },
          { text: "Lote", style: "tableHeader" },
          { text: "Data", style: "tableHeader" },
          { text: "Próx. Dose", style: "tableHeader" },
          { text: "Obs / Reação", style: "tableHeader" },
        ],
        ...vacinasAplicadas.map((vac) => [
          { text: vac.nome, style: "tableCell", bold: true },
          { text: vac.lote || "-", style: "tableCell", alignment: "center" },
          {
            text: format(new Date(vac.dataAplicacao), "dd/MM/yyyy"),
            style: "tableCell",
            alignment: "center",
          },
          {
            text: vac.proximaDose
              ? format(new Date(vac.proximaDose), "dd/MM/yyyy")
              : "Anual",
            style: "tableCell",
            alignment: "center",
            bold: true,
            color: "#dc2626",
          },
          { text: vac.observacoes || "-", style: "tableCell", fontSize: 8 },
        ]),
      ];

      content.push({
        table: {
          headerRows: 1,
          widths: ["30%", "15%", "15%", "15%", "25%"],
          body: bodyTable,
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 20],
      });
    } else {
      content.push({
        text: "Nenhuma vacina registrada neste atendimento.",
        style: "bodyText",
        italics: true,
        alignment: "center",
      });
    }

    // Notas Gerais da Vacinação
    if (atendimento.observacoes) {
      content.push({
        stack: [
          { text: "NOTAS VETERINÁRIAS", style: "subTitle" },
          { text: atendimento.observacoes, style: "bodyText" },
        ],
      });
    }
  } else if (tipo === "RETORNO") {
    // === LAYOUT DE RETORNO ===
    if (atendimento.historicoClinico) {
      content.push({
        stack: [
          { text: "EVOLUÇÃO CLÍNICA", style: "subTitle" },
          { text: atendimento.historicoClinico, style: "bodyText" },
        ],
      });
    }
    if (atendimento.condutaClinica) {
      content.push({
        stack: [
          { text: "AJUSTE DE CONDUTA / NOVA PRESCRIÇÃO", style: "subTitle" },
          { text: atendimento.condutaClinica, style: "bodyText" },
        ],
      });
    }
    if (atendimento.observacoes) {
      content.push({
        stack: [
          { text: "OBSERVAÇÕES", style: "subTitle" },
          { text: atendimento.observacoes, style: "bodyText" },
        ],
      });
    }
  } else if (tipo === "CIRURGIA" || tipo === "PROCEDIMENTO") {
    // === LAYOUT CIRÚRGICO ===
    content.push({
      stack: [
        { text: "DESCRIÇÃO DO PROCEDIMENTO", style: "subTitle" },
        {
          text: atendimento.condutaClinica || "Conforme técnica padrão.",
          style: "bodyText",
        },
      ],
    });
    if (atendimento.exameFisico) {
      content.push({
        stack: [
          { text: "MONITORAMENTO / PARAMETROS", style: "subTitle" },
          { text: atendimento.exameFisico, style: "bodyText" },
        ],
      });
    }
    if (atendimento.observacoes) {
      content.push({
        stack: [
          { text: "CUIDADOS PÓS-OPERATÓRIOS", style: "subTitle" },
          { text: atendimento.observacoes, style: "bodyText" },
        ],
      });
    }
  } else {
    // === LAYOUT CONSULTA (PADRÃO - COMPLETO) ===
    if (atendimento.queixaPrincipal)
      content.push({
        stack: [
          { text: "QUEIXA PRINCIPAL", style: "subTitle" },
          { text: atendimento.queixaPrincipal, style: "bodyText" },
        ],
      });
    if (atendimento.historicoClinico)
      content.push({
        stack: [
          { text: "HISTÓRICO / ANAMNESE", style: "subTitle" },
          { text: atendimento.historicoClinico, style: "bodyText" },
        ],
      });
    if (atendimento.exameFisico)
      content.push({
        stack: [
          { text: "EXAME FÍSICO", style: "subTitle" },
          { text: atendimento.exameFisico, style: "bodyText" },
        ],
      });
    if (atendimento.diagnostico)
      content.push({
        stack: [
          { text: "DIAGNÓSTICO", style: "subTitle" },
          { text: atendimento.diagnostico, style: "bodyText" },
        ],
      });

    content.push({
      stack: [
        { text: "CONDUTA TERAPÊUTICA", style: "subTitle" },
        {
          text: atendimento.condutaClinica || "Não registrada.",
          style: "bodyText",
        },
      ],
    });

    if (atendimento.observacoes)
      content.push({
        stack: [
          { text: "OBSERVAÇÕES", style: "subTitle" },
          { text: atendimento.observacoes, style: "bodyText" },
        ],
      });
  }

  // --- ASSINATURA (COMUM A TODOS) ---
  content.push({
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
  });

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

// ... (Mantenha as funções gerarPDFReceita e gerarPDFManejo como estavam)
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
