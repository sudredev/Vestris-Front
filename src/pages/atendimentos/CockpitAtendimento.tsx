/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Check,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";

import {
  recordsService,
  patientsService,
  clinicaService,
  patientVaccinationService,
} from "@/lib/api-client";
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

// --- 1. SCHEMA RELAXADO ---
// Removemos os .min(1) dos campos que podem sumir dependendo do tipo.
// A validação real será feita na função de submit.
const atendimentoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  queixaPrincipal: z.string().optional(),
  historicoClinico: z.string().optional(),
  exameFisico: z.string().optional(),
  diagnostico: z.string().optional(),
  condutaClinica: z.string().optional(),
  observacoes: z.string().optional(),
});

export type AtendimentoFormValues = z.infer<typeof atendimentoSchema>;

export function CockpitAtendimento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getAuthUser();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("prontuario");
  const [activeField, setActiveField] =
    useState<keyof AtendimentoFormValues>("condutaClinica");
  const [receitaOpen, setReceitaOpen] = useState(false);
  const [manejoOpen, setManejoOpen] = useState(false);

  const viewMode = localStorage.getItem("vestris_view_mode");
  const isBlockedGestor =
    user?.role === "ADMIN_GESTOR" ||
    (user?.role === "ADMIN_CLINICO" && viewMode !== "VETERINARIO");

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

  const tipoAtendimento = (atendimento as any)?.tipo || "CONSULTA_CLINICA";

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

  const { data: historicoVacinas } = useQuery({
    queryKey: ["vacinas-paciente", paciente?.id],
    queryFn: async () => {
      if (!paciente?.id) return [];
      const res = await patientVaccinationService.listarVacinasDoPaciente(
        paciente.id,
      );
      return res.data.dados || [];
    },
    enabled: !!paciente?.id,
  });

  const dataAtendimentoStr = atendimento?.dataHora
    ? atendimento.dataHora.split("T")[0]
    : "";

  const vacinasDoDia =
    historicoVacinas
      ?.filter((v: any) => {
        return v.dataAplicacao === dataAtendimentoStr;
      })
      .map((v: any) => ({
        nome: v.vacinaNome,
        lote: v.lote,
        dataAplicacao: v.dataAplicacao,
        proximaDose: v.dataProximaDose,
        observacoes: v.observacoes,
      })) || [];

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

  // --- 2. LÓGICA DE FINALIZAÇÃO INTELIGENTE ---
  const finalizeMutation = useMutation({
    mutationFn: async (values: AtendimentoFormValues) => {
      if (!id) return;

      // VALIDAÇÃO MANUAL: Se for consulta, EXIGE conduta.
      if (
        tipoAtendimento === "CONSULTA_CLINICA" &&
        !values.condutaClinica?.trim()
      ) {
        throw new Error(
          "A conduta terapêutica é obrigatória para finalizar consultas.",
        );
      }

      // PREPARAR PAYLOAD (AUTO-COMPLETE SE FOR VACINAÇÃO)
      const payload = { ...values } as unknown as FinalizacaoAtendimentoRequest;
      payload.protocoloId = atendimento?.protocoloId;
      (payload as any).orientacoesManejo = (
        atendimento as any
      ).orientacoesManejo;

      // SE FOR VACINAÇÃO, PREENCHE CAMPOS OBRIGATÓRIOS DO BACKEND AUTOMATICAMENTE
      if (tipoAtendimento === "VACINACAO") {
        if (!payload.queixaPrincipal)
          payload.queixaPrincipal = "Protocolo de Imunização";
        if (!payload.historicoClinico)
          payload.historicoClinico = "Animal apto para vacinação.";
        if (!payload.diagnostico) payload.diagnostico = "Higidez Clínica.";
        if (!payload.condutaClinica)
          payload.condutaClinica =
            vacinasDoDia.length > 0
              ? `Vacinas aplicadas: ${vacinasDoDia.map((v) => v.nome).join(", ")}`
              : "Vacinação realizada conforme cartão.";
      }

      // GARANTIA FINAL: Nunca mandar string vazia se o backend espera @NotNull
      if (!payload.queixaPrincipal) payload.queixaPrincipal = "-";
      if (!payload.diagnostico) payload.diagnostico = "-";
      if (!payload.condutaClinica) payload.condutaClinica = "-";

      await recordsService.finalizarAtendimento(id, payload);
    },
    onSuccess: () => {
      toast.success("Atendimento finalizado com sucesso!");
      refetch();
    },
    onError: (e) => toast.error(e.message || "Erro ao finalizar atendimento."),
  });

  const handleSaveDraft = () => {
    const currentValues = form.getValues();
    saveDraftMutation.mutate(currentValues);
  };

  // --- 3. DEBUGGER DE ERRO DE SUBMIT ---
  // Função que será chamada se o Zod ainda encontrar erros (útil para debug)
  const onInvalid = (errors: any) => {
    console.error("Erros de validação:", errors);
    toast.error("Existem campos inválidos no formulário.");
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
      vacinasDoDia,
    );

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
            tipo: tipoAtendimento,
            vacinasInclusas: vacinasDoDia.length,
          }),
        },
        token,
      ).catch((err) => console.error("Falha ao auditar PDF", err));
    }
  };

  if (isBlockedGestor) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-t-purple-600 max-w-md">
          <ShieldCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Visão Administrativa
          </h1>
          <p className="text-slate-600 mb-6">
            Acesso restrito a dados clínicos.
          </p>
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
                <Badge variant="outline" className="bg-slate-50 text-slate-600">
                  {tipoAtendimento.replace("_", " ")}
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
              <span className="hidden lg:inline">
                {tipoAtendimento === "VACINACAO"
                  ? "Certificado Vacinal"
                  : "Prontuário"}
              </span>
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
            {tipoAtendimento === "VACINACAO" && vacinasDoDia.length > 0 && (
              <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">
                      {vacinasDoDia.length} Vacina(s) Registrada(s)
                    </h4>
                    <p className="text-emerald-700 text-xs">
                      {vacinasDoDia.map((v: any) => v.nome).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ProntuarioEditor
              form={form}
              readOnly={isReadOnly}
              onFieldFocus={setActiveField}
              onSaveDraft={handleSaveDraft}
              // --- CORREÇÃO DO SUBMIT ---
              // Passamos o onInvalid para ver se tem erro escondido
              onFinalize={form.handleSubmit(
                (d) => finalizeMutation.mutate(d),
                onInvalid,
              )}
              isSaving={saveDraftMutation.isPending}
              isFinalizing={finalizeMutation.isPending}
              tipoAtendimento={tipoAtendimento}
              pacienteId={atendimento?.pacienteId}
            />
          </TabsContent>

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
            dadosSalvos={(atendimento as any).orientacoesManejo}
            onSave={(jsonTexto) => {
              recordsService
                .atualizarAtendimento(id!, {
                  ...atendimento,
                  ...form.getValues(),
                  orientacoesManejo: jsonTexto,
                } as any)
                .then(() => {
                  refetch();
                });
            }}
            atendimentoId={atendimento.id}
            pacienteId={paciente.id}
          />
        )}
      </main>
    </div>
  );
}
