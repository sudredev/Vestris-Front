import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { medicamentosService, principiosService } from "@/lib/api-client"; // Adicione principiosService
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save, Pill } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  concentracao: z.string().optional(),
  fabricante: z.string().optional(),
  formaFarmaceutica: z.string().optional(),
  principioAtivoId: z.string().min(1, "Selecione o Princípio Ativo"), // Agora validamos seleção
});

type FormValues = z.infer<typeof schema>;

export function AdminMedicamentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. BUSCA LISTA DE PRINCÍPIOS ATIVOS (Para o Select)
  const { data: principios } = useQuery({
    queryKey: ["principios-combo"],
    queryFn: async () => {
      try {
        const res = await principiosService.listarPrincipiosAtivos();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  const { data: medExistente } = useQuery({
    queryKey: ["medicamento", id],
    queryFn: async () => {
      if (!id) return null;
      return (await medicamentosService.buscarMedicamentoPorId(id)).data.dados;
    },
    enabled: !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      concentracao: "",
      fabricante: "",
      formaFarmaceutica: "",
      principioAtivoId: "",
    },
  });

  useEffect(() => {
    if (medExistente) {
      form.reset({
        nome: medExistente.nome || "",
        concentracao: medExistente.concentracao || "",
        fabricante: medExistente.fabricante || "",
        formaFarmaceutica: medExistente.formaFarmaceutica || "",
        principioAtivoId: medExistente.principioAtivoId || "",
      });
    }
  }, [medExistente, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (id) {
        await medicamentosService.atualizarMedicamento(id, values);
      } else {
        await medicamentosService.criarMedicamento(values);
      }
    },
    onSuccess: () => {
      toast.success("Medicamento salvo!");
      queryClient.invalidateQueries({ queryKey: ["medicamentos-lista"] });
      navigate("/admin/conteudo");
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 pl-0 text-slate-500"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Pill className="h-5 w-5" />{" "}
            {id ? "Editar Medicamento" : "Novo Medicamento"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-4"
            >
              {/* SELEÇÃO DO PRINCÍPIO ATIVO (CORRIGIDO) */}
              <FormField
                control={form.control}
                name="principioAtivoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Princípio Ativo (Molécula)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a molécula..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {principios?.map((p) => (
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

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Comercial</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="concentracao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concentração</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10 mg/ml" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="formaFarmaceutica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Suspensão..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fabricante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fabricante</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={mutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" /> Salvar Medicamento
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
