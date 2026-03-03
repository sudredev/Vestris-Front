## pages\pacientes

### DetalhesPaciente.tsx

```typescript
// pages\pacientes\DetalhesPaciente.tsx
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
                                { locale: ptBR }
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
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-500 text-sm">
              Edição de cadastro em desenvolvimento.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

### MeusPacientes.tsx

```typescript
// pages\pacientes\MeusPacientes.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientsService, speciesService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

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
import { Plus, Search, PawPrint, User, FileText } from "lucide-react";

export function MeusPacientes() {
  const user = getAuthUser();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  const { data: pacientes, isLoading: loadingPacientes } = useQuery({
    queryKey: ["meus-pacientes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await patientsService.listarPacientes(user.id);
      return res.data.dados || [];
    },
    enabled: !!user?.id,
  });

  const { data: especies } = useQuery({
    queryKey: ["lista-especies-lookup"],
    queryFn: async () => {
      const res = await speciesService.listarEspecies();
      return res.data.dados || [];
    },
  });

  const getNomeEspecie = (id: string) => {
    const esp = especies?.find((e) => e.id === id);
    return esp ? esp.nomePopular : "---";
  };

  const filtrados = pacientes?.filter(
    (p) =>
      (p.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
      (p.dadosTutor || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* HEADER: Botão maior e alinhado ao centro */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Meus Pacientes
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gerencie os animais cadastrados.
          </p>
        </div>

        <Button
          // Botão maior (h-12), texto maior (text-base) e mais largo (px-8)
          className="shadow-md bg-slate-900 hover:bg-slate-800 rounded-lg px-8 h-12 text-base font-medium transition-all hover:-translate-y-0.5"
          onClick={() => navigate("/pacientes/novo")}
        >
          <Plus className="h-5 w-5 mr-2" /> Novo Paciente
        </Button>
      </div>

      {/* FILTRO */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome do paciente ou tutor..."
          className="pl-11 h-11 rounded-lg border-slate-200 bg-white shadow-sm focus:ring-1 focus:ring-slate-200 transition-all max-w-lg text-base"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loadingPacientes ? (
          <div className="p-16 text-center text-slate-400">
            Carregando lista...
          </div>
        ) : filtrados && filtrados.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-[25%] py-4 pl-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Paciente
                </TableHead>
                <TableHead className="w-[45%] py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Tutor
                </TableHead>
                <TableHead className="w-[15%] py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  ID
                </TableHead>
                <TableHead className="w-[15%] py-4 text-right pr-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow
                  key={p.id}
                  className="group cursor-pointer hover:bg-slate-50/60 transition-colors border-b border-slate-50 last:border-0"
                  onClick={() => navigate(`/pacientes/${p.id}`)}
                >
                  {/* PACIENTE */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-lg">
                        {p.nome}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1 border border-slate-200">
                        <PawPrint className="h-3 w-3" />
                        {getNomeEspecie(p.especieId || "")}
                      </span>
                    </div>
                  </TableCell>

                  {/* TUTOR */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3 max-w-[400px]">
                      <User className="h-4 w-4 text-slate-300 shrink-0" />
                      <span
                        className="text-sm text-slate-600 truncate font-medium"
                        title={p.dadosTutor}
                      >
                        {p.dadosTutor}
                      </span>
                    </div>
                  </TableCell>

                  {/* ID */}
                  <TableCell className="py-4">
                    <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      {p.identificacaoAnimal || "---"}
                    </span>
                  </TableCell>

                  {/* AÇÃO */}
                  <TableCell className="py-4 text-right pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-slate-200 text-slate-600 hover:bg-white hover:text-primary hover:border-primary transition-all shadow-sm text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pacientes/${p.id}`);
                      }}
                    >
                      <FileText className="mr-2 h-3.5 w-3.5" /> Ficha Clínica
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-base font-medium text-slate-900">
              Nenhum paciente encontrado
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Tente ajustar sua busca ou adicione um novo animal.
            </p>
            <Button variant="outline" onClick={() => setBusca("")}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

```

### PacienteForm.tsx

```typescript
// pages\pacientes\PacienteForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { speciesService, patientsService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { PawPrint, Save, User, ArrowLeft } from "lucide-react";

// Schema de Validação
const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  especieId: z.string().min(1, "Selecione uma espécie"),

  // Tutor
  tutorNome: z.string().min(3, "Nome do tutor obrigatório"),
  tutorTelefone: z.string().min(8, "Telefone obrigatório"),
  tutorDocumento: z.string().optional(),

  // Detalhes
  identificacaoAnimal: z.string().optional(),
  sexo: z.enum(["MACHO", "FEMEA", "INDEFINIDO"]),

  // Peso
  pesoValor: z.coerce.string().min(1, "Informe o peso"),
  unidadePeso: z.enum(["g", "kg"]),

  pelagemCor: z.string().optional(),
  microchip: z.string().optional(),
  dataNascimento: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PacienteForm() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();

  const { data: especiesList, isError } = useQuery({
    queryKey: ["especies-select"],
    queryFn: async () => {
      try {
        const res = await speciesService.listarEspecies();
        return res.data.dados || [];
      } catch (e) {
        console.error("Erro ao buscar espécies", e);
        return [];
      }
    },
  });

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nome: "",
      especieId: "",
      tutorNome: "",
      tutorTelefone: "",
      tutorDocumento: "",
      identificacaoAnimal: "",
      sexo: "INDEFINIDO",
      pesoValor: "",
      unidadePeso: "g",
      pelagemCor: "",
      microchip: "",
      dataNascimento: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user?.id) throw new Error("Sessão inválida");

      const dadosTutor = `${values.tutorNome} | Tel: ${values.tutorTelefone}${
        values.tutorDocumento ? ` | Doc: ${values.tutorDocumento}` : ""
      }`;

      const pesoNum = parseFloat(values.pesoValor.replace(",", "."));
      const pesoFinal = values.unidadePeso === "kg" ? pesoNum * 1000 : pesoNum;

      await patientsService.criarPaciente({
        veterinarioId: user.id,
        especieId: values.especieId,
        nome: values.nome,
        dadosTutor: dadosTutor,
        identificacaoAnimal: values.identificacaoAnimal,
        pesoAtualGramas: Math.round(pesoFinal),
        pelagemCor: values.pelagemCor,
        microchip: values.microchip,
        dataNascimento: values.dataNascimento || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sexo: values.sexo as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meus-pacientes"] });
      toast.success("Paciente cadastrado!");
      navigate("/pacientes");
    },
    onError: () => toast.error("Erro ao salvar. Verifique os dados."),
  });

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar o formulário. Verifique sua conexão.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:pl-2 transition-all gap-2 text-slate-500"
        onClick={() => navigate("/pacientes")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para lista
      </Button>

      <Card className="border-none shadow-lg overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 text-white pb-8 pt-6 px-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <PawPrint className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Novo Paciente</CardTitle>
              <CardDescription className="text-slate-300">
                Preencha os dados estruturados para iniciar o prontuário.
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
              {/* --- DADOS DO ANIMAL --- */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dados do Animal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Animal *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Loro"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="especieId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espécie *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {especiesList?.map((esp) => (
                              <SelectItem key={esp.id} value={esp.id!}>
                                {esp.nomePopular}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PESO */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Peso Atual *
                    </label>
                    <div className="flex gap-0">
                      <FormField
                        control={form.control}
                        name="pesoValor"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormControl>
                              <Input
                                placeholder="0.00"
                                {...field}
                                className="rounded-r-none h-11 bg-slate-50 border-slate-200 focus:bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unidadePeso"
                        render={({ field }) => (
                          <FormItem className="w-[80px] space-y-0">
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-l-none bg-slate-100 border-l-0 border-slate-200 h-11 focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MACHO">Macho</SelectItem>
                            <SelectItem value="FEMEA">Fêmea</SelectItem>
                            <SelectItem value="INDEFINIDO">
                              Indefinido
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nascimento (Aprox)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="pelagemCor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor / Pelagem</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Verde"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="identificacaoAnimal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anilha / Marca</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: BR-123"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="microchip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Microchip (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Código..."
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- DADOS DO TUTOR --- */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Responsável (Tutor)
                  </span>
                </div>

                {/* CORREÇÃO DO LAYOUT: Stack Vertical */}
                <div className="grid gap-6">
                  {/* Linha 1: Nome (Ocupa tudo) */}
                  <FormField
                    control={form.control}
                    name="tutorNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Maria Silva"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Linha 2: Telefone e Documento (Lado a Lado) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tutorTelefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(xx) 9xxxx-xxxx"
                              {...field}
                              className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tutorDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF / RG</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              {...field}
                              className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* RODAPÉ */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/pacientes")}
                  className="h-12 px-6 text-slate-500"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-12 px-8 shadow-md transition-all"
                  disabled={mutation.isPending}
                >
                  <Save className="h-5 w-5" />
                  {mutation.isPending ? "Salvando..." : "Cadastrar"}
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

