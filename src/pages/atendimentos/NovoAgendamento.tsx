/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/atendimentos/NovoAgendamento.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { patientsService, recordsService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { toast } from "sonner";
import {
  CalendarPlus,
  Loader2,
  ArrowLeft,
  Stethoscope,
  Syringe,
  RotateCcw,
  Activity,
  Scissors,
  Microscope,
} from "lucide-react";
import type { AgendamentoRequest } from "@/api";

// ENUM LOCAL PARA O FRONTEND
const TIPOS_ATENDIMENTO = [
  { value: "CONSULTA_CLINICA", label: "Consulta Clínica", icon: Stethoscope },
  { value: "VACINACAO", label: "Vacinação", icon: Syringe },
  { value: "RETORNO", label: "Retorno", icon: RotateCcw },
  { value: "PROCEDIMENTO", label: "Procedimento", icon: Activity },
  { value: "CIRURGIA", label: "Cirurgia", icon: Scissors },
  { value: "EXAME", label: "Coleta / Exame", icon: Microscope },
];

const schema = z.object({
  pacienteId: z.string().min(1, "Selecione o paciente"),
  tipo: z.string().min(1, "Selecione o tipo"),
  titulo: z.string().min(3, "Informe um título"),
  dataHora: z.string().min(1, "Data e hora são obrigatórias"),
});

type FormValues = z.infer<typeof schema>;

export function NovoAgendamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthUser();
  const state = location.state as { pacienteIdPreSelecionado?: string } | null;

  const { data: pacientes } = useQuery({
    queryKey: ["pacientes-select"],
    queryFn: async () =>
      (await patientsService.listarPacientes(user?.id || "")).data.dados || [],
    enabled: !!user?.id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pacienteId: state?.pacienteIdPreSelecionado || "",
      tipo: "CONSULTA_CLINICA", // Default
      titulo: "",
      dataHora: "",
    },
  });

  // Auto-preencher título baseado no tipo
  const handleTipoChange = (val: string) => {
    form.setValue("tipo", val);
    const label = TIPOS_ATENDIMENTO.find((t) => t.value === val)?.label;
    if (label) form.setValue("titulo", label); // Ex: Preenche "Vacinação" automaticamente
  };

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user?.id) throw new Error("Erro de sessão");
      const payload = {
        veterinarioId: user.id,
        pacienteId: values.pacienteId,
        titulo: values.titulo,
        dataHora: new Date(values.dataHora).toISOString(),
        tipo: values.tipo, // <--- Enviando o tipo
      } as any as AgendamentoRequest;

      await recordsService.agendarAtendimento(payload);
    },
    onSuccess: () => {
      toast.success("Agendado com sucesso!");
      navigate("/atendimentos");
    },
    onError: () => toast.error("Erro ao agendar."),
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      <Button
        variant="ghost"
        className="mb-6 pl-0 text-slate-500"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-8 pt-8 px-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 shadow-sm">
              <CalendarPlus className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-800">
                Novo Agendamento
              </CardTitle>
              <CardDescription>
                Configure o tipo de serviço e horário.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TIPO DE ATENDIMENTO */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Atendimento</FormLabel>
                      <Select
                        onValueChange={handleTipoChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIPOS_ATENDIMENTO.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-2">
                                <t.icon className="h-4 w-4 text-slate-500" />{" "}
                                {t.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PACIENTE */}
                <FormField
                  control={form.control}
                  name="pacienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pacientes?.map((p) => (
                            <SelectItem key={p.id} value={p.id!}>
                              {p.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo / Título</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11"
                        placeholder="Ex: Consulta Dermatológica"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataHora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-12 px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}{" "}
                  Confirmar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
