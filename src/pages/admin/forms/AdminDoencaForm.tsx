import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { diseasesService, speciesService } from "@/lib/api-client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Save, Activity, Trash2 } from "lucide-react";
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

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  nomeCientifico: z.string().optional(),
  sintomas: z.string().optional(),
  especieId: z.string().min(1, "Selecione a espécie"),
});

type FormValues = z.infer<typeof schema>;

export function AdminDoencaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: especies } = useQuery({
    queryKey: ["especies-combo"],
    queryFn: async () =>
      (await speciesService.listarEspecies()).data.dados || [],
  });

  const { data: doencaExistente } = useQuery({
    queryKey: ["doenca", id],
    queryFn: async () => {
      if (!id) return null;
      return (await diseasesService.buscarDoencaPorId(id)).data.dados;
    },
    enabled: !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      nomeCientifico: "",
      sintomas: "",
      especieId: "",
    },
  });

  useEffect(() => {
    if (doencaExistente) {
      form.reset({
        nome: doencaExistente.nome || "",
        nomeCientifico: doencaExistente.nomeCientifico || "",
        sintomas: doencaExistente.sintomas || "",
        especieId: doencaExistente.especieId || "",
      });
    }
  }, [doencaExistente, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (id) await diseasesService.atualizarDoenca(id, values);
      else await diseasesService.criarDoenca(values);
    },
    onSuccess: () => {
      toast.success(id ? "Doença atualizada!" : "Doença cadastrada!");
      queryClient.invalidateQueries({ queryKey: ["doencas"] });
      navigate("/admin/conteudo");
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (id) await diseasesService.deletarDoenca(id);
    },
    onSuccess: () => {
      toast.success("Doença removida.");
      queryClient.invalidateQueries({ queryKey: ["doencas"] });
      navigate("/admin/conteudo");
    },
    onError: () =>
      toast.error("Erro ao excluir. Pode haver protocolos vinculados."),
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
        <CardHeader className="bg-red-50 border-b border-red-100 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Activity className="h-5 w-5" />{" "}
            {id ? "Editar Patologia" : "Nova Patologia"}
          </CardTitle>

          {id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Doença?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso pode quebrar protocolos vinculados a esta doença.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600"
                    onClick={() => deleteMutation.mutate()}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="especieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Espécie Acometida</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!id}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {especies?.map((e) => (
                          <SelectItem key={e.id} value={e.id!}>
                            {e.nomePopular}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Doença</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nomeCientifico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agente / Nome Científico</FormLabel>
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
                name="sintomas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sintomas / Sinais Clínicos</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="h-32" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={mutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" /> Salvar Doença
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
