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
