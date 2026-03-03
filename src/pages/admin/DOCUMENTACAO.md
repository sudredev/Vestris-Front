## pages\admin

### AdminClinicas.tsx

```typescript
// pages\admin\AdminClinicas.tsx
import { useMutation } from "@tanstack/react-query";
import { publicService } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Save, Loader2 } from "lucide-react";

// IDs dos Planos (Fixos do Data.sql)
const PLANOS = [
  { id: "90000000-0000-0000-0000-000000000001", nome: "Autônomo" },
  { id: "90000000-0000-0000-0000-000000000002", nome: "Clínica Pequena" },
  { id: "90000000-0000-0000-0000-000000000003", nome: "Clínica Média" },
  { id: "90000000-0000-0000-0000-000000000004", nome: "Enterprise (Hospital)" },
];

const schema = z.object({
  nomeClinica: z.string().min(3, "Nome da clínica obrigatório"),
  planoId: z.string().min(1, "Selecione um plano"),
  // Dados do Admin da Clínica
  nomeAdmin: z.string().min(3, "Nome do responsável"),
  emailAdmin: z.string().email("Email inválido"),
  crmvAdmin: z.string().min(3, "CRMV obrigatório"),
  senhaAdmin: z.string().min(6, "Senha provisória (min 6 chars)"),
});

type FormValues = z.infer<typeof schema>;

export function AdminClinicas() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeClinica: "",
      planoId: "",
      nomeAdmin: "",
      emailAdmin: "",
      crmvAdmin: "",
      senhaAdmin: "mudar123", // Senha padrão sugerida
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Usa o serviço público de cadastro (reaproveitando a lógica de "combo")
      await publicService.cadastrarClienteSaas({
        nomeClinica: values.nomeClinica,
        planoId: values.planoId,
        nomeUsuario: values.nomeAdmin,
        email: values.emailAdmin,
        crmv: values.crmvAdmin,
        senha: values.senhaAdmin,
      });
    },
    onSuccess: () => {
      toast.success("Clínica e Admin criados com sucesso!");
      form.reset();
    },
    onError: () =>
      toast.error("Erro ao criar clínica. Verifique se o e-mail já existe."),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Gestão de Clínicas (SaaS)
        </h1>
        <p className="text-slate-500">
          Cadastre novas clínicas manualmente (Contratos Enterprise / Offline).
        </p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" /> Nova Clínica
          </CardTitle>
          <CardDescription>
            Isso criará a estrutura da clínica, a assinatura e o usuário
            administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DADOS DA EMPRESA */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase">
                    Dados da Empresa
                  </h3>
                  <FormField
                    control={form.control}
                    name="nomeClinica"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Fantasia</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="planoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano Contratado</FormLabel>
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
                            {PLANOS.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
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

                {/* DADOS DO ADMIN */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase">
                    Admin Responsável
                  </h3>
                  <FormField
                    control={form.control}
                    name="nomeAdmin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emailAdmin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail de Acesso</FormLabel>
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
                      name="crmvAdmin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRMV</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="senhaAdmin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Provisória</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Criar Clínica & Usuário
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

### AdminConteudo.tsx

```typescript
// pages\admin\AdminConteudo.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PawPrint,
  Activity,
  Pill,
  Syringe,
  PlusCircle,
  Database,
  ArrowRight,
  Thermometer,
  ShieldAlert, // Ícone para Vacinas
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdminCard = ({ title, desc, icon: Icon, colorClass, action }: any) => (
  <Card
    className="hover:shadow-lg transition-all border-l-4 group"
    style={{ borderLeftColor: colorClass }}
  >
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div
          className={`p-3 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors`}
        >
          <Icon className="h-6 w-6" style={{ color: colorClass }} />
        </div>
        <Button size="icon" variant="ghost" onClick={action}>
          <PlusCircle className="h-5 w-5 text-slate-400 hover:text-primary" />
        </Button>
      </div>
      <CardTitle className="text-lg mt-4">{title}</CardTitle>
      <CardDescription className="text-xs">{desc}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button
        variant="outline"
        className="w-full justify-between text-xs"
        onClick={action}
      >
        Cadastrar Novo <ArrowRight className="h-3 w-3" />
      </Button>
    </CardContent>
  </Card>
);

export function AdminConteudo() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <Database className="h-8 w-8 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Central de Cadastros
          </h1>
          <p className="text-slate-500">
            Gerencie a base de conhecimento oficial do Vestris.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard
          title="Espécies"
          desc="Aves, Répteis e Mamíferos. Parâmetros e manejo."
          icon={PawPrint}
          colorClass="#10b981"
          action={() => navigate("/admin/especies/novo")}
        />

        <AdminCard
          title="Doenças"
          desc="Patologias comuns e sintomas."
          icon={Activity}
          colorClass="#ef4444"
          action={() => navigate("/admin/doencas/novo")}
        />

        <AdminCard
          title="Medicamentos"
          desc="Farmacologia e concentrações."
          icon={Pill}
          colorClass="#3b82f6"
          action={() => navigate("/admin/medicamentos/novo")}
        />

        {/* NOVO CARD VACINAS */}
        <AdminCard
          title="Vacinas Oficiais"
          desc="Imunobiológicos para cadastro em prontuário."
          icon={Syringe}
          colorClass="#f59e0b" // Amber
          action={() => navigate("/admin/vacinas/novo")}
        />

        <AdminCard
          title="Protocolos Oficiais"
          desc="Tratamentos padrão ouro."
          icon={Thermometer}
          colorClass="#8b5cf6"
          action={() => navigate("/admin/protocolos/novo")}
        />

        <AdminCard
          title="Segurança Clínica"
          desc="Cadastrar contraindicações (Princípio x Espécie)."
          icon={ShieldAlert}
          colorClass="#dc2626" // Red 600
          action={() => navigate("/admin/seguranca/novo")}
        />
      </div>
    </div>
  );
}

```

### AdminProtocolos.tsx

```typescript
// pages\admin\AdminProtocolos.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  speciesService,
  diseasesService,
  protocolsService,
} from "@/lib/api-client";
import { useNavigate } from "react-router-dom";

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
  Search,
  Edit,
  Trash2,
  Filter,
  ArrowRight,
  Loader2,
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

export function AdminProtocolos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filtros
  const [especieId, setEspecieId] = useState("");
  const [doencaId, setDoencaId] = useState("");

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

  // 3. Busca Protocolos (Depende da Doença)
  const { data: protocolos, isLoading: loadingProtos } = useQuery({
    queryKey: ["admin-protocolos", doencaId],
    queryFn: async () => {
      if (!doencaId) return [];
      return (
        (await protocolsService.listarProtocolosPorDoenca(doencaId)).data
          .dados || []
      );
    },
    enabled: !!doencaId,
  });

  // Mutação de Exclusão
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await protocolsService.deletarProtocolo(id);
    },
    onSuccess: () => {
      toast.success("Protocolo removido.");
      queryClient.invalidateQueries({ queryKey: ["admin-protocolos"] });
    },
    onError: () => toast.error("Erro ao excluir."),
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Syringe className="h-6 w-6 text-violet-600" /> Gestão de Protocolos
          </h1>
          <p className="text-slate-500 text-sm">
            Gerencie os tratamentos oficiais do sistema.
          </p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => navigate("/admin/protocolos/novo")}
        >
          <Plus className="h-4 w-4 mr-2" /> Novo Protocolo Oficial
        </Button>
      </div>

      {/* FILTROS EM CASCATA */}
      <Card className="bg-slate-50 border-slate-200">
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
                {especies?.map((e) => (
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
                {doencas?.map((d) => (
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
          <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-xl">
            <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>Selecione os filtros acima para visualizar os protocolos.</p>
          </div>
        ) : loadingProtos ? (
          <div className="text-center py-10">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" />
          </div>
        ) : protocolos && protocolos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {protocolos.map((proto) => (
              <div
                key={proto.id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-violet-300 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-800">
                      {proto.titulo}
                    </h3>
                    {proto.origem === "OFICIAL" ? (
                      <Badge
                        variant="secondary"
                        className="bg-violet-50 text-violet-700"
                      >
                        Oficial
                      </Badge>
                    ) : (
                      <Badge variant="outline">Privado</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                    {proto.observacoes || "Sem observações"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Ref: {proto.referenciaTexto || "---"}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/admin/protocolos/editar/${proto.id}`)
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
                        <AlertDialogTitle>Excluir Protocolo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso removerá o protocolo oficial da base.
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl">
            <p className="text-slate-500">
              Nenhum protocolo cadastrado para esta doença.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

```

### AuditLogs.tsx

```typescript
// pages\admin\AuditLogs.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditoria } from "@/api/auditoria";
import { clinicaService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  RefreshCw,
  Loader2,
  FileText,
  AlertTriangle,
  User as UserIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AuditLogs() {
  const user = getAuthUser();
  const token = localStorage.getItem("vestris_token");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");

  // 1. BUSCA LOGS
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["auditoria-logs", user?.clinicaId, dataInicio, dataFim],
    queryFn: async () => {
      if (!user?.clinicaId || !token) return { sucesso: false, dados: [] };
      return fetchAuditoria(
        {
          clinicaId: user.clinicaId,
          // Envia a string da data direto (yyyy-mm-dd)
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        },
        token,
      );
    },
    enabled: !!user?.clinicaId && !!token,
    refetchInterval: 15000,
  });

  // 2. BUSCA NOMES DA EQUIPE (Para traduzir IDs)
  const { data: equipe } = useQuery({
    queryKey: ["equipe-nomes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const res = await clinicaService.listarEquipe(user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (res.data.dados || []) as any[];
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Mapa ID -> Nome
  const mapaUsuarios = useMemo(() => {
    const map: Record<string, string> = {};
    if (equipe) {
      equipe.forEach((u) => {
        if (u.id) map[u.id] = u.nome || u.email;
      });
    }
    return map;
  }, [equipe]);

  const logs = data?.dados || [];

  const logsFiltrados = logs.filter((log) => {
    const termo = filtroTexto.toLowerCase();
    const nomeUsuario = mapaUsuarios[log.usuarioId] || "";

    return (
      log.acao.toLowerCase().includes(termo) ||
      log.entidade.toLowerCase().includes(termo) ||
      (log.detalhes || "").toLowerCase().includes(termo) ||
      nomeUsuario.toLowerCase().includes(termo)
    );
  });

  // 3. CORREÇÃO DE HORA (Hack para ignorar deslocamento indesejado do Browser)
  const formatarData = (isoString: string) => {
    if (!isoString) return "-";
    try {
      // Se a string vier como '2026-02-17T15:42:05Z' (UTC)
      // e quisermos mostrar EXATAMENTE 15:42:05 (assumindo que o back guardou hora local)
      // removemos o 'Z' para o navegador tratar como Local Time.
      const localIso = isoString.replace("Z", "");
      return format(new Date(localIso), "dd/MM/yyyy HH:mm:ss");
    } catch {
      return isoString;
    }
  };

  const getBadgeVariant = (acao: string) => {
    if (acao.includes("CRIADO") || acao.includes("ADICIONADO"))
      return "default";
    if (acao.includes("EDITADO") || acao.includes("ATUALIZADO"))
      return "secondary";
    if (acao.includes("CANCELADO") || acao.includes("REMOVIDO"))
      return "destructive";
    return "outline";
  };

  if (!user?.clinicaId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">
          Acesso Institucional Necessário
        </h2>
        <p className="text-slate-600 mt-2 max-w-md">
          Seu login expirou ou você não tem clínica vinculada.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-purple-600" />
            Auditoria & Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Rastreabilidade completa de ações na clínica.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Atualizar Lista
        </Button>
      </div>

      <Card className="p-4 border-slate-200 bg-white shadow-sm">
        {/* BARRA DE FILTROS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase ml-1">
              De:
            </span>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-40 bg-slate-50"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase ml-1">
              Até:
            </span>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-40 bg-slate-50"
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase ml-1">
              Buscar:
            </span>
            <Input
              placeholder="Filtrar por nome do usuário, ação ou detalhes..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-slate-50"
            />
          </div>
          {(dataInicio || dataFim || filtroTexto) && (
            <Button
              variant="ghost"
              onClick={() => {
                setDataInicio("");
                setDataFim("");
                setFiltroTexto("");
              }}
            >
              <X className="h-4 w-4 mr-2" /> Limpar
            </Button>
          )}
        </div>

        <div className="rounded-md border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[180px]">Data/Hora</TableHead>
                <TableHead className="min-w-[200px]">
                  Usuário Responsável
                </TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead className="w-[50%]">Detalhes da Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-300 mb-2" />
                    <span className="text-slate-400">
                      Carregando registros...
                    </span>
                  </TableCell>
                </TableRow>
              ) : logsFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-16 text-slate-400"
                  >
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>Nenhum registro encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logsFiltrados.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* DATA CORRIGIDA */}
                    <TableCell className="font-mono text-xs text-slate-600 whitespace-nowrap">
                      {formatarData(log.criadoEm)}
                    </TableCell>

                    {/* NOME DO USUÁRIO */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-xs text-slate-500">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">
                            {(
                              mapaUsuarios[log.usuarioId] || "Usuário Removido"
                            ).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getBadgeVariant(log.acao)}
                        className="text-[10px] px-2 py-0.5 whitespace-nowrap font-bold"
                      >
                        {log.acao.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-wide">
                        {log.entidade}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-slate-600">
                      {log.detalhes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

```

### SuperAdminDashboard.tsx

```typescript
// pages\admin\SuperAdminDashboard.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, Search, LogOut, Loader2, Ban } from "lucide-react";
import { usersService, adminService } from "@/lib/api-client";

export function SuperAdminDashboard() {
  const user = getAuthUser();
  const [busca, setBusca] = useState("");

  // 1. BUSCA REAL DE USUÁRIOS
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Se o usuário não for global, nem tenta buscar para não dar 403 na API
      if (user?.scope !== "GLOBAL") return [];

      try {
        const res = await usersService.listarUsuarios(undefined, undefined);
        return res.data.dados || [];
      } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return [];
      }
    },
    // Só roda a query se for GLOBAL
    enabled: user?.scope === "GLOBAL",
  });

  // 2. IMPERSONATE (VER COMO)
  const impersonateMutation = useMutation({
    mutationFn: async (targetId: string) => {
      if (!user?.id) throw new Error("Admin não logado");

      const res = await adminService.impersonateUser(user.id, targetId);

      if (!res.data.dados?.token) throw new Error("Token não gerado");
      return res.data.dados.token;
    },
    onSuccess: (novoToken) => {
      // 1. Guarda o token atual (Seu crachá de Admin) no bolso
      const adminToken = localStorage.getItem("vestris_token");
      if (adminToken) {
        localStorage.setItem("vestris_admin_token", adminToken);
      }

      // 2. Coloca o crachá do cliente
      localStorage.setItem("vestris_token", novoToken);

      toast.success("Acesso concedido!", {
        description: "Redirecionando para a visão do usuário...",
      });

      // 3. Entra no sistema
      setTimeout(() => (window.location.href = "/area-vet"), 1000);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("ERRO DETALHADO:", error); // Vai aparecer no F12 -> Console
      console.log("Status:", error?.response?.status);
      console.log("URL tentada:", error?.config?.url);

      toast.error(`Erro: ${error.message}`);
    },
  });

  const filtrados =
    usuarios?.filter(
      (u) =>
        (u.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(busca.toLowerCase()),
    ) || [];

  // --- VERIFICAÇÃO DE SEGURANÇA CORRIGIDA ---
  // Agora validamos pelo SCOPE, que é o que define o Super Admin
  if (user?.scope !== "GLOBAL") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50 p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Ban className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Acesso Negado
          </h1>
          <p className="text-slate-600 mb-6">
            Esta área é restrita à administração global do Vestris. Seu perfil
            atual ({user?.role}) não tem permissão.
          </p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/area-vet")}
          >
            Voltar para Clínica
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Painel Super Admin 👑
          </h1>
          <p className="text-slate-500">Gestão Global de Usuários e Clínicas</p>
        </div>

        <Button
          variant="destructive"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-slate-400"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando base de usuários...
                  </TableCell>
                </TableRow>
              ) : filtrados.length > 0 ? (
                filtrados.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.perfil === "ADMIN" ? "default" : "secondary"}
                      >
                        {u.perfil}
                      </Badge>
                      {u.scope === "GLOBAL" && (
                        <Badge className="ml-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                          Global
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50 gap-2"
                          onClick={() => impersonateMutation.mutate(u.id!)}
                          disabled={impersonateMutation.isPending}
                        >
                          <Eye className="h-4 w-4" /> Ver Como
                        </Button>
                      )}
                      {u.id === user.id && (
                        <span className="text-xs text-slate-300 italic pr-2">
                          Você
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-slate-400"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

```

