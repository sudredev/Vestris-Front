import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Printer, Leaf, Wand2, Eraser, Loader2 } from "lucide-react";
import { gerarPDFManejo } from "@/lib/pdf-service";
import type {
  DadosManejo,
  DadosCabecalho,
  DadosPaciente,
} from "@/lib/pdf-service";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { speciesService } from "@/lib/api-client";
import { Label } from "@/components/ui/label";
import { registrarEventoAuditoria } from "@/api/auditoria"; // <--- Import

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: DadosPaciente & { especieId?: string };
  veterinario: DadosCabecalho;
  onSave?: (textoJSON: string) => void;
  dadosSalvos?: string;
  // Novos campos opcionais
  atendimentoId?: string;
  pacienteId?: string;
}

const estadoInicial: DadosManejo = {
  ambiente: "",
  clima: "",
  alimentacao: "",
  hidratacao: "",
  manuseio: "",
  higiene: "",
  alertas: "",
  rotina: "",
};

export function ReceitaManejoModal({
  open,
  onOpenChange,
  paciente,
  veterinario,
  onSave,
  dadosSalvos,
  atendimentoId,
  pacienteId,
}: Props) {
  const [campos, setCampos] = useState<DadosManejo>(estadoInicial);

  const limparQuebrasDeLinha = (dados: DadosManejo): DadosManejo => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limpo: any = {};
    Object.keys(dados).forEach((key) => {
      const k = key as keyof DadosManejo;
      limpo[k] = dados[k] ? dados[k].replace(/\\n/g, "\n") : "";
    });
    return limpo as DadosManejo;
  };

  const { data: especieData, isLoading } = useQuery({
    queryKey: ["especie-manejo", paciente.especieId],
    queryFn: async () => {
      if (!paciente.especieId) return null;
      try {
        const res = await speciesService.buscarEspeciePorId(paciente.especieId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return res.data.dados as any;
      } catch {
        return null;
      }
    },
    enabled: open && !!paciente.especieId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!open) return;

    const atualizarSeNecessario = (novosDados: DadosManejo) => {
      const dadosLimpos = limparQuebrasDeLinha(novosDados);
      if (JSON.stringify(campos) !== JSON.stringify(dadosLimpos)) {
        setCampos(dadosLimpos);
      }
    };

    if (dadosSalvos) {
      const parsed = JSON.parse(dadosSalvos);
      atualizarSeNecessario({ ...estadoInicial, ...parsed });
      return;
    }

    const isFormularioLimpo =
      JSON.stringify(campos) === JSON.stringify(estadoInicial);

    if (especieData?.receitaManejoPadrao && isFormularioLimpo) {
      try {
        const template = JSON.parse(especieData.receitaManejoPadrao);
        atualizarSeNecessario(template);
      } catch {
        console.error("Erro ao ler template da espécie");
      }
    }
  }, [open, dadosSalvos, especieData]);

  const handleChange = (campo: keyof DadosManejo, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleRestaurarPadrao = () => {
    if (especieData?.receitaManejoPadrao) {
      try {
        const template = JSON.parse(especieData.receitaManejoPadrao);
        setCampos(limparQuebrasDeLinha(template));
        toast.success("Padrão da espécie restaurado!");
      } catch {
        toast.error("Erro no formato do template.");
      }
    } else {
      toast.info("Não há template padrão para esta espécie.");
    }
  };

  const handlePrint = async () => {
    const temConteudo = Object.values(campos).some((v) => v.trim().length > 0);
    if (!temConteudo) {
      toast.error("Preencha pelo menos um campo.");
      return;
    }

    // 1. Gera PDF
    gerarPDFManejo(campos, paciente, veterinario);

    if (onSave) {
      onSave(JSON.stringify(campos));
    }

    // 2. Registra Auditoria
    const token = localStorage.getItem("vestris_token");
    if (token) {
      try {
        await registrarEventoAuditoria(
          {
            acao: "PDF_MANEJO_GERADO",
            entidade: "MANEJO",
            idAlvo:
              atendimentoId ||
              pacienteId ||
              "00000000-0000-0000-0000-000000000000",
            descricao: `Guia de manejo gerado para ${paciente.especie}`,
            metadados: JSON.stringify({ especie: paciente.especie }),
          },
          token,
        );
      } catch (error) {
        console.error("Erro auditoria manejo", error);
      }
    }

    toast.success("Documento gerado e salvo!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-emerald-800">
              <Leaf className="h-5 w-5" /> Orientação de Manejo:{" "}
              {paciente.especie}
            </DialogTitle>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </div>
          <DialogDescription>
            Documento estruturado. Edite conforme a necessidade do paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 my-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCampos(estadoInicial)}
            className="text-xs text-slate-400"
          >
            <Eraser className="h-3 w-3 mr-2" /> Limpar Tudo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestaurarPadrao}
            className="text-xs gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            disabled={!especieData?.receitaManejoPadrao}
          >
            <Wand2 className="h-3 w-3" /> Restaurar Padrão {paciente.especie}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🏠 1. Ambiente / Recinto
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.ambiente}
              onChange={(e) => handleChange("ambiente", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🌡️ 2. Clima
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.clima}
              onChange={(e) => handleChange("clima", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🥬 3. Alimentação
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.alimentacao}
              onChange={(e) => handleChange("alimentacao", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              💧 4. Hidratação
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.hidratacao}
              onChange={(e) => handleChange("hidratacao", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              ✋ 5. Manuseio
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.manuseio}
              onChange={(e) => handleChange("manuseio", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🧼 6. Higiene
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.higiene}
              onChange={(e) => handleChange("higiene", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
              🚨 7. Alertas
            </Label>
            <Textarea
              className="h-24 resize-none bg-red-50/30 border-red-100 text-sm"
              value={campos.alertas}
              onChange={(e) => handleChange("alertas", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
              🔄 8. Rotina
            </Label>
            <Textarea
              className="h-24 resize-none bg-blue-50/30 border-blue-100 text-sm"
              value={campos.rotina}
              onChange={(e) => handleChange("rotina", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-emerald-700 hover:bg-emerald-800 gap-2 text-white"
          >
            <Printer className="h-4 w-4" /> Gerar Documento & Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
