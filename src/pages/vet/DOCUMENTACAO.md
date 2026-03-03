## pages\vet

### VetDashboard.tsx

```typescript
// pages\vet\VetDashboard.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  recordsService,
  patientsService,
  usersService,
} from "@/lib/api-client";
import { Link } from "react-router-dom";
import { getAuthUser, logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Activity,
  PawPrint,
  Calculator,
  Clock,
  Play,
  FileText,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { AtendimentoRequest } from "@/api";
import { CalculadoraSegura } from "../atendimentos/components/CalculadoraSegura";
import { BannerAssinatura } from "@/components/BannerAssinatura";

// Componente ActionCard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActionCard = ({ icon: Icon, title, desc, colorClass, onClick }: any) => (
  <Card
    className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-l-4 group"
    style={{ borderLeftColor: colorClass }}
    onClick={onClick}
  >
    <CardContent className="p-6 flex items-center gap-4">
      <div
        className={`p-3 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors`}
      >
        <Icon
          className="h-8 w-8 text-slate-700"
          style={{ color: colorClass }}
        />
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </CardContent>
  </Card>
);

export function VetDashboard() {
  const user = getAuthUser();
  const navigate = useNavigate();

  const [modalAvulsoOpen, setModalAvulsoOpen] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState("");

  // 1. Busca Dados do Usuário
  const { data: dadosUsuario, isError: erroUsuario } = useQuery({
    queryKey: ["meus-dados", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await usersService.buscarUsuarioPorId(user.id);
      return res.data.dados;
    },
    enabled: !!user?.id,
    retry: false,
  });

  useEffect(() => {
    if (erroUsuario) {
      toast.error("Sessão inválida. Faça login novamente.");
      logout();
    }
  }, [erroUsuario]);

  // 2. Busca Agenda de Hoje
  const { data: agenda } = useQuery({
    queryKey: ["agenda-hoje", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const hoje = format(new Date(), "yyyy-MM-dd");
      const res = await recordsService.listarMeusAtendimentos(
        user.id,
        undefined,
        undefined,
        hoje,
        hoje,
      );
      return res.data.dados || [];
    },
    enabled: !!user?.id && !erroUsuario,
  });

  // 3. Busca Pacientes
  const { data: pacientes } = useQuery({
    queryKey: ["pacientes-select"],
    queryFn: async () =>
      (await patientsService.listarPacientes(user!.id)).data.dados || [],
    enabled: modalAvulsoOpen && !!user?.id && !erroUsuario,
  });

  // Mutação: Criar Atendimento Avulso
  const emergenciaMutation = useMutation({
    mutationFn: async () => {
      if (!pacienteSelecionado) throw new Error("Selecione um paciente");
      const payload = {
        veterinarioId: user!.id,
        pacienteId: pacienteSelecionado,
        titulo: "Atendimento Avulso (Imediato)",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: "EM_ANDAMENTO" as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any as AtendimentoRequest;

      const res = await recordsService.criarAtendimento(payload);
      return res.data.dados?.id;
    },
    onSuccess: (novoId) => {
      toast.success("Prontuário iniciado!");
      setModalAvulsoOpen(false);
      navigate(`/atendimentos/${novoId}`);
    },
    onError: () => toast.error("Erro ao criar atendimento avulso."),
  });

  // MUTAÇÃO: Iniciar Atendimento Agendado
  const iniciarAgendadoMutation = useMutation({
    mutationFn: async (id: string) => {
      await recordsService.atualizarStatusAtendimento(id, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: "EM_ANDAMENTO" as any,
      });
    },
    onSuccess: (_, id) => {
      navigate(`/atendimentos/${id}`);
    },
    onError: () => toast.error("Erro ao iniciar atendimento."),
  });

  return (
    <div className="container mx-auto py-8 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Olá, Dr(a). {dadosUsuario?.nome || user?.email?.split("@")[0]}
          </h1>
          <p className="text-slate-500 mt-1">Bem-vindo ao Vestris.</p>
        </div>
        <div className="text-sm text-slate-400 font-mono capitalize">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </div>
      </div>

      {/* BANNER DE ASSINATURA */}
      <BannerAssinatura />

      {/* PAINEL DE AÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          icon={Calendar}
          title="Agendar"
          desc="Consulta futura"
          colorClass="#3b82f6"
          onClick={() => navigate("/atendimentos/novo-agendamento")}
        />
        <ActionCard
          icon={Activity}
          title="Atender Agora"
          desc="Emergência / Avulso"
          colorClass="#ef4444"
          onClick={() => setModalAvulsoOpen(true)}
        />
        <ActionCard
          icon={PawPrint}
          title="Novo Paciente"
          desc="Cadastrar animal"
          colorClass="#22c55e"
          onClick={() => navigate("/pacientes/novo")}
        />
        <Dialog>
          <DialogTrigger asChild>
            <div className="w-full h-full">
              <Card
                className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-l-4 h-full group"
                style={{ borderLeftColor: "#a855f7" }}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                    <Calculator className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      Cálculo Rápido
                    </h3>
                    <p className="text-sm text-slate-500">Ferramenta livre</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Calculadora Veterinária</DialogTitle>
              <DialogDescription>
                Cálculo de dose com validação de segurança.
              </DialogDescription>
            </DialogHeader>

            <CalculadoraSegura
              onCopiarParaProntuario={(texto) => {
                navigator.clipboard.writeText(texto);
                toast.success("Copiado para área de transferência!");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* AGENDA DO DIA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Clock className="h-5 w-5 text-primary" /> Agenda de Hoje
            </h2>
            <Button
              variant="link"
              onClick={() => navigate("/atendimentos")}
              className="text-primary"
            >
              Ver agenda completa →
            </Button>
          </div>

          {agenda?.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                Nenhum atendimento agendado para hoje.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/atendimentos/novo-agendamento")}
              >
                Agendar Consulta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {agenda?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  {/* ESQUERDA: HORA + INFO (CORRIGIDO) */}
                  <div className="flex items-center gap-5 overflow-hidden">
                    <span className="text-xl font-bold text-slate-600 w-16 text-center bg-slate-50 py-2 rounded-lg shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {item.dataHora
                        ? format(new Date(item.dataHora), "HH:mm")
                        : "--:--"}
                    </span>
                    <div className="min-w-0">
                      {/* CORREÇÃO: Flex-Wrap para o título não empurrar a badge para fora */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg truncate max-w-[200px] sm:max-w-[300px]">
                          {item.titulo}
                        </h3>

                        {/* BADGES COM WHITESPACE-NOWRAP */}
                        {item.status === "AGENDADO" && (
                          <Badge
                            variant="outline"
                            className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap"
                          >
                            Agendado
                          </Badge>
                        )}
                        {item.status === "EM_ANDAMENTO" && (
                          <Badge
                            variant="outline"
                            className="text-blue-700 bg-blue-50 border-blue-200 animate-pulse whitespace-nowrap"
                          >
                            Em Andamento
                          </Badge>
                        )}
                        {item.status === "REALIZADO" && (
                          <Badge
                            variant="outline"
                            className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap"
                          >
                            Realizado
                          </Badge>
                        )}
                        {item.status === "CANCELADO" && (
                          <Badge
                            variant="outline"
                            className="text-red-700 bg-red-50 border-red-200 whitespace-nowrap"
                          >
                            Cancelado
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 flex items-center gap-2 truncate">
                        <span className="font-medium text-slate-700">
                          {item.pacienteNome}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {item.pacienteEspecie}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* DIREITA: BOTÃO (SHRINK-0 PARA NÃO SUMIR) */}
                  <div className="shrink-0 ml-2">
                    {item.status === "AGENDADO" && (
                      <Button
                        onClick={() => iniciarAgendadoMutation.mutate(item.id!)}
                        className="bg-slate-800 hover:bg-slate-900 shadow-sm"
                      >
                        <Play className="h-4 w-4 mr-2" /> Iniciar
                      </Button>
                    )}

                    {item.status === "EM_ANDAMENTO" && (
                      <Button
                        onClick={() => navigate(`/atendimentos/${item.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-sm text-white"
                      >
                        <FileText className="h-4 w-4 mr-2" /> Continuar
                      </Button>
                    )}

                    {item.status === "REALIZADO" && (
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/atendimentos/${item.id}`)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />{" "}
                        Ver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atalhos Secundários */}
        <div className="space-y-6">
          <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors h-12"
                asChild
              >
                <Link to="/biblioteca">
                  <FileText className="mr-3 h-4 w-4 text-purple-500" />{" "}
                  Biblioteca & Protocolos
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors h-12"
                asChild
              >
                <Link to="/pacientes">
                  <PawPrint className="mr-3 h-4 w-4 text-green-500" /> Lista de
                  Pacientes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL AVULSO */}
      <Dialog open={modalAvulsoOpen} onOpenChange={setModalAvulsoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Activity className="h-5 w-5" /> Atendimento de Emergência
            </DialogTitle>
            <DialogDescription>
              Selecione o paciente para abrir o prontuário imediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Select
              onValueChange={setPacienteSelecionado}
              value={pacienteSelecionado}
            >
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Selecione o paciente..." />
              </SelectTrigger>
              <SelectContent>
                {pacientes?.map((p) => (
                  <SelectItem key={p.id} value={p.id!}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg font-bold shadow-red-200 shadow-lg"
              onClick={() => emergenciaMutation.mutate()}
              disabled={!pacienteSelecionado || emergenciaMutation.isPending}
            >
              {emergenciaMutation.isPending
                ? "Criando..."
                : "ABRIR PRONTUÁRIO AGORA"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

