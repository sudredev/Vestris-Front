import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { medicamentosService, segurancaService } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Search, Pill, Loader2, Plus, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  onInject: (text: string, targetField: "condutaClinica") => void;
  especieId?: string;
}

export function BuscadorFarmacos({ onInject, especieId }: Props) {
  const [busca, setBusca] = useState("");

  // Estado para controlar o Modal de Risco
  const [riscoDetectado, setRiscoDetectado] = useState<{
    nivel: string;
    descricao: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    medicamento: any;
  } | null>(null);

  const { data: farmacos, isLoading } = useQuery({
    queryKey: ["medicamentos-lista"],
    queryFn: async () => {
      try {
        const res = await medicamentosService.listarMedicamentos();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClickUsar = async (medicamento: any) => {
    // 1. Se não tiver espécie, injeta direto (vet assume que sabe o que faz)
    if (!especieId) {
      injetarMedicamento(medicamento);
      return;
    }

    // 2. Valida Segurança
    try {
      const res = await segurancaService.validarSeguranca(
        medicamento.id,
        especieId,
      );
      const alertas = res.data || [];

      // Pega o pior risco (FATAL > GRAVE > MODERADA)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const riscoFatal = alertas.find((a: any) => a.nivel === "FATAL");
      const riscoGrave = alertas.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => a.nivel === "GRAVE" || a.nivel === "MODERADA",
      );

      const risco = riscoFatal || riscoGrave;

      if (risco) {
        // ABRE O MODAL
        setRiscoDetectado({
          nivel: risco.nivel || "",
          descricao: risco.descricao || "",
          medicamento: medicamento,
        });
      } else {
        // SEGURO: Injeta direto
        injetarMedicamento(medicamento);
      }
    } catch (e) {
      console.error("Erro ao validar", e);
      // Em caso de erro de rede, permite usar com aviso
      injetarMedicamento(medicamento);
    }
  };

  const confirmarRisco = () => {
    if (riscoDetectado) {
      injetarMedicamento(riscoDetectado.medicamento, true); // true = Risco Aceito
      setRiscoDetectado(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const injetarMedicamento = (medicamento: any, riscoAceito = false) => {
    let texto = `Rx: ${medicamento.nome} (${medicamento.concentracao})\nVia: \nDose: \nFreq: `;

    if (riscoAceito) {
      texto += `\n⚠️ [ALERTA DE SEGURANÇA IGNORADO: Risco ${riscoDetectado?.nivel}]`;
      toast.warning("Medicamento inserido com alerta de risco.");
    } else {
      toast.success("Medicamento inserido!");
    }

    onInject(texto, "condutaClinica");
  };

  const filtrados =
    farmacos?.filter((f) =>
      (f.nome || "").toLowerCase().includes(busca.toLowerCase()),
    ) || [];

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar fármaco..."
          className="pl-8 bg-white h-9 text-xs"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : filtrados.length > 0 ? (
          filtrados.map((item) => (
            <Card
              key={item.id}
              className="border border-slate-100 shadow-sm hover:border-blue-200 transition-colors bg-white"
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">
                      {item.nome}
                    </h4>
                    <p className="text-[10px] text-slate-500 italic">
                      {item.fabricante || "Genérico"} • {item.formaFarmaceutica}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 bg-slate-100 text-slate-600"
                  >
                    {item.concentracao}
                  </Badge>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2 h-7 text-xs text-blue-600 hover:bg-blue-50 border border-blue-100"
                  onClick={() => handleClickUsar(item)}
                >
                  <Plus className="h-3 w-3 mr-2" /> Usar
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Pill className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs">Nenhum medicamento.</p>
          </div>
        )}
      </div>

      {/* MODAL DE SEGURANÇA */}
      <AlertDialog
        open={!!riscoDetectado}
        onOpenChange={(open) => !open && setRiscoDetectado(null)}
      >
        <AlertDialogContent className="border-l-8 border-l-red-600">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Skull className="h-6 w-6" />
              <AlertDialogTitle className="text-xl">
                ALERTA DE SEGURANÇA
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-700 font-medium">
              O sistema detectou uma contraindicação para esta espécie.
            </AlertDialogDescription>

            <div className="bg-red-50 p-4 rounded-md border border-red-100 my-4 text-red-900 text-sm">
              <p className="font-bold uppercase text-xs mb-1">
                Risco {riscoDetectado?.nivel}:
              </p>
              {riscoDetectado?.descricao}
            </div>

            <p className="text-xs text-slate-500">
              Ao confirmar, o medicamento será inserido no prontuário com uma
              nota de alerta, registrando que você optou por prosseguir (uso
              off-label ou risco calculado).
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRiscoDetectado(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarRisco}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Estou ciente, usar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
