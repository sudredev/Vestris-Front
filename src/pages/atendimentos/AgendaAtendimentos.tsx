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
