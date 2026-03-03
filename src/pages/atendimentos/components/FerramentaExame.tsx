import { useQuery } from "@tanstack/react-query";
import { examination } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Stethoscope,
  Copy,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface Props {
  especieId?: string;
  nomeEspecie?: string;
  onInject: (text: string, targetField: "exameFisico") => void;
}

type SecaoExame = {
  titulo: string;
  conteudo: string;
};

export function FerramentaExame({ especieId, nomeEspecie, onInject }: Props) {
  const { data: modeloResponse, isLoading } = useQuery({
    queryKey: ["modelo-exame", especieId],
    queryFn: async () => {
      if (!especieId) return null;
      try {
        const res = await examination.obterModeloExame(especieId);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!especieId,
    retry: false,
  });

  let secoes: SecaoExame[] = [];
  let isTemplateEspecifico = false;

  if (modeloResponse?.sucesso && modeloResponse.dados?.textoBase) {
    try {
      secoes = JSON.parse(modeloResponse.dados.textoBase);
      isTemplateEspecifico = true;
    } catch (e) {
      console.error("Erro ao ler JSON do exame", e);
    }
  }

  if (!isTemplateEspecifico && !isLoading) {
    secoes = [
      {
        titulo: "Avaliação Geral",
        conteudo: "Consciência, Postura, Escore Corporal (1-5), Hidratação.",
      },
      {
        titulo: "Cabeça & Pescoço",
        conteudo: "Mucosas, TPC, Olhos, Narinas, Cavidade Oral, Linfonodos.",
      },
      {
        titulo: "Cardiopulmonar",
        conteudo:
          "Frequência Cardíaca, Ritmo, Frequência Respiratória, Ausculta.",
      },
      {
        titulo: "Abdominal/Digestório",
        conteudo:
          "Palpação abdominal, sensibilidade, conteúdo intestinal/estomacal.",
      },
      {
        titulo: "Tegumentar",
        conteudo: "Pele, Pelos/Penas/Escamas, Ectoparasitas, Lesões.",
      },
      {
        titulo: "Musculoesquelético",
        conteudo: "Locomoção, Palpação de membros, Articulações, Coluna.",
      },
    ];
  }

  const handleInjectSection = (secao: SecaoExame) => {
    const texto = `\n[${secao.titulo.toUpperCase()}]\n${secao.conteudo}`;
    onInject(texto, "exameFisico");
    toast.success("Seção inserida!");
  };

  const handleInjectAll = () => {
    // CORREÇÃO: Fallback para evitar 'undefined' no texto
    const nomeLimpo = nomeEspecie ? nomeEspecie.toUpperCase() : "PACIENTE";

    const cabecalho = isTemplateEspecifico
      ? `-- EXAME FÍSICO: ${nomeLimpo} --`
      : "-- EXAME FÍSICO GERAL --";

    const textoCompleto = secoes
      .map((s) => `[${s.titulo.toUpperCase()}]\n${s.conteudo}`)
      .join("\n\n");

    onInject(`${cabecalho}\n\n${textoCompleto}`, "exameFisico");
    toast.success("Roteiro completo inserido!");
  };

  if (!especieId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
        <Stethoscope className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-xs text-center">
          Selecione um paciente para carregar o roteiro específico.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
        <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-50" />
        <p className="text-xs">Carregando roteiro...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-700 text-xs uppercase flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            {isTemplateEspecifico
              ? `Roteiro: ${nomeEspecie || "Específico"}`
              : "Roteiro Padrão"}
          </h3>
          {!isTemplateEspecifico && (
            <p className="text-[10px] text-slate-400 mt-1">
              Sem modelo específico para esta espécie.
            </p>
          )}
        </div>

        <Badge
          variant={isTemplateEspecifico ? "default" : "secondary"}
          className="text-[10px] h-5"
        >
          {isTemplateEspecifico ? "Específico" : "Genérico"}
        </Badge>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs h-8 border-slate-200 text-slate-600 hover:text-primary hover:border-primary bg-slate-50"
        onClick={handleInjectAll}
      >
        <Copy className="h-3 w-3 mr-2" /> Inserir Roteiro Completo
      </Button>

      <div className="flex-1 overflow-y-auto pr-1">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {secoes.map((secao, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-slate-200 rounded-md bg-white shadow-sm"
            >
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-slate-700 hover:no-underline hover:bg-slate-50">
                {secao.titulo}
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-1 bg-slate-50/30">
                <p className="text-xs text-slate-600 mb-3 leading-relaxed font-mono">
                  {secao.conteudo}
                </p>
                <Button
                  size="sm"
                  className="w-full h-7 text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-800 shadow-sm transition-colors"
                  onClick={() => handleInjectSection(secao)}
                >
                  <ArrowRight className="h-3 w-3 mr-1" /> Usar este bloco
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {!isTemplateEspecifico && (
        <div className="bg-blue-50 p-2 rounded border border-blue-100 flex gap-2 items-start">
          <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-tight">
            Você pode sugerir um roteiro específico para{" "}
            <strong>{nomeEspecie}</strong> na área de Biblioteca.
          </p>
        </div>
      )}
    </div>
  );
}
