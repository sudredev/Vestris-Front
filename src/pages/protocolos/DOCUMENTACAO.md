## pages\protocolos

### MeusProtocolos.tsx

```typescript
// pages\protocolos\MeusProtocolos.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  speciesService,
  diseasesService,
  protocolsService,
} from "@/lib/api-client";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Syringe,
  Plus,
  Edit,
  Trash2,
  Filter,
  ArrowRight,
  Loader2,
  Building2,
  Lock,
  Globe,
  Pill,
  FileText,
  Eye, // Ícone para visualizar
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProtocoloType = any; // Facilitador para tipagem do response

export function MeusProtocolos() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();

  // Estados de Filtro
  const [especieId, setEspecieId] = useState("");
  const [doencaId, setDoencaId] = useState("");

  // Estado para Modal de Visualização
  const [protocoloVisualizado, setProtocoloVisualizado] =
    useState<ProtocoloType | null>(null);

  // Permissões de Criação (Gestor não cria)
  const podeCriar =
    user?.role === "VETERINARIO" ||
    user?.role === "ADMIN_CLINICO" ||
    user?.role === "ADMIN_GLOBAL";

  // 1. Busca Espécies
  const { data: especies } = useQuery({
    queryKey: ["especies-combo"],
    queryFn: async () =>
      (await speciesService.listarEspecies()).data.dados || [],
  });

  // 2. Busca Doenças (Depende da Espécie)
  const { data: doencas, isLoading: loadingDoencas } = useQuery({
    queryKey: ["doencas-combo", especieId],
    queryFn: async () => {
      if (!especieId) return [];
      return (
        (await diseasesService.listarDoencasPorEspecie(especieId)).data.dados ||
        []
      );
    },
    enabled: !!especieId,
  });

  // 3. Busca Protocolos (Busca Inteligente do Backend)
  const { data: protocolos, isLoading: loadingProtos } = useQuery({
    queryKey: ["meus-protocolos", doencaId, user?.id, user?.clinicaId],
    queryFn: async () => {
      if (!doencaId || !user) return [];

      return (
        (
          await protocolsService.listarProtocolosPorDoenca(
            doencaId,
            user.clinicaId, // clinicaId
            user.id, // usuarioId
          )
        ).data.dados || []
      );
    },
    enabled: !!doencaId && !!user,
  });

  // Mutação de Exclusão
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await protocolsService.deletarProtocolo(id);
    },
    onSuccess: () => {
      toast.success("Protocolo removido.");
      queryClient.invalidateQueries({ queryKey: ["meus-protocolos"] });
    },
    onError: () => toast.error("Erro ao excluir (permissão negada ou em uso)."),
  });

  // Função auxiliar para verificar permissão de edição/exclusão por item
  const podeEditarProtocolo = (proto: ProtocoloType) => {
    // Admin Global edita Oficial
    if (user?.role === "ADMIN_GLOBAL" && proto.origem === "OFICIAL")
      return true;

    // Gestor nunca edita
    if (user?.role === "ADMIN_GESTOR") return false;

    // Admin Clínico edita Institucional e Próprio (dele)
    if (user?.role === "ADMIN_CLINICO") {
      if (proto.origem === "INSTITUCIONAL") return true;
      if (proto.origem === "PROPRIO" && proto.autorId === user.id) return true;
      return false;
    }

    // Veterinário edita apenas Próprio (dele)
    if (user?.role === "VETERINARIO") {
      if (proto.origem === "PROPRIO" && proto.autorId === user.id) return true;
      return false;
    }

    return false;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Syringe className="h-6 w-6 text-slate-700" /> Protocolos Clínicos
          </h1>
          <p className="text-slate-500 text-sm">
            Consulte tratamentos oficiais, institucionais e pessoais.
          </p>
        </div>

        {podeCriar && (
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white"
            onClick={() => navigate("/protocolos/novo")}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Protocolo
          </Button>
        )}
      </div>

      {/* FILTROS EM CASCATA */}
      <Card className="bg-slate-50 border-slate-200 shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Filter className="h-3 w-3" /> 1. Selecione a Espécie
            </label>
            <Select
              value={especieId}
              onValueChange={(v) => {
                setEspecieId(v);
                setDoencaId("");
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {especies?.map((e: any) => (
                  <SelectItem key={e.id} value={e.id!}>
                    {e.nomePopular}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <ArrowRight className="h-3 w-3" /> 2. Selecione a Doença
            </label>
            <Select
              value={doencaId}
              onValueChange={setDoencaId}
              disabled={!especieId}
            >
              <SelectTrigger className="bg-white">
                <SelectValue
                  placeholder={
                    loadingDoencas ? "Carregando..." : "Selecione..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {doencas?.map((d: any) => (
                  <SelectItem key={d.id} value={d.id!}>
                    {d.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* LISTAGEM */}
      <div className="space-y-4">
        {!doencaId ? (
          <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Syringe className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>
              Selecione os filtros acima para visualizar os protocolos
              disponíveis.
            </p>
          </div>
        ) : loadingProtos ? (
          <div className="text-center py-10">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-500" />
          </div>
        ) : protocolos && protocolos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {protocolos.map((proto: any) => (
              <div
                key={proto.id}
                className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all
                    ${proto.origem === "OFICIAL" ? "border-blue-100 hover:border-blue-300" : ""}
                    ${proto.origem === "INSTITUCIONAL" ? "border-emerald-100 hover:border-emerald-300" : ""}
                    ${proto.origem === "PROPRIO" ? "border-slate-200 hover:border-slate-400" : ""}
                `}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">
                      {proto.titulo}
                    </h3>

                    {/* LABELS DE ORIGEM */}
                    {proto.origem === "OFICIAL" && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border border-blue-200 gap-1"
                      >
                        <Globe className="h-3 w-3" /> Oficial
                      </Badge>
                    )}
                    {proto.origem === "INSTITUCIONAL" && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1"
                      >
                        <Building2 className="h-3 w-3" /> Institucional
                      </Badge>
                    )}
                    {proto.origem === "PROPRIO" && (
                      <Badge
                        variant="outline"
                        className="text-slate-600 bg-slate-50 gap-1"
                      >
                        <Lock className="h-3 w-3" /> Pessoal
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 max-w-2xl">
                    {proto.observacoes || "Sem observações adicionais."}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Pill className="h-3 w-3" /> {proto.dosagens?.length || 0}{" "}
                      itens
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Ref:{" "}
                      {proto.referenciaTexto || "---"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {/* --- BOTÃO DE VISUALIZAR (Para Todos) --- */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                    onClick={() => setProtocoloVisualizado(proto)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                  </Button>

                  {/* BOTÕES DE EDIÇÃO (Só se tiver permissão) */}
                  {podeEditarProtocolo(proto) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-600 border-slate-300 hover:bg-slate-50"
                        onClick={() =>
                          navigate(`/protocolos/editar/${proto.id}`)
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir Protocolo?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita e removerá este
                              protocolo para você{" "}
                              {proto.origem === "INSTITUCIONAL"
                                ? "e para toda a clínica"
                                : ""}
                              .
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600"
                              onClick={() => deleteMutation.mutate(proto.id!)}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl">
            <p className="text-slate-500">
              Nenhum protocolo encontrado para esta doença (com seu nível de
              acesso).
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL DE VISUALIZAÇÃO --- */}
      <Dialog
        open={!!protocoloVisualizado}
        onOpenChange={(open) => !open && setProtocoloVisualizado(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {protocoloVisualizado?.origem === "OFICIAL" && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  Oficial
                </Badge>
              )}
              {protocoloVisualizado?.origem === "INSTITUCIONAL" && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  Institucional
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl text-slate-900">
              {protocoloVisualizado?.titulo}
            </DialogTitle>
            <DialogDescription>
              Fonte/Referência:{" "}
              {protocoloVisualizado?.referenciaTexto || "Não informada"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Observações */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
              <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">
                Observações / Conduta
              </h4>
              {protocoloVisualizado?.observacoes ||
                "Sem observações cadastradas."}
            </div>

            {/* Tabela de Itens */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">
                Prescrição
              </h4>
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Fármaco</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead>Instrução</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {protocoloVisualizado?.dosagens?.map(
                      (dose: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-slate-700">
                            {dose.nomeMedicamento || dose.medicamentoTexto}
                          </TableCell>
                          <TableCell className="text-blue-600 font-semibold whitespace-nowrap">
                            {dose.dose}
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {dose.detalhes}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProtocoloVisualizado(null)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

### ProtocoloForm.tsx

```typescript
// pages\protocolos\ProtocoloForm.tsx
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { protocolsService, diseasesService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pill,
  Stethoscope,
  Wand2,
  Users,
  Lock,
} from "lucide-react";

// REMOVIDO IMPORT DE ENUM QUEBRADO
// import { OrigemProtocoloEnum } from "@/api";

// --- SCHEMA HÍBRIDO ---
const dosagemSchema = z.object({
  medicamentoId: z.string().optional(),
  medicamentoTexto: z.string().min(1, "Nome do fármaco obrigatório"),
  doseMinima: z.coerce.number().optional(),
  unidade: z.string().optional(),
  frequencia: z.string().optional(),
  duracao: z.string().optional(),
  via: z.string().optional(),
});

const formSchema = z.object({
  titulo: z.string().min(3, "Dê um nome para este tratamento"),
  doencaId: z.string().optional(),
  doencaTexto: z.string().min(1, "Informe a doença ou condição"),
  referenciaTexto: z.string().optional(),
  observacoes: z.string().optional(),
  // NOVO: Tipo de Compartilhamento
  tipoCompartilhamento: z.enum(["PROPRIO", "INSTITUCIONAL"]),
  dosagens: z.array(dosagemSchema).min(1, "Adicione pelo menos 1 item"),
});

type FormValues = z.infer<typeof formSchema>;

export function ProtocoloForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthUser();

  const prefillData = location.state as {
    titulo?: string;
    conduta?: string;
    origem?: string;
  } | null;

  // Permissão para criar Institucional
  const podeCriarInstitucional =
    user?.role === "ADMIN_CLINICO" || user?.role === "ADMIN_GLOBAL";

  const { data: doencas } = useQuery({
    queryKey: ["doencas-list"],
    queryFn: async () => {
      try {
        const res = await diseasesService.listarDoencas();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  const medicamentosSugestoes = [
    { id: "20000000-0000-0000-0000-000000000001", nome: "Doxfin Suspensão" },
    { id: "20000000-0000-0000-0000-000000000003", nome: "Baytril 10%" },
    { id: "20000000-0000-0000-0000-000000000005", nome: "Maxicam 0.2%" },
  ];

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      titulo: prefillData?.titulo || "",
      doencaTexto: "",
      referenciaTexto: "Protocolo Próprio",
      observacoes: prefillData?.conduta
        ? `Conduta Original:\n${prefillData.conduta}`
        : "",
      tipoCompartilhamento: "PROPRIO", // Padrão
      dosagens: [
        {
          medicamentoTexto: "",
          doseMinima: 0,
          unidade: "mg/kg",
          frequencia: "",
          duracao: "",
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
      if (!user?.id) throw new Error("Sessão inválida");

      const doencaExistente = doencas?.find(
        (d) => d.nome?.toLowerCase() === values.doencaTexto.toLowerCase(),
      );

      await protocolsService.criarProtocolo({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doencaId: (doencaExistente?.id || undefined) as any,
        doencaTexto: values.doencaTexto,
        titulo: values.titulo,
        referenciaTexto: values.referenciaTexto || "Próprio",
        observacoes: values.observacoes,

        // CORREÇÃO 2: Passando string direta como any para evitar erro de importação do Enum
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        origem: values.tipoCompartilhamento as any,

        // CORREÇÃO 1: Cast para any no clinicaId para o TS aceitar a string ou undefined
        clinicaId:
          values.tipoCompartilhamento === "INSTITUCIONAL"
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (user.clinicaId as any)
            : undefined,

        autorId: user.id,

        dosagens: values.dosagens.map((d) => {
          const medExistente = medicamentosSugestoes.find(
            (m) => m.nome.toLowerCase() === d.medicamentoTexto.toLowerCase(),
          );
          return {
            ...d,
            medicamentoId: medExistente?.id,
            medicamentoTexto: d.medicamentoTexto,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
      });
    },
    onSuccess: () => {
      toast.success("Protocolo salvo na sua biblioteca!");
      navigate("/protocolos");
    },
    onError: () => toast.error("Erro ao salvar protocolo."),
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="pl-0 text-slate-500 hover:bg-transparent hover:text-slate-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </Button>
        {prefillData && (
          <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
            <Wand2 className="h-3 w-3" /> Criando a partir de atendimento
          </span>
        )}
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-slate-900 text-white rounded-t-lg pb-8 pt-8 px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Stethoscope className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Novo Protocolo Terapêutico
              </CardTitle>
              <CardDescription className="text-slate-300 border-none">
                Crie um modelo de tratamento para reutilizar em futuros
                atendimentos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-8"
            >
              {/* SEÇÃO 1: CONTEXTO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Nome do Protocolo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Tratamento Suporte - Calopsita"
                          {...field}
                          className="h-11 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DOENÇA */}
                <FormField
                  control={form.control}
                  name="doencaTexto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Doença ou Condição
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            list="doencas-list"
                            placeholder="Digite ou selecione..."
                            className="h-11"
                            {...field}
                          />
                          <datalist id="doencas-list">
                            {doencas?.map((d) => (
                              <option key={d.id} value={d.nome} />
                            ))}
                          </datalist>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SELETOR DE VISIBILIDADE (INSTITUCIONAL vs PROPRIO) */}
              {podeCriarInstitucional && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <FormField
                    control={form.control}
                    name="tipoCompartilhamento"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Visibilidade do Protocolo
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Opção Privada */}
                            <label
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                field.value === "PROPRIO"
                                  ? "bg-white border-slate-400 shadow-sm ring-1 ring-slate-400"
                                  : "bg-transparent border-slate-200 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                {...field}
                                value="PROPRIO"
                                checked={field.value === "PROPRIO"}
                                className="sr-only"
                              />
                              <Lock
                                className={`h-5 w-5 ${
                                  field.value === "PROPRIO"
                                    ? "text-slate-700"
                                    : "text-slate-400"
                                }`}
                              />
                              <div>
                                <span className="block text-sm font-bold text-slate-800">
                                  Pessoal (Privado)
                                </span>
                                <span className="block text-xs text-slate-500">
                                  Visível apenas para você.
                                </span>
                              </div>
                            </label>

                            {/* Opção Institucional */}
                            <label
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                field.value === "INSTITUCIONAL"
                                  ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
                                  : "bg-transparent border-slate-200 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                {...field}
                                value="INSTITUCIONAL"
                                checked={field.value === "INSTITUCIONAL"}
                                className="sr-only"
                              />
                              <Users
                                className={`h-5 w-5 ${
                                  field.value === "INSTITUCIONAL"
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              />
                              <div>
                                <span className="block text-sm font-bold text-slate-800">
                                  Institucional (Compartilhado)
                                </span>
                                <span className="block text-xs text-slate-500">
                                  Toda a equipe da clínica poderá usar.
                                </span>
                              </div>
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">
                      Conduta Padrão / Notas
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o procedimento, recomendações ao tutor, etc..."
                        {...field}
                        className="min-h-[120px] font-medium text-slate-600 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SEÇÃO 2: MEDICAMENTOS (MANTIDA) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" /> Prescrição
                    (Itens)
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      append({
                        medicamentoTexto: "",
                        doseMinima: 0,
                        unidade: "mg/kg",
                        frequencia: "",
                        duracao: "",
                        via: "Oral",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Medicamento
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative group hover:border-blue-300 transition-colors"
                  >
                    <div className="md:col-span-4">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.medicamentoTexto`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Fármaco
                            </FormLabel>
                            <FormControl>
                              <div>
                                <Input
                                  list="meds-list"
                                  placeholder="Nome do remédio"
                                  {...field}
                                  className="h-10"
                                />
                                <datalist id="meds-list">
                                  {medicamentosSugestoes.map((m) => (
                                    <option key={m.id} value={m.nome} />
                                  ))}
                                </datalist>
                              </div>
                            </FormControl>
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
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Dose
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                className="h-10"
                                placeholder="0"
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
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Unidade
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="mg/kg"
                              />
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
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Frequência
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="Ex: BID (12/12h)"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="md:col-span-6">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.via`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Via de Administração
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="Ex: Oral"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-6">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.duracao`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Duração
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="Ex: 7 dias"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 text-base shadow-lg transition-all hover:-translate-y-0.5"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Salvando..." : "Salvar Protocolo"}
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

