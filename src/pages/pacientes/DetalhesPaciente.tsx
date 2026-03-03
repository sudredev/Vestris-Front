import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  patientsService,
  speciesService,
  recordsService,
} from "@/lib/api-client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // <--- GARANTINDO O IMPORT DO INPUT
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Calendar,
  Weight,
  Stethoscope,
  PlusCircle,
  Clock,
  PawPrint,
  Hash,
  Activity,
  Search,
  Filter,
  X,
} from "lucide-react";

import { RegistroVacinaModal } from "./components/RegistroVacinalModal";
import { ListaVacinas } from "./components/ListaVacinas";
import { EditarCadastroTab } from "@/components/EditarCadastroTab";

export function DetalhesPaciente() {
  const { id } = useParams<{ id: string }>();

  const [busca, setBusca] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [modalVacinaOpen, setModalVacinaOpen] = useState(false);

  const { data: paciente, isLoading: loadingPac } = useQuery({
    queryKey: ["paciente", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await patientsService.buscarPacientePorId(id);
      return res.data.dados;
    },
    enabled: !!id,
  });

  const { data: especie } = useQuery({
    queryKey: ["especie-paciente", paciente?.especieId],
    queryFn: async () => {
      if (!paciente?.especieId) return null;
      const res = await speciesService.buscarEspeciePorId(paciente.especieId);
      return res.data.dados;
    },
    enabled: !!paciente?.especieId,
  });

  const { data: historico, isLoading: loadingHist } = useQuery({
    queryKey: ["historico-paciente", id],
    queryFn: async () => {
      if (!id) return [];
      const res = await recordsService.listarAtendimentosPorPaciente(id);
      return res.data.dados || [];
    },
    enabled: !!id,
  });

  const historicoFiltrado = historico?.filter((item) => {
    const termo = busca.toLowerCase();
    const matchTexto =
      (item.titulo || "").toLowerCase().includes(termo) ||
      (item.queixaPrincipal || "").toLowerCase().includes(termo);
    const matchData = dataFiltro ? item.dataHora?.startsWith(dataFiltro) : true;
    return matchTexto && matchData;
  });

  if (loadingPac) {
    return (
      <div className="container py-20 text-center animate-pulse text-slate-400">
        <PawPrint className="h-10 w-10 mx-auto mb-4 opacity-50" />
        Carregando prontuário...
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="container py-20 text-center">
        Paciente não encontrado.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* 1. HEADER */}
      <div className="flex items-center justify-between pb-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="pl-0 hover:pl-2 transition-all text-slate-500"
        >
          <Link to="/pacientes">
            <ArrowLeft className="h-5 w-5 mr-2" /> Voltar para Lista
          </Link>
        </Button>
        <Button
          asChild
          className="shadow-md bg-slate-900 hover:bg-slate-800 rounded-lg px-8 h-12 text-base font-medium transition-all hover:-translate-y-0.5"
        >
          <Link
            to="/atendimentos/novo-agendamento"
            state={{ pacienteIdPreSelecionado: paciente.id }}
          >
            <Stethoscope className="h-5 w-5 mr-2" /> Nova Consulta
          </Link>
        </Button>
      </div>

      {/* 2. CARD DO PACIENTE */}
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <div className="flex gap-5 items-center md:items-start min-w-[250px]">
              <Avatar className="h-20 w-20 border-2 border-slate-100 shadow-sm bg-slate-50">
                <AvatarFallback className="text-2xl font-bold text-slate-400">
                  {paciente.nome?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  {paciente.nome}
                  {paciente.sexo === "MACHO" && (
                    <span className="text-blue-500 text-xl" title="Macho">
                      ♂
                    </span>
                  )}
                  {paciente.sexo === "FEMEA" && (
                    <span className="text-pink-500 text-xl" title="Fêmea">
                      ♀
                    </span>
                  )}
                </h1>
                <p className="text-slate-500 font-medium">
                  {especie ? especie.nomePopular : "Espécie n/a"}
                </p>
                <p className="text-xs text-slate-400 italic">
                  {especie?.nomeCientifico}
                </p>
              </div>
            </div>

            <div className="hidden md:block w-px h-24 bg-slate-100 mx-2"></div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5" /> Peso
                </span>
                <p className="text-base font-semibold text-slate-700">
                  {paciente.pesoAtualGramas
                    ? `${paciente.pesoAtualGramas}g`
                    : "--"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Nasc.
                </span>
                <p className="text-base font-semibold text-slate-700">
                  {paciente.dataNascimento
                    ? format(new Date(paciente.dataNascimento), "dd/MM/yyyy")
                    : "--"}
                </p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Tutor
                </span>
                <p
                  className="text-sm font-medium text-slate-700 truncate"
                  title={paciente.dadosTutor}
                >
                  {paciente.dadosTutor}
                </p>
              </div>
              <div className="space-y-1 md:col-span-4 pt-2 border-t border-slate-50 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Hash className="h-3.5 w-3.5" /> Identificação
                </span>
                <div className="flex gap-2">
                  {paciente.identificacaoAnimal ? (
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200"
                    >
                      Anilha: {paciente.identificacaoAnimal}
                    </Badge>
                  ) : null}
                  {paciente.microchip ? (
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200"
                    >
                      Chip: {paciente.microchip}
                    </Badge>
                  ) : null}
                  {!paciente.identificacaoAnimal && !paciente.microchip && (
                    <span className="text-xs text-slate-400">
                      Sem registros
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. TABS */}
      <Tabs defaultValue="historico" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-12 p-0 bg-transparent mb-6">
          <TabsTrigger
            value="historico"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-6 h-12 bg-transparent text-slate-500 transition-colors"
          >
            Histórico Clínico
          </TabsTrigger>
          <TabsTrigger
            value="vacinas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-6 h-12 bg-transparent text-slate-500 transition-colors"
          >
            Vacinação
          </TabsTrigger>
          <TabsTrigger
            value="dados"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-6 h-12 bg-transparent text-slate-500 transition-colors"
          >
            Editar Cadastro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50/50 p-1 rounded-lg">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Pesquisar por título ou queixa..."
                className="pl-9 bg-white border-slate-200"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <Input
                type="date"
                className="w-full md:w-40 bg-white border-slate-200"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
              />
              {(busca || dataFiltro) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setBusca("");
                    setDataFiltro("");
                  }}
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {loadingHist ? (
              <div className="text-center py-10 text-slate-400">
                Carregando histórico...
              </div>
            ) : historicoFiltrado && historicoFiltrado.length > 0 ? (
              historicoFiltrado.map((atendimento) => (
                <Card
                  key={atendimento.id}
                  className={`hover:shadow-md transition-all group border-l-4 ${
                    atendimento.status === "REALIZADO"
                      ? "border-l-green-500"
                      : atendimento.status === "EM_ANDAMENTO"
                        ? "border-l-blue-500"
                        : atendimento.status === "AGENDADO"
                          ? "border-l-yellow-400"
                          : "border-l-red-300 opacity-70"
                  }`}
                >
                  <CardHeader className="pb-3 pt-5 px-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                            {atendimento.titulo || "Atendimento Clínico"}
                          </CardTitle>
                          {atendimento.status === "REALIZADO" && (
                            <Badge
                              variant="outline"
                              className="text-green-700 bg-green-50 border-green-200"
                            >
                              Realizado
                            </Badge>
                          )}
                          {atendimento.status === "EM_ANDAMENTO" && (
                            <Badge
                              variant="outline"
                              className="text-blue-700 bg-blue-50 border-blue-200 animate-pulse"
                            >
                              Em Andamento
                            </Badge>
                          )}
                          {atendimento.status === "AGENDADO" && (
                            <Badge
                              variant="outline"
                              className="text-yellow-700 border-yellow-200 bg-yellow-50"
                            >
                              Agendado
                            </Badge>
                          )}
                          {atendimento.status === "CANCELADO" && (
                            <Badge
                              variant="outline"
                              className="text-red-700 border-red-200 bg-red-50"
                            >
                              Cancelado
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          {atendimento.dataHora
                            ? format(
                                new Date(atendimento.dataHora),
                                "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )
                            : "Data N/A"}
                          <span className="hidden md:inline">•</span>
                          <span className="font-medium text-slate-600 block md:inline">
                            Dr(a). {atendimento.veterinarioNome}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 mt-2 mb-4 border border-slate-100">
                      <p className="line-clamp-2">
                        <span className="font-bold text-slate-700">
                          Queixa:
                        </span>{" "}
                        {atendimento.queixaPrincipal}
                      </p>
                      {atendimento.diagnostico && (
                        <p className="mt-2 font-medium text-slate-800 pt-2 border-t border-slate-200">
                          Dx: {atendimento.diagnostico}
                        </p>
                      )}
                    </div>
                    {atendimento.status !== "CANCELADO" && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs h-9 px-4"
                        >
                          <Link to={`/atendimentos/${atendimento.id}`}>
                            Ver Prontuário Completo
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  {busca || dataFiltro
                    ? "Nenhum atendimento com este filtro."
                    : "Nenhum atendimento registrado."}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/atendimentos/novo-agendamento">
                    <PlusCircle className="mr-2 h-4 w-4" /> Iniciar Atendimento
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vacinas" className="pt-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setModalVacinaOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Registrar Vacina
            </Button>
          </div>

          <ListaVacinas pacienteId={id!} />

          {/* COMPONENTE MODAL DE VACINA */}
          <RegistroVacinaModal
            pacienteId={id!}
            open={modalVacinaOpen}
            onOpenChange={setModalVacinaOpen}
          />
        </TabsContent>

        <TabsContent value="dados" className="pt-4">
          {/* COMPONENTE DE EDIÇÃO */}
          <EditarCadastroTab paciente={paciente} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
