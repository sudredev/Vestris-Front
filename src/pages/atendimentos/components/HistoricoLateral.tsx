import { useQuery } from "@tanstack/react-query";
import { recordsService } from "@/lib/api-client";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ArrowRight, History, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface Props {
  pacienteId?: string;
  atendimentoAtualId?: string; // Para não mostrar o próprio atendimento na lista
  onInject: (
    text: string,
    targetField: "historicoClinico" | "condutaClinica" | "queixaPrincipal"
  ) => void;
}

export function HistoricoLateral({
  pacienteId,
  atendimentoAtualId,
  onInject,
}: Props) {
  const { data: historico, isLoading } = useQuery({
    queryKey: ["historico-lateral", pacienteId],
    queryFn: async () => {
      if (!pacienteId) return [];
      const res = await recordsService.listarAtendimentosPorPaciente(
        pacienteId
      );
      return res.data.dados || [];
    },
    enabled: !!pacienteId,
  });

  // Filtra para não mostrar o atendimento que estamos editando agora
  const listaPassada =
    historico?.filter((a) => a.id !== atendimentoAtualId) || [];

  const handleCopy = (
    texto: string | undefined,
    label: string,
    campo: "historicoClinico" | "condutaClinica" | "queixaPrincipal"
  ) => {
    if (!texto) {
      toast.error("Campo vazio neste registro.");
      return;
    }
    onInject(texto, campo);
    toast.success(`${label} copiado para o atendimento atual!`);
  };

  if (!pacienteId)
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        Carregando paciente...
      </div>
    );
  if (isLoading)
    return (
      <div className="p-6 text-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );

  if (listaPassada.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg m-4">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Este é o primeiro atendimento deste paciente.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        <History className="h-4 w-4 text-blue-500" /> Histórico Clínico (
        {listaPassada.length})
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {listaPassada.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id!}
              className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                <div className="text-left w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm">
                      {format(new Date(item.dataHora!), "dd/MM/yyyy")}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    {item.titulo}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Dr(a). {item.veterinarioNome?.split(" ")[0]}
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/30">
                <div className="space-y-4 pt-3">
                  {/* QUEIXA */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Queixa Principal
                    </p>
                    <p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100">
                      {item.queixaPrincipal}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-blue-600 hover:bg-blue-50 w-full justify-start"
                      onClick={() =>
                        handleCopy(
                          item.queixaPrincipal,
                          "Queixa",
                          "queixaPrincipal"
                        )
                      }
                    >
                      <Copy className="h-3 w-3 mr-2" /> Reutilizar Queixa
                    </Button>
                  </div>

                  {/* HISTÓRICO */}
                  {item.historicoClinico && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Anamnese Anterior
                      </p>
                      <p
                        className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100 line-clamp-4 hover:line-clamp-none transition-all cursor-help"
                        title="Clique para expandir"
                      >
                        {item.historicoClinico}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-blue-600 hover:bg-blue-50 w-full justify-start"
                        onClick={() =>
                          handleCopy(
                            item.historicoClinico,
                            "Anamnese",
                            "historicoClinico"
                          )
                        }
                      >
                        <Copy className="h-3 w-3 mr-2" /> Reutilizar Anamnese
                      </Button>
                    </div>
                  )}

                  {/* CONDUTA (O MAIS IMPORTANTE) */}
                  {item.condutaClinica && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" /> Conduta / Tratamento
                      </p>
                      <div className="text-xs text-slate-700 bg-emerald-50/50 p-2 rounded border border-emerald-100 font-mono line-clamp-6 hover:line-clamp-none">
                        {item.condutaClinica}
                      </div>
                      <Button
                        size="sm"
                        className="h-7 text-[10px] bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full shadow-sm"
                        onClick={() =>
                          handleCopy(
                            item.condutaClinica,
                            "Conduta",
                            "condutaClinica"
                          )
                        }
                      >
                        <ArrowRight className="h-3 w-3 mr-2" /> Copiar para
                        Conduta Atual
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
