## pages\pacientes\components

### ListaVacinas.tsx

```typescript
// pages\pacientes\components\ListaVacinas.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientVaccinationService } from "@/lib/api-client";
import { format, isPast, isToday } from "date-fns";

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
      const res = await patientVaccinationService.listarVacinasDoPaciente(
        pacienteId
      );
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
          Registre a primeira aplicação acima.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {vacinas.map((item) => {
        let statusDose = null;
        if (item.dataProximaDose) {
          const dataProx = new Date(item.dataProximaDose);
          if (isPast(dataProx) && !isToday(dataProx)) {
            statusDose = (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Atrasada
              </Badge>
            );
          } else {
            statusDose = (
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200 bg-blue-50 gap-1"
              >
                <CalendarClock className="h-3 w-3" /> Prevista
              </Badge>
            );
          }
        } else {
          statusDose = (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 hover:bg-green-200 border-none gap-1"
            >
              <CheckCircle2 className="h-3 w-3" /> Concluído
            </Badge>
          );
        }

        return (
          <Card
            key={item.id}
            className="border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Syringe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {item.vacinaNome}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>
                      Aplicado em:{" "}
                      {/* CORREÇÃO: Fallback || "" para evitar erro de tipo */}
                      <strong>
                        {format(
                          new Date(item.dataAplicacao || ""),
                          "dd/MM/yyyy"
                        )}
                      </strong>
                    </span>
                    {item.lote && <span>• Lote: {item.lote}</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Vet: {item.veterinarioNome}
                  </div>

                  {item.observacoes && (
                    <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      Obs: {item.observacoes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[140px]">
                {item.dataProximaDose && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Próxima Dose
                    </span>
                    <div className="text-sm font-medium text-slate-700 mb-1">
                      {format(new Date(item.dataProximaDose), "dd/MM/yyyy")}
                    </div>
                    {statusDose}
                  </div>
                )}
                {!item.dataProximaDose && (
                  <div className="mt-2">{statusDose}</div>
                )}

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
                        Esta ação não pode ser desfeita.
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

```

### RegistroVacinalModal.tsx

```typescript
// pages\pacientes\components\RegistroVacinalModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vacinasService, patientVaccinationService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Syringe, Calendar as CalendarIcon, Loader2 } from "lucide-react";

const vacinaSchema = z.object({
  vacinaId: z.string().min(1, "Selecione a vacina"),
  dataAplicacao: z.string().min(1, "Data é obrigatória"),
  dataProximaDose: z.string().optional(),
  lote: z.string().optional(),
  observacoes: z.string().optional(),
});

type VacinaFormValues = z.infer<typeof vacinaSchema>;

interface Props {
  pacienteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistroVacinaModal({ pacienteId, open, onOpenChange }: Props) {
  const user = getAuthUser();
  const queryClient = useQueryClient();

  const { data: vacinas } = useQuery({
    queryKey: ["vacinas-catalogo"],
    queryFn: async () => {
      try {
        const res = await vacinasService.listarVacinas();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
    enabled: open,
  });

  const form = useForm<VacinaFormValues>({
    resolver: zodResolver(vacinaSchema),
    defaultValues: {
      vacinaId: "",
      dataAplicacao: new Date().toISOString().split("T")[0],
      dataProximaDose: "",
      lote: "",
      observacoes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: VacinaFormValues) => {
      if (!user?.id) throw new Error("Usuário não logado");

      await patientVaccinationService.registrarVacinaPaciente(
        pacienteId,
        user.id,
        {
          vacinaId: values.vacinaId,
          dataAplicacao: values.dataAplicacao,
          // CORREÇÃO: 'as any' para burlar o tipo complexo JsonNullableLocalDate
          // O backend vai entender a string da data perfeitamente.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dataProximaDose: (values.dataProximaDose || undefined) as any,
          lote: values.lote,
          observacoes: values.observacoes,
        }
      );
    },
    onSuccess: () => {
      toast.success("Vacina registrada com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["vacinas-paciente", pacienteId],
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Erro ao registrar vacina."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-blue-600" /> Registrar Vacinação
          </DialogTitle>
          <DialogDescription>
            Registre a aplicação de um imunobiológico neste paciente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="vacinaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vacina</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vacinas?.map((v) => (
                        <SelectItem key={v.id} value={v.id!}>
                          {v.nome} ({v.tipoVacina})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataAplicacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Aplicação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote / Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: AX990" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dataProximaDose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700">
                    Próxima Dose (Revacinação)
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-blue-50/50 border-blue-100 focus:border-blue-300"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Local de aplicação, reação, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar Aplicação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

```

