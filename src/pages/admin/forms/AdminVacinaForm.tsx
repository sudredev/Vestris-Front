import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vacinasService } from "@/lib/api-client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Save, Syringe } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  fabricante: z.string().optional(),
  tipoVacina: z.string().optional(),
  descricao: z.string().optional(),
  doencaAlvo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AdminVacinaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: vacinaExistente } = useQuery({
    queryKey: ["vacina", id],
    queryFn: async () => {
      if (!id) return null;
      return (await vacinasService.buscarVacinaPorId(id)).data.dados;
    },
    enabled: !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      fabricante: "",
      tipoVacina: "",
      descricao: "",
      doencaAlvo: "",
    },
  });

  useEffect(() => {
    if (vacinaExistente) {
      form.reset({
        nome: vacinaExistente.nome || "",
        fabricante: vacinaExistente.fabricante || "",
        tipoVacina: vacinaExistente.tipoVacina || "",
        descricao: vacinaExistente.descricao || "",
        doencaAlvo: vacinaExistente.doencaAlvo || "",
      });
    }
  }, [vacinaExistente, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (id) {
        await vacinasService.atualizarVacina(id, values);
      } else {
        await vacinasService.criarVacina(values);
      }
    },
    onSuccess: () => {
      toast.success("Vacina salva!");
      queryClient.invalidateQueries({ queryKey: ["vacinas-catalogo"] });
      navigate("/admin/conteudo"); // Volta para o painel
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
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Syringe className="h-5 w-5" />{" "}
            {id ? "Editar Vacina" : "Nova Vacina"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Vacina</FormLabel>
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
                <FormField
                  control={form.control}
                  name="tipoVacina"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo (Vira, Inativada...)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="doencaAlvo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doença Alvo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Doença de Newcastle" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição / Obs</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={mutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" /> Salvar Vacina
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
