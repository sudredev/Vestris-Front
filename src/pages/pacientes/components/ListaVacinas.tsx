/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientVaccinationService } from "@/lib/api-client";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Syringe,
  CalendarClock,
  AlertCircle,
  Trash2,
  CheckCircle2,
} from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  pacienteId: string;
}

export function ListaVacinas({ pacienteId }: Props) {
  const queryClient = useQueryClient();

  const { data: vacinas, isLoading } = useQuery({
    queryKey: ["vacinas-paciente", pacienteId],
    queryFn: async () => {
      const res =
        await patientVaccinationService.listarVacinasDoPaciente(pacienteId);
      return res.data.dados || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await patientVaccinationService.deletarVacinaAplicada(id);
    },
    onSuccess: () => {
      toast.success("Registro removido.");
      queryClient.invalidateQueries({
        queryKey: ["vacinas-paciente", pacienteId],
      });
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-400">
        Carregando carteira de vacinação...
      </div>
    );

  if (!vacinas || vacinas.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Syringe className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Nenhuma vacina registrada.</p>
        <p className="text-xs text-slate-400">
          Utilize o botão acima para registrar a primeira aplicação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {vacinas.map((item: any) => {
        // Lógica de Status vinda do Backend (preferencial) ou calculada
        const statusBackend = item.status; // EM_DIA, ATRASADA, CONCLUIDA

        let badgeStatus = null;
        let borderClass = "border-slate-100";

        if (statusBackend === "ATRASADA") {
          borderClass = "border-l-4 border-l-red-500";
          badgeStatus = (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" /> Atrasada
            </Badge>
          );
        } else if (statusBackend === "EM_DIA" && item.dataProximaDose) {
          borderClass = "border-l-4 border-l-blue-500";
          badgeStatus = (
            <Badge
              variant="outline"
              className="text-blue-600 border-blue-200 bg-blue-50 gap-1"
            >
              <CalendarClock className="h-3 w-3" /> Prevista:{" "}
              {format(new Date(item.dataProximaDose), "dd/MM/yyyy")}
            </Badge>
          );
        } else {
          // Concluída ou Dose Única
          borderClass = "border-l-4 border-l-green-500";
          badgeStatus = (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 hover:bg-green-200 border-none gap-1"
            >
              <CheckCircle2 className="h-3 w-3" /> Aplicada
            </Badge>
          );
        }

        return (
          <Card
            key={item.id}
            className={`shadow-sm hover:shadow-md transition-all group ${borderClass}`}
          >
            <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Syringe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {item.vacinaNome || "Vacina"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>
                      Aplicado em:{" "}
                      <strong>
                        {item.dataAplicacao
                          ? format(new Date(item.dataAplicacao), "dd/MM/yyyy")
                          : "--"}
                      </strong>
                    </span>
                    {item.lote && <span>• Lote: {item.lote}</span>}
                  </div>

                  {item.veterinarioNome && (
                    <div className="text-xs text-slate-400 mt-1">
                      Vet: {item.veterinarioNome}
                    </div>
                  )}

                  {item.observacoes && (
                    <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{item.observacoes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[140px]">
                <div className="mt-2">{badgeStatus}</div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita e removerá este item do
                        histórico vacinal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600"
                        onClick={() => deleteMutation.mutate(item.id!)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
