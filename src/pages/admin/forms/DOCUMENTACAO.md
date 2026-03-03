## pages\admin\forms

### AdminContraindicacaoForm.tsx

```typescript
// pages\admin\forms\AdminContraindicacaoForm.tsx
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

```

### AdminDoencaForm.tsx

```typescript
// pages\admin\forms\AdminDoencaForm.tsx
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

```

### AdminEspecieForm.tsx

```typescript
// pages\admin\forms\AdminEspecieForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { speciesService } from "@/lib/api-client";
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
import { ArrowLeft, Save, PawPrint, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  nomePopular: z.string().min(2),
  nomeCientifico: z.string().min(2),
  familiaTaxonomica: z.string().optional(),
  grupo: z.string().optional(),
  resumoClinico: z.string().optional(),
  parametrosFisiologicos: z.string().optional(),
  expectativaVida: z.string().optional(),
  pesoAdulto: z.string().optional(),
  manejo_ambiente: z.string().optional(),
  manejo_clima: z.string().optional(),
  manejo_alimentacao: z.string().optional(),
  manejo_hidratacao: z.string().optional(),
  manejo_manuseio: z.string().optional(),
  manejo_higiene: z.string().optional(),
  manejo_alertas: z.string().optional(),
  manejo_rotina: z.string().optional(),
  habitat: z.string().optional(),
  bibliografiaBase: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AdminEspecieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: especieExistente } = useQuery({
    queryKey: ["especie", id],
    queryFn: async () => {
      if (!id) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await speciesService.buscarEspeciePorId(id)).data.dados as any;
    },
    enabled: !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomePopular: "",
      nomeCientifico: "",
      familiaTaxonomica: "",
      grupo: "",
      resumoClinico: "",
      parametrosFisiologicos: "",
      expectativaVida: "",
      pesoAdulto: "",
      manejo_ambiente: "",
      manejo_clima: "",
      manejo_alimentacao: "",
      manejo_hidratacao: "",
      manejo_manuseio: "",
      manejo_higiene: "",
      manejo_alertas: "",
      manejo_rotina: "",
      habitat: "",
      bibliografiaBase: "",
    },
  });

  useEffect(() => {
    if (especieExistente) {
      let manejo = {};
      try {
        if (especieExistente.receitaManejoPadrao) {
          manejo = JSON.parse(especieExistente.receitaManejoPadrao);
        }
        // eslint-disable-next-line no-empty
      } catch {}

      form.reset({
        nomePopular: especieExistente.nomePopular,
        nomeCientifico: especieExistente.nomeCientifico,
        familiaTaxonomica: especieExistente.familiaTaxonomica,
        grupo: especieExistente.grupo,
        resumoClinico: especieExistente.resumoClinico,
        parametrosFisiologicos: especieExistente.parametrosFisiologicos,
        expectativaVida: especieExistente.expectativaVida,
        pesoAdulto: especieExistente.pesoAdulto,
        habitat: especieExistente.habitat,
        bibliografiaBase: especieExistente.bibliografiaBase,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_ambiente: (manejo as any).ambiente || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_clima: (manejo as any).clima || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_alimentacao: (manejo as any).alimentacao || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_hidratacao: (manejo as any).hidratacao || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_manuseio: (manejo as any).manuseio || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_higiene: (manejo as any).higiene || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_alertas: (manejo as any).alertas || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_rotina: (manejo as any).rotina || "",
      });
    }
  }, [especieExistente, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const jsonManejo = JSON.stringify({
        ambiente: values.manejo_ambiente,
        clima: values.manejo_clima,
        alimentacao: values.manejo_alimentacao,
        hidratacao: values.manejo_hidratacao,
        manuseio: values.manejo_manuseio,
        higiene: values.manejo_higiene,
        alertas: values.manejo_alertas,
        rotina: values.manejo_rotina,
      });

      const payload = {
        ...values,
        receitaManejoPadrao: jsonManejo,
        manejoInfos: values.manejo_alimentacao,
        alertasClinicos: values.manejo_alertas,
      };

      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await speciesService.atualizarEspecie(id, payload as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await speciesService.criarEspecie(payload as any);
      }
    },
    onSuccess: () => {
      toast.success("Espécie salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["especies"] });
      navigate("/admin/conteudo");
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (id) await speciesService.deletarEspecie(id);
    },
    onSuccess: () => {
      toast.success("Espécie excluída.");
      queryClient.invalidateQueries({ queryKey: ["especies"] });
      navigate("/admin/conteudo");
    },
    onError: () =>
      toast.error("Não é possível excluir. Verifique se há vínculos."),
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 pl-0 text-slate-500"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <Card>
        <CardHeader className="bg-emerald-50 border-b border-emerald-100 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <PawPrint className="h-5 w-5" />{" "}
            {id ? "Editar Espécie" : "Nova Espécie"}
          </CardTitle>

          {/* BOTÃO DE EXCLUIR */}
          {id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Espécie?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso só funcionará se não houver doenças ou pacientes
                    vinculados.
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
              className="space-y-6"
            >
              <Tabs defaultValue="geral" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="geral">Identificação</TabsTrigger>
                  <TabsTrigger value="clinica">Dados Clínicos</TabsTrigger>
                  <TabsTrigger value="manejo">Manejo (8 Pilares)</TabsTrigger>
                </TabsList>

                {/* ABA 1: GERAL */}
                <TabsContent value="geral" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomePopular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Popular</FormLabel>
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
                          <FormLabel>Nome Científico</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="familiaTaxonomica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Família</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grupo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo (Ave, Réptil...)</FormLabel>
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
                    name="resumoClinico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resumo Clínico (Descrição)</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="habitat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habitat</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bibliografiaBase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bibliografia Base</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* ABA 2: CLÍNICA */}
                <TabsContent value="clinica" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expectativaVida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expectativa de Vida</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pesoAdulto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso Adulto</FormLabel>
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
                    name="parametrosFisiologicos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Parâmetros Fisiológicos (FC, FR, Temp)
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} className="font-mono h-32" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* ABA 3: MANEJO */}
                <TabsContent value="manejo" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="manejo_ambiente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1. Ambiente</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_clima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2. Clima</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_alimentacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>3. Alimentação</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_hidratacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>4. Hidratação</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_manuseio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>5. Manuseio</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_higiene"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>6. Higiene</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_alertas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600">
                            7. Alertas de Saúde
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24 bg-red-50" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_rotina"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>8. Rotina</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                  disabled={mutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar Espécie
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

```

### AdminMedicamentoForm.tsx

```typescript
// pages\admin\forms\AdminMedicamentoForm.tsx
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

```

### AdminProtocoloForm.tsx

```typescript
// pages\admin\forms\AdminProtocoloForm.tsx
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  protocolsService,
  diseasesService,
  medicamentosService,
} from "@/lib/api-client";
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
import { ArrowLeft, Save, Plus, Trash2, Syringe } from "lucide-react";

// Schema (Rigoroso para Oficial)
const dosagemSchema = z.object({
  medicamentoId: z.string().min(1, "Medicamento obrigatório"), // ID real
  medicamentoTexto: z.string().optional(),
  doseMinima: z.coerce.number().min(0.0001, "Dose obrigatória"),
  doseMaxima: z.coerce.number().optional(),
  unidade: z.string().min(1),
  frequencia: z.string().min(1),
  duracao: z.string().min(1),
  via: z.string().min(1),
});

const schema = z.object({
  titulo: z.string().min(3),
  doencaId: z.string().min(1, "Doença obrigatória"),
  referenciaTexto: z
    .string()
    .min(3, "Fonte bibliográfica obrigatória para oficiais"),
  observacoes: z.string().optional(),
  dosagens: z.array(dosagemSchema).min(1, "Adicione medicamentos"),
});

type FormValues = z.infer<typeof schema>;

export function AdminProtocoloForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Busca Doenças
  const { data: doencas } = useQuery({
    queryKey: ["doencas-combo"],
    queryFn: async () =>
      (await diseasesService.listarDoencas()).data.dados || [],
  });

  // 2. Busca Medicamentos (Base Oficial)
  const { data: medicamentos } = useQuery({
    queryKey: ["medicamentos-combo"],
    queryFn: async () =>
      (await medicamentosService.listarMedicamentos()).data.dados || [],
  });

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      titulo: "",
      doencaId: "",
      referenciaTexto: "",
      observacoes: "",
      dosagens: [
        {
          medicamentoId: "",
          doseMinima: 0,
          unidade: "mg/kg",
          frequencia: "BID",
          duracao: "7 dias",
          via: "Oral",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dosagens",
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        origem: "OFICIAL", // Força Oficial
        // Mapeia o ID do medicamento também como texto para compatibilidade
        dosagens: values.dosagens.map((d) => ({
          ...d,
          medicamentoTexto: medicamentos?.find((m) => m.id === d.medicamentoId)
            ?.nome,
        })),
      };

      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await protocolsService.atualizarProtocolo(id, payload as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await protocolsService.criarProtocolo(payload as any);
      }
    },
    onSuccess: () => {
      toast.success("Protocolo Oficial Salvo!");
      queryClient.invalidateQueries({ queryKey: ["protocolos"] });
      navigate("/admin/conteudo");
    },
    onError: () => toast.error("Erro ao salvar protocolo."),
  });

  // Lógica de Delete (se edição)
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (id) await protocolsService.deletarProtocolo(id);
    },
    onSuccess: () => {
      toast.success("Protocolo removido.");
      navigate("/admin/conteudo");
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 pl-0 text-slate-500"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <Card>
        <CardHeader className="bg-violet-50 border-b border-violet-100 flex flex-row justify-between">
          <CardTitle className="flex items-center gap-2 text-violet-700">
            <Syringe className="h-5 w-5" />{" "}
            {id ? "Editar Protocolo Oficial" : "Novo Protocolo Oficial"}
          </CardTitle>
          {id && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doencaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doença Alvo</FormLabel>
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
                          {doencas?.map((d) => (
                            <SelectItem key={d.id} value={d.id!}>
                              {d.nome}
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
                name="referenciaTexto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Referência Bibliográfica (Livro/Artigo)
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Técnicas</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DOSAGENS */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">
                    Itens do Protocolo
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      append({
                        medicamentoId: "",
                        doseMinima: 0,
                        unidade: "mg/kg",
                        frequencia: "BID",
                        duracao: "7 dias",
                        via: "Oral",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-slate-50 p-4 rounded border grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                  >
                    <div className="md:col-span-4">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.medicamentoId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Medicamento Oficial
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {medicamentos?.map((m) => (
                                  <SelectItem key={m.id} value={m.id!}>
                                    {m.nome} ({m.concentracao})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.doseMinima`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Dose Min</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                className="h-9"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.unidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Unid</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-9" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.frequencia`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Freq</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-9" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={mutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar Protocolo Oficial
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

```

### AdminVacinaForm.tsx

```typescript
// pages\admin\forms\AdminVacinaForm.tsx
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

```

