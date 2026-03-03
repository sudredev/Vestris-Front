## pages\atendimentos

### AgendaAtendimentos.tsx

```typescript
// pages\atendimentos\AgendaAtendimentos.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordsService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  CalendarDays,
  Play,
  FileText,
  Ban,
  Plus,
  Search,
  X,
  Filter,
  History,
  Stethoscope, // <--- Ícone para o Vet
  PawPrint, // <--- Ícone para o Paciente
} from "lucide-react";
import { toast } from "sonner";

export function AgendaAtendimentos() {
  const user = getAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dataFiltro, setDataFiltro] = useState<string>("");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("TODOS");

  // Busca da API
  const { data: agenda, isLoading } = useQuery({
    queryKey: ["agenda-hub", user?.id, dataFiltro],
    queryFn: async () => {
      if (!user?.id) return [];

      const dataQuery = dataFiltro || undefined;

      const res = await recordsService.listarMeusAtendimentos(
        user.id,
        undefined,
        undefined,
        dataQuery,
        dataQuery,
      );
      return res.data.dados || [];
    },
    enabled: !!user?.id,
  });

  // Mutações
  const iniciarMutation = useMutation({
    mutationFn: async (id: string) => {
      await recordsService.atualizarStatusAtendimento(id, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: "EM_ANDAMENTO" as any,
      });
    },
    onSuccess: (_, id) => {
      toast.success("Atendimento iniciado!");
      navigate(`/atendimentos/${id}`);
    },
    onError: () => toast.error("Erro ao iniciar."),
  });

  const cancelarMutation = useMutation({
    mutationFn: async (id: string) => {
      await recordsService.atualizarStatusAtendimento(id, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: "CANCELADO" as any,
      });
    },
    onSuccess: () => {
      toast.success("Atendimento cancelado.");
      queryClient.invalidateQueries({ queryKey: ["agenda-hub"] });
    },
    onError: () => toast.error("Erro ao cancelar."),
  });

  // --- LÓGICA DE FILTRAGEM ---
  const itensFiltrados = agenda?.filter((item) => {
    if (abaAtiva === "HISTORICO") {
      if (item.status !== "REALIZADO" && item.status !== "CANCELADO")
        return false;
    } else if (abaAtiva !== "TODOS" && item.status !== abaAtiva) {
      return false;
    }

    if (buscaTexto) {
      const termo = buscaTexto.toLowerCase();
      const matchNome = (item.pacienteNome || "").toLowerCase().includes(termo);
      const matchTitulo = (item.titulo || "").toLowerCase().includes(termo);
      const matchEspecie = (item.pacienteEspecie || "")
        .toLowerCase()
        .includes(termo);
      const matchVet = (item.veterinarioNome || "")
        .toLowerCase()
        .includes(termo); // Agora busca pelo Vet também

      if (!matchNome && !matchTitulo && !matchEspecie && !matchVet)
        return false;
    }

    return true;
  });

  const limparFiltros = () => {
    setDataFiltro("");
    setBuscaTexto("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AGENDADO":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap"
          >
            Agendado
          </Badge>
        );
      case "EM_ANDAMENTO":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse whitespace-nowrap"
          >
            Em Andamento
          </Badge>
        );
      case "REALIZADO":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap"
          >
            Realizado
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap"
          >
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Cores da borda esquerda
  const getCardBorderClass = (status: string) => {
    switch (status) {
      case "AGENDADO":
        return "border-l-yellow-400 hover:border-l-yellow-500";
      case "EM_ANDAMENTO":
        return "border-l-blue-500 hover:border-l-blue-600";
      case "REALIZADO":
        return "border-l-green-500 hover:border-l-green-600";
      case "CANCELADO":
        return "border-l-red-300 bg-red-50/10 hover:border-l-red-400";
      default:
        return "border-l-slate-200";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Gestão de Atendimentos
          </h1>
          <p className="text-slate-500 mt-1">
            Consulte, filtre e gerencie toda a sua rotina clínica.
          </p>
        </div>

        <Button
          size="lg"
          className="shadow-md bg-slate-900 hover:bg-slate-800 rounded-lg px-6 h-12 text-base font-medium transition-all hover:-translate-y-0.5"
          onClick={() => navigate("/atendimentos/novo-agendamento")}
        >
          <Plus className="mr-2 h-5 w-5" /> Novo Agendamento
        </Button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Campo de Busca */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por paciente, espécie ou veterinário..."
            className="pl-10 h-11 border-slate-200 bg-white focus:bg-white transition-colors text-base"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
          />
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

        {/* Filtro de Data */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Input
              type="date"
              className="w-full md:w-48 h-11 border-slate-200 bg-white focus:bg-white text-base"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />
          </div>

          {/* Botão Limpar */}
          {(dataFiltro || buscaTexto) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={limparFiltros}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-11 w-11"
              title="Limpar filtros"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <Tabs defaultValue="TODOS" className="w-full" onValueChange={setAbaAtiva}>
        <TabsList className="grid w-full grid-cols-4 md:max-w-[600px] mb-6 bg-slate-100 p-1 h-12">
          <TabsTrigger value="TODOS" className="h-10">
            Todos
          </TabsTrigger>
          <TabsTrigger value="AGENDADO" className="h-10">
            Agendados
          </TabsTrigger>
          <TabsTrigger value="EM_ANDAMENTO" className="h-10">
            Em Andamento
          </TabsTrigger>
          <TabsTrigger value="HISTORICO" className="h-10">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value={abaAtiva} className="mt-0 space-y-3">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <Filter className="h-10 w-10 mb-3 animate-pulse opacity-30" />
              <p>Buscando atendimentos...</p>
            </div>
          ) : itensFiltrados && itensFiltrados.length > 0 ? (
            itensFiltrados.map((item) => (
              <Card
                key={item.id}
                className={`hover:shadow-md transition-all group border-l-4 ${getCardBorderClass(
                  item.status || "",
                )}`}
              >
                <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Bloco Esquerdo: Data e Info */}
                  <div className="flex items-center gap-6 w-full">
                    {/* Box da Data */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] bg-slate-50 border border-slate-100 rounded-lg p-3 h-full self-stretch">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">
                        {item.dataHora
                          ? format(new Date(item.dataHora), "MMM", {
                              locale: ptBR,
                            })
                          : "-"}
                      </span>
                      <span className="text-3xl font-bold text-slate-700 leading-none my-1">
                        {item.dataHora
                          ? format(new Date(item.dataHora), "dd")
                          : "--"}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.dataHora
                          ? format(new Date(item.dataHora), "HH:mm")
                          : "--:--"}
                      </span>
                    </div>

                    {/* Detalhes Principais */}
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-bold text-xl text-slate-800 group-hover:text-primary transition-colors">
                          {item.titulo}
                        </h3>
                        {getStatusBadge(item.status || "")}
                      </div>

                      {/* Info Paciente */}
                      <div className="text-sm text-slate-500 flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <PawPrint className="h-3.5 w-3.5" />
                          {item.pacienteNome}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="capitalize">
                          {item.pacienteEspecie}
                        </span>
                      </div>

                      {/* INFO VETERINÁRIO (NOVO) */}
                      <div className="flex items-center">
                        <Badge
                          variant="secondary"
                          className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 gap-1.5 font-medium"
                        >
                          <Stethoscope className="h-3 w-3" />
                          {item.veterinarioNome || "Vet não informado"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Bloco Direito: Ações */}
                  <div className="flex gap-2 w-full md:w-auto justify-end shrink-0">
                    {/* AÇÕES PARA AGENDADO */}
                    {item.status === "AGENDADO" && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancelar este agendamento?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                O atendimento será movido para o histórico como
                                "Cancelado".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Voltar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() =>
                                  cancelarMutation.mutate(item.id!)
                                }
                              >
                                Confirmar Cancelamento
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          size="sm"
                          onClick={() => iniciarMutation.mutate(item.id!)}
                          disabled={iniciarMutation.isPending}
                          className="px-6"
                        >
                          <Play className="h-4 w-4 mr-2" /> Iniciar
                        </Button>
                      </>
                    )}

                    {/* AÇÕES PARA EM ANDAMENTO */}
                    {item.status === "EM_ANDAMENTO" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 shadow-sm px-6"
                        onClick={() => navigate(`/atendimentos/${item.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" /> Continuar
                      </Button>
                    )}

                    {/* AÇÕES PARA HISTÓRICO (APENAS REALIZADO) */}
                    {item.status === "REALIZADO" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/atendimentos/${item.id}`)}
                        className="px-6"
                      >
                        <History className="h-4 w-4 mr-2 text-slate-500" /> Ver
                        Prontuário
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            /* Estado Vazio */
            <div className="text-center py-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-lg">
                Nenhum atendimento encontrado.
              </p>
              <p className="text-sm text-slate-400">
                Tente ajustar os filtros ou limpar a busca.
              </p>

              {(dataFiltro || buscaTexto) && (
                <Button
                  variant="link"
                  onClick={limparFiltros}
                  className="mt-4 text-primary"
                >
                  Limpar todos os filtros
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

### CockpitAtendimento.tsx

```typescript
// pages\atendimentos\CockpitAtendimento.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Calculator,
  Printer,
  FileOutput,
  Leaf,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";

import {
  recordsService,
  patientsService,
  clinicaService,
} from "@/lib/api-client";
// Import da API de Auditoria
import { registrarEventoAuditoria } from "@/api/auditoria";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ProntuarioEditor } from "./components/ProntuarioEditor";
import { FerramentasSidebar } from "./components/FerramentasSidebar";
import { ReceitaModal } from "./components/ReceitaModal";
import { ReceitaManejoModal } from "./components/ReceitaManejoModal";
import { AbaExames } from "./components/AbaExames";
import { gerarPDFProntuario } from "@/lib/pdf-service";

import type { FinalizacaoAtendimentoRequest } from "@/api";

const atendimentoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  queixaPrincipal: z.string().min(1, "Queixa é obrigatória"),
  historicoClinico: z.string().optional(),
  exameFisico: z.string().optional(),
  diagnostico: z.string().optional(),
  condutaClinica: z.string().min(1, "Conduta é obrigatória para finalizar"),
  observacoes: z.string().optional(),
});

export type AtendimentoFormValues = z.infer<typeof atendimentoSchema>;

export function CockpitAtendimento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getAuthUser();

  const [activeTab, setActiveTab] = useState("prontuario");
  const [activeField, setActiveField] =
    useState<keyof AtendimentoFormValues>("condutaClinica");
  const [receitaOpen, setReceitaOpen] = useState(false);
  const [manejoOpen, setManejoOpen] = useState(false);

  // --- LÓGICA DE BLOQUEIO DE GOVERNANÇA ---
  const viewMode = localStorage.getItem("vestris_view_mode");
  const isBlockedGestor =
    user?.role === "ADMIN_GESTOR" ||
    (user?.role === "ADMIN_CLINICO" && viewMode !== "VETERINARIO");

  // 1. Busca Atendimento
  const {
    data: atendimento,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["atendimento", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await recordsService.buscarAtendimentoPorId(id);
      return res.data.dados;
    },
    enabled: !!id,
  });

  // 2. Busca Paciente
  const { data: paciente } = useQuery({
    queryKey: ["paciente-cockpit", atendimento?.pacienteId],
    queryFn: async () => {
      if (!atendimento?.pacienteId) return null;
      const res = await patientsService.buscarPacientePorId(
        atendimento.pacienteId,
      );
      return res.data.dados;
    },
    enabled: !!atendimento?.pacienteId,
  });

  // 3. Busca Dados da Clínica
  const { data: clinica } = useQuery({
    queryKey: ["clinica-pdf", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const res = await clinicaService.obterMinhaClinica(user.id);
        return res.data.dados;
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const form = useForm<AtendimentoFormValues>({
    resolver: zodResolver(atendimentoSchema),
    defaultValues: {
      titulo: "",
      queixaPrincipal: "",
      historicoClinico: "",
      exameFisico: "",
      diagnostico: "",
      condutaClinica: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (atendimento) {
      form.reset({
        titulo: atendimento.titulo || "",
        queixaPrincipal: atendimento.queixaPrincipal || "",
        historicoClinico: atendimento.historicoClinico || "",
        exameFisico: atendimento.exameFisico || "",
        diagnostico: atendimento.diagnostico || "",
        condutaClinica: atendimento.condutaClinica || "",
        observacoes: atendimento.observacoes || "",
      });
    }
  }, [atendimento, form]);

  const saveDraftMutation = useMutation({
    mutationFn: async (values: AtendimentoFormValues) => {
      if (!id || !atendimento) return;
      await recordsService.atualizarAtendimento(id, {
        ...values,
        pacienteId: atendimento.pacienteId,
        veterinarioId: atendimento.veterinarioId,
        protocoloId: atendimento.protocoloId,
        orientacoesManejo: (atendimento as any).orientacoesManejo,
      } as any);
    },
    onSuccess: () => {
      toast.success("Rascunho salvo.");
      refetch();
    },
    onError: () => toast.error("Erro ao salvar rascunho."),
  });

  const finalizeMutation = useMutation({
    mutationFn: async (values: AtendimentoFormValues) => {
      if (!id) return;
      const payload = values as unknown as FinalizacaoAtendimentoRequest;
      payload.protocoloId = atendimento?.protocoloId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload as any).orientacoesManejo =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (atendimento as any).orientacoesManejo;
      await recordsService.finalizarAtendimento(id, payload);
    },
    onSuccess: () => {
      toast.success("Prontuário finalizado!");
      refetch();
    },
    onError: () => toast.error("Preencha os campos obrigatórios."),
  });

  const handleSaveDraft = () => {
    const currentValues = form.getValues();
    saveDraftMutation.mutate(currentValues);
  };

  const handleInject = (
    text: string,
    targetField?: keyof AtendimentoFormValues,
  ) => {
    const fieldToUpdate = targetField || activeField || "condutaClinica";
    const currentValue = form.getValues(fieldToUpdate) || "";
    const newValue = currentValue ? `${currentValue}\n\n${text}` : text;
    form.setValue(fieldToUpdate, newValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const nomeCampo =
      fieldToUpdate === "exameFisico" ? "Exame Físico" : "Prontuário";
    toast.success(`Inserido em ${nomeCampo}!`, {
      description: "Texto adicionado com sucesso.",
      action: { label: "Ver", onClick: () => setActiveTab("prontuario") },
    });
  };

  const getDadosCabecalho = () => {
    return {
      nomeVeterinario:
        atendimento?.veterinarioNome || "Veterinário Responsável",
      crmv: atendimento?.veterinarioCrmv || "CRMV não informado",
      nomeClinica: clinica?.nomeFantasia,
      endereco: clinica?.endereco,
      contato: clinica?.telefone,
      logo: clinica?.logoBase64,
      cnpj: clinica?.cnpj,
    };
  };

  const handlePrintProntuario = () => {
    if (!atendimento || !paciente) return;
    const dadosForm = form.getValues();
    const dadosCompletos = { ...atendimento, ...dadosForm };

    // 1. Gera PDF
    gerarPDFProntuario(
      dadosCompletos,
      {
        nome: paciente.nome || "Nome não informado",
        especie: atendimento.pacienteEspecie || "Espécie n/a",
        tutor: paciente.dadosTutor || "Tutor não informado",
        sexo: paciente.sexo,
        peso: paciente.pesoAtualGramas
          ? `${paciente.pesoAtualGramas}g`
          : undefined,
        nascimento: paciente.dataNascimento,
        idAnimal: paciente.identificacaoAnimal,
        microchip: paciente.microchip,
      },
      getDadosCabecalho(),
    );

    // 2. AUDITORIA: Registra evento
    const token = localStorage.getItem("vestris_token");
    if (token) {
      registrarEventoAuditoria(
        {
          acao: "PDF_PRONTUARIO_GERADO",
          entidade: "PDF",
          idAlvo: atendimento.id!,
          descricao: `Prontuário gerado para ${paciente.nome}`,
          metadados: JSON.stringify({
            paciente: paciente.nome,
            veterinario: atendimento.veterinarioNome,
          }),
        },
        token,
      ).catch((err) => console.error("Falha ao auditar PDF", err));
    }
  };

  // --- BLOQUEIO DE ADMIN GESTOR ---
  if (isBlockedGestor) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-t-purple-600 max-w-md">
          <ShieldCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Visão Administrativa
          </h1>
          <p className="text-slate-600 mb-6">
            Este registro existe e está seguro. Por regras de governança, perfis
            administrativos não visualizam detalhes clínicos sensíveis
            (anamnese, exame, conduta) por padrão.
          </p>

          {user?.role === "ADMIN_CLINICO" && (
            <div className="bg-emerald-50 p-3 rounded border border-emerald-100 text-sm text-emerald-800">
              <strong>Dica:</strong> Use o seletor no topo para alternar para
              "Modo Veterinário" se precisar atuar clinicamente.
            </div>
          )}

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => navigate("/atendimentos")}
          >
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  if (!atendimento)
    return <div className="p-10">Atendimento não encontrado.</div>;

  const isReadOnly =
    atendimento.status === "REALIZADO" || atendimento.status === "CANCELADO";

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-white border-b px-6 py-3 mb-6 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/atendimentos")}
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  {atendimento.pacienteNome}
                </h1>
                <Badge variant={isReadOnly ? "secondary" : "default"}>
                  {atendimento.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                {atendimento.pacienteEspecie} •{" "}
                {atendimento.dataHora
                  ? format(new Date(atendimento.dataHora), "dd/MM HH:mm")
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-slate-600 border-slate-300 hover:bg-slate-50"
              onClick={handlePrintProntuario}
            >
              <Printer className="h-4 w-4" />{" "}
              <span className="hidden lg:inline">Prontuário</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
              onClick={() => setManejoOpen(true)}
            >
              <Leaf className="h-4 w-4" />{" "}
              <span className="hidden lg:inline">Manejo</span>
            </Button>

            <Button
              size="sm"
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              onClick={() => setReceitaOpen(true)}
            >
              <FileOutput className="h-4 w-4" /> <span>Receita</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex mb-6 bg-white border shadow-sm p-1 h-12 rounded-lg">
            <TabsTrigger value="prontuario" className="px-6">
              <FileText className="mr-2 h-4 w-4" /> Registro Clínico
            </TabsTrigger>
            {/* --- ABA DE EXAMES --- */}
            <TabsTrigger value="exames" className="px-6">
              <Paperclip className="mr-2 h-4 w-4" /> Exames e Anexos
            </TabsTrigger>
            <TabsTrigger
              value="ferramentas"
              disabled={isReadOnly}
              className="px-6"
            >
              <Calculator className="mr-2 h-4 w-4" /> Ferramentas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prontuario" className="mt-0">
            <ProntuarioEditor
              form={form}
              readOnly={isReadOnly}
              onFieldFocus={setActiveField}
              onSaveDraft={handleSaveDraft}
              onFinalize={form.handleSubmit((d) => finalizeMutation.mutate(d))}
              isSaving={saveDraftMutation.isPending}
              isFinalizing={finalizeMutation.isPending}
            />
          </TabsContent>

          {/* --- CONTEÚDO DA ABA DE EXAMES --- */}
          <TabsContent value="exames" className="mt-0">
            <div className="w-full mt-4 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[600px] p-6">
              <AbaExames atendimentoId={id!} readOnly={isReadOnly} />
            </div>
          </TabsContent>

          <TabsContent value="ferramentas" className="mt-0">
            <div className="w-full mt-4 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[600px]">
              <FerramentasSidebar
                onInject={handleInject}
                especieId={paciente?.especieId}
                nomeEspecie={atendimento.pacienteEspecie}
                pacienteId={atendimento.pacienteId}
                atendimentoId={atendimento.id}
              />
            </div>
          </TabsContent>
        </Tabs>

        {paciente && (
          <ReceitaModal
            open={receitaOpen}
            onOpenChange={setReceitaOpen}
            paciente={{
              nome: paciente.nome || "Paciente",
              especie: atendimento.pacienteEspecie || "",
              tutor: paciente.dadosTutor || "",
              sexo: paciente.sexo,
              peso: paciente.pesoAtualGramas
                ? `${paciente.pesoAtualGramas}g`
                : undefined,
              nascimento: paciente.dataNascimento,
              idAnimal: paciente.identificacaoAnimal,
              microchip: paciente.microchip,
            }}
            veterinario={getDadosCabecalho()}
            // Passamos o IDs para auditoria (mesmo que opcional no tipo do PDF, usamos no modal)
            atendimentoId={atendimento.id}
            pacienteId={paciente.id}
          />
        )}

        {paciente && (
          <ReceitaManejoModal
            open={manejoOpen}
            onOpenChange={setManejoOpen}
            paciente={{
              nome: paciente.nome || "Paciente",
              especie: atendimento.pacienteEspecie || "",
              tutor: paciente.dadosTutor || "",
              especieId: paciente.especieId,
              sexo: paciente.sexo,
              peso: paciente.pesoAtualGramas
                ? `${paciente.pesoAtualGramas}g`
                : undefined,
              nascimento: paciente.dataNascimento,
              idAnimal: paciente.identificacaoAnimal,
              microchip: paciente.microchip,
            }}
            veterinario={getDadosCabecalho()}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dadosSalvos={(atendimento as any).orientacoesManejo}
            onSave={(jsonTexto) => {
              recordsService
                .atualizarAtendimento(id!, {
                  ...atendimento,
                  ...form.getValues(),
                  orientacoesManejo: jsonTexto,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)
                .then(() => {
                  refetch();
                });
            }}
            // Passamos IDs para auditoria
            atendimentoId={atendimento.id}
            pacienteId={paciente.id}
          />
        )}
      </main>
    </div>
  );
}

```

### NovoAgendamento.tsx

```typescript
// pages\atendimentos\NovoAgendamento.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
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
import { CalendarPlus, Loader2, ArrowLeft } from "lucide-react";
import type { AgendamentoRequest } from "@/api";

const schema = z.object({
  pacienteId: z.string().min(1, "Selecione o paciente"),
  titulo: z.string().min(3, "Informe um título (ex: Consulta)"),
  dataHora: z.string().min(1, "Data e hora são obrigatórias"),
});

type FormValues = z.infer<typeof schema>;

export function NovoAgendamento() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const { data: pacientes } = useQuery({
    queryKey: ["pacientes-select"],
    queryFn: async () => {
      return (
        (await patientsService.listarPacientes(user?.id || "")).data.dados || []
      );
    },
    enabled: !!user?.id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pacienteId: "",
      titulo: "",
      dataHora: "", // Deixa vazio para forçar escolha ou use new Date().toISOString().slice(0, 16)
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user?.id) throw new Error("Erro de sessão");

      const payload = {
        veterinarioId: user.id,
        pacienteId: values.pacienteId,
        titulo: values.titulo,
        dataHora: new Date(values.dataHora).toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any as AgendamentoRequest;

      await recordsService.agendarAtendimento(payload);
    },
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      navigate("/atendimentos");
    },
    onError: () => toast.error("Erro ao agendar."),
  });

  return (
    // CORREÇÃO: Aumentado para max-w-2xl
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:pl-2 transition-all gap-2 text-slate-500"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-8 pt-8 px-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 shadow-sm">
              <CalendarPlus className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-800">
                Novo Agendamento
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Preencha os dados abaixo para reservar um horário na agenda.
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
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="pacienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700">
                        Paciente
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base bg-white">
                            <SelectValue placeholder="Selecione o paciente..." />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Motivo / Título
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Consulta de Rotina"
                            {...field}
                            className="h-12 text-base"
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
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Data e Hora
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            className="h-12 text-base block"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-12 px-6 text-base"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Confirmar Agendamento
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

