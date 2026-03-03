import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Printer, Pill } from "lucide-react";
import {
  gerarPDFReceita,
  type ItemReceita,
  type DadosCabecalho,
  type DadosPaciente,
} from "@/lib/pdf-service";
import { toast } from "sonner";
import { registrarEventoAuditoria } from "@/api/auditoria"; // <--- Import

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: DadosPaciente;
  veterinario: DadosCabecalho;
  // Novos campos opcionais para auditoria
  atendimentoId?: string;
  pacienteId?: string;
}

export function ReceitaModal({
  open,
  onOpenChange,
  paciente,
  veterinario,
  atendimentoId,
  pacienteId,
}: Props) {
  const [itens, setItens] = useState<ItemReceita[]>([
    { farmaco: "", instrucoes: "" },
  ]);
  const [obs, setObs] = useState("");

  const updateItem = (
    index: number,
    field: keyof ItemReceita,
    value: string,
  ) => {
    const newItens = [...itens];
    newItens[index][field] = value;
    setItens(newItens);
  };

  const addItem = () => setItens([...itens, { farmaco: "", instrucoes: "" }]);

  const removeItem = (index: number) => {
    const newItens = itens.filter((_, i) => i !== index);
    setItens(newItens);
  };

  const handlePrint = async () => {
    const itensValidos = itens.filter((i) => i.farmaco.trim() !== "");
    if (itensValidos.length === 0) {
      toast.error("Adicione pelo menos um medicamento.");
      return;
    }

    // 1. Gera PDF
    gerarPDFReceita(itensValidos, obs, paciente, veterinario);

    // 2. Registra Auditoria
    const token = localStorage.getItem("vestris_token");
    if (token) {
      try {
        await registrarEventoAuditoria(
          {
            acao: "PDF_RECEITA_GERADO",
            entidade: "RECEITA",
            // Usa o ID do atendimento se tiver, senão o do paciente, senão zero
            idAlvo:
              atendimentoId ||
              pacienteId ||
              "00000000-0000-0000-0000-000000000000",
            descricao: `Receita gerada para ${paciente.nome} (${itensValidos.length} itens)`,
            metadados: JSON.stringify({
              farmacos: itensValidos.map((i) => i.farmaco).join(", "),
            }),
          },
          token,
        );
      } catch (error) {
        console.error("Falha ao auditar receita", error);
      }
    }

    toast.success("Receita gerada!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-600" /> Nova Receita
            Veterinária
          </DialogTitle>
          <DialogDescription>
            Adicione os medicamentos e instruções claras para o tutor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            {itens.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative group"
              >
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Medicamento / Concentração
                    </label>
                    <Input
                      placeholder="Ex: Doxfin Suspensão 10mg/ml"
                      className="bg-white font-medium"
                      value={item.farmaco}
                      onChange={(e) =>
                        updateItem(index, "farmaco", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Instruções ao Tutor
                    </label>
                    <Textarea
                      placeholder="Ex: Dar 0.5ml via oral, a cada 12 horas, por 10 dias."
                      className="bg-white resize-none"
                      value={item.instrucoes}
                      onChange={(e) =>
                        updateItem(index, "instrucoes", e.target.value)
                      }
                    />
                  </div>
                </div>

                {itens.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addItem}
            className="w-full border-dashed border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Outro Medicamento
          </Button>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Observações Gerais (Opcional)
            </label>
            <Input
              placeholder="Ex: Retorno em 7 dias para reavaliação."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 gap-2"
          >
            <Printer className="h-4 w-4" /> Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
