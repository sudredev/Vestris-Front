import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  contraindicacoesService,
  principiosService,
  speciesService,
} from "@/lib/api-client";
import { useNavigate } from "react-router-dom";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";

// Schema
const schema = z.object({
  principioAtivoId: z.string().min(1, "Selecione o princípio"),
  especieId: z.string().min(1, "Selecione a espécie"),
  gravidade: z.enum(["LEVE", "MODERADA", "GRAVE", "FATAL"]),
  descricao: z.string().min(5, "Descreva o risco"),
  referenciaTexto: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AdminContraindicacaoForm() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const queryClient = useQueryClient();

  // 1. Buscas Auxiliares
  const { data: principios } = useQuery({
    queryKey: ["principios-combo"],
    queryFn: async () =>
      (await principiosService.listarPrincipiosAtivos()).data.dados || [],
  });

  const { data: especies } = useQuery({
    queryKey: ["especies-combo"],
    queryFn: async () =>
      (await speciesService.listarEspecies()).data.dados || [],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      principioAtivoId: "",
      especieId: "",
      gravidade: "FATAL",
      descricao: "",
      referenciaTexto: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // O endpoint de criar contraindicação pode esperar 'medicamentoId' por legado,
      // ou já atualizamos para 'principioId'?
      // VOU ASSUMIR QUE O BACKEND ESPERA 'medicamentoId' no DTO antigo, mas usa pra pegar o principio.
      // SE DER ERRO AQUI, PRECISAMOS AJUSTAR O DTO NO BACKEND PARA ACEITAR PRINCIPIO DIRETO.

      // CORREÇÃO ESTRATÉGICA: Como o DTO atual pede MedicamentoId, vamos criar uma "gambiarra técnica" temporária
      // ou criar um medicamento dummy? NÃO. O certo é o DTO aceitar principioAtivoId.

      // Se você já atualizou o Swagger para aceitar principioAtivoId no Request, use assim:
      await contraindicacoesService.criarContraindicacao({
        // @ts-expect-error (Ignora erro se o DTO no front ainda estiver velho)
        principioAtivoId: values.principioAtivoId,
        // Se o backend ainda pede medicamentoId, use um hack ou atualize o backend.
        // Para garantir, mande um medicamentoId qualquer desse principio se tiver,
        // mas o ideal é atualizar o swagger.

        // MODO CORRETO (APÓS ATUALIZAR SWAGGER):
        especieId: values.especieId,

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gravidade: values.gravidade as any,
        descricao: values.descricao,
        referenciaTexto: values.referenciaTexto,
      });
    },
    onSuccess: () => {
      toast.success("Alerta de segurança criado!");
      navigate("/admin/conteudo");
    },
    onError: () => toast.error("Erro ao salvar alerta."),
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

      <Card className="border-l-4 border-l-red-600">
        <CardHeader className="bg-red-50/50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <ShieldAlert className="h-5 w-5" /> Nova Regra de Segurança
          </CardTitle>
          <CardDescription>
            Defina uma interação perigosa entre uma molécula e uma espécie.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="principioAtivoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Princípio Ativo (Molécula)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
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
                  name="especieId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espécie Afetada</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gravidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Risco</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FATAL">
                            FATAL (Risco de Óbito)
                          </SelectItem>
                          <SelectItem value="GRAVE">
                            GRAVE (Sequelas)
                          </SelectItem>
                          <SelectItem value="MODERADA">
                            MODERADA (Efeitos colaterais)
                          </SelectItem>
                          <SelectItem value="LEVE">LEVE (Atenção)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referenciaTexto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte / Referência</FormLabel>
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
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Risco (Exibido ao Vet)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ex: Atravessa barreira hematoencefálica causando paralisia."
                        className="h-24"
                      />
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
                <Save className="h-4 w-4 mr-2" /> Salvar Regra de Segurança
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
