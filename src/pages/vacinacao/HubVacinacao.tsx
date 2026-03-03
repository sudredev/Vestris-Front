/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAuthUser } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Syringe,
  AlertTriangle,
  CalendarCheck,
  User,
  PawPrint,
  CheckCircle2,
  MessageCircle,
  Loader2,
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  Settings,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Fetch manual
async function fetchHubData(endpoint: string) {
  const token = localStorage.getItem("vestris_token");
  const { API_BASE } = await import("@/api/resources");
  const res = await fetch(`${API_BASE}/api/v1/hub-vacinacao/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Falha ao buscar dados");
  const json = await res.json();
  console.log(`Dados ${endpoint}:`, json.dados); // Debug para ver se chega algo
  return json.dados || [];
}

export function HubVacinacao() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const [aba, setAba] = useState("atrasadas");

  // Estado dos Filtros
  const [busca, setBusca] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("TODAS");

  const isAdminGlobal = user?.scope === "GLOBAL";

  // Queries
  const {
    data: atrasadas,
    isLoading: loadingAtrasadas,
    refetch: refetchAtrasadas,
    isRefetching: refetchingA,
  } = useQuery({
    queryKey: ["vacinas-atrasadas"],
    queryFn: () => fetchHubData("atrasadas"),
    refetchInterval: 60000,
  });

  const {
    data: previstas,
    isLoading: loadingPrevistas,
    refetch: refetchPrevistas,
    isRefetching: refetchingP,
  } = useQuery({
    queryKey: ["vacinas-previstas"],
    queryFn: () => fetchHubData("previstas"),
    refetchInterval: 60000,
  });

  // Função unificada de refresh
  const handleRefresh = () => {
    refetchAtrasadas();
    refetchPrevistas();
    toast.info("Atualizando dados...");
  };

  const handleContactTutor = (
    tutorInfo: string,
    petName: string,
    vacinaName: string,
  ) => {
    const phoneMatch = tutorInfo ? tutorInfo.match(/\d{10,11}/) : null;
    if (phoneMatch) {
      const phone = "55" + phoneMatch[0];
      const msg = `Olá, aqui é da clínica veterinária. Notamos que o reforço da vacina (${vacinaName}) do(a) ${petName} está pendente. Podemos agendar?`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    } else {
      toast.error("Telefone não encontrado no cadastro do tutor.");
    }
  };

  // Função de Filtragem Genérica
  const filtrarDados = (lista: any[]) => {
    if (!lista) return [];
    return lista.filter((item) => {
      const termo = busca.toLowerCase();
      const matchTexto =
        item.pacienteNome.toLowerCase().includes(termo) ||
        item.tutorNome.toLowerCase().includes(termo) ||
        item.vacinaNome.toLowerCase().includes(termo);

      const matchEspecie =
        filtroEspecie === "TODAS" || item.pacienteEspecie === filtroEspecie;

      return matchTexto && matchEspecie;
    });
  };

  const atrasadasFiltradas = filtrarDados(atrasadas);
  const previstasFiltradas = filtrarDados(previstas);

  // Extrair espécies únicas para o filtro
  const especiesDisponiveis = Array.from(
    new Set([
      ...(atrasadas || []).map((i: any) => i.pacienteEspecie),
      ...(previstas || []).map((i: any) => i.pacienteEspecie),
    ]),
  ).filter(Boolean);

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 space-y-8 bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Syringe className="h-7 w-7 text-indigo-600" /> Monitoramento
            Vacinal
          </h1>
          <p className="text-slate-500 mt-1">
            Gestão epidemiológica e controle de imunização.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refetchingA || refetchingP}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refetchingA || refetchingP ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>

          {isAdminGlobal && (
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800 gap-2"
              onClick={() => navigate("/admin/vacinas/novo")}
            >
              <Settings className="h-4 w-4" /> Configurar Vacinas
            </Button>
          )}
        </div>
      </div>

      {/* KPIS / INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                  Doses Atrasadas
                </p>
                <h3 className="text-4xl font-black text-slate-800">
                  {atrasadas?.length || 0}
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Requerem atenção imediata
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Previstas (30 dias)
                </p>
                <h3 className="text-4xl font-black text-slate-800">
                  {previstas?.length || 0}
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Agenda futura próxima
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <CalendarCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Status da Clínica
                </p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  Operacional
                </h3>
                <p className="text-sm text-slate-400 mt-2">Controle ativo</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA DE CONTROLE (ABAS + FILTROS) */}
      <div className="space-y-4">
        {/* BARRA DE FILTROS */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por paciente, tutor ou vacina..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="w-full md:w-64">
            <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Filtrar Espécie" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as Espécies</SelectItem>
                {especiesDisponiveis.map((esp: any) => (
                  <SelectItem key={esp} value={esp}>
                    {esp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs
          defaultValue="atrasadas"
          className="w-full"
          onValueChange={setAba}
        >
          <TabsList className="w-full justify-start h-12 bg-white border-b border-slate-200 rounded-t-lg p-0">
            <TabsTrigger
              value="atrasadas"
              className="h-12 px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-700 data-[state=active]:bg-red-50/50 transition-all font-bold"
            >
              🚨 Pendentes / Atrasadas ({atrasadasFiltradas.length})
            </TabsTrigger>
            <TabsTrigger
              value="previstas"
              className="h-12 px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-blue-50/50 transition-all font-bold"
            >
              📅 Próximas Doses ({previstasFiltradas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="atrasadas" className="mt-6">
            {loadingAtrasadas ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin h-10 w-10 mb-4 text-red-300" />
                <p>Analisando carteiras de vacinação...</p>
              </div>
            ) : atrasadasFiltradas.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                <CheckCircle2 className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">
                  Tudo em ordem!
                </h3>
                <p className="text-slate-500">
                  Nenhum paciente com vacina atrasada nos filtros atuais.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {atrasadasFiltradas.map((vac: any) => (
                  <VacinaCard
                    key={vac.id}
                    dados={vac}
                    tipo="ATRASADA"
                    onZap={() =>
                      handleContactTutor(
                        vac.tutorNome,
                        vac.pacienteNome,
                        vac.vacinaNome,
                      )
                    }
                    onFicha={() => navigate(`/pacientes/${vac.pacienteId}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="previstas" className="mt-6">
            {loadingPrevistas ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin h-10 w-10 mb-4 text-blue-300" />
                <p>Consultando calendário...</p>
              </div>
            ) : previstasFiltradas.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                <CalendarCheck className="h-16 w-16 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">
                  Sem previsões próximas
                </h3>
                <p className="text-slate-500">
                  Nenhuma vacina agendada para os próximos 30 dias.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {previstasFiltradas.map((vac: any) => (
                  <VacinaCard
                    key={vac.id}
                    dados={vac}
                    tipo="PREVISTA"
                    onFicha={() => navigate(`/pacientes/${vac.pacienteId}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE DE CARD MELHORADO ---
function VacinaCard({ dados, tipo, onZap, onFicha }: any) {
  const isAtrasada = tipo === "ATRASADA";

  // Formatação segura de data
  const formatData = (dataIso: string, formato: string) => {
    try {
      return format(new Date(dataIso), formato, { locale: ptBR });
    } catch {
      return "--/--";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-0 flex flex-col sm:flex-row overflow-hidden transition-all hover:shadow-md ${isAtrasada ? "border-red-200" : "border-blue-200"}`}
    >
      {/* COLUNA DE DATA (DESTAQUE) */}
      <div
        className={`w-full sm:w-32 flex flex-col items-center justify-center p-4 ${isAtrasada ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          {isAtrasada ? "Venceu em" : "Vence em"}
        </span>
        <span className="text-3xl font-black leading-none my-1">
          {formatData(dados.dataProximaDose, "dd")}
        </span>
        <span className="text-sm font-bold uppercase">
          {formatData(dados.dataProximaDose, "MMM")}
        </span>
        {isAtrasada && (
          <Badge variant="destructive" className="mt-2 text-[10px] h-5 px-2">
            Atrasada
          </Badge>
        )}
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {dados.pacienteNome}
                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <PawPrint className="h-3 w-3" /> {dados.pacienteEspecie}
                </span>
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <User className="h-3.5 w-3.5" />
                {dados.tutorNome}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">
              Vacina Pendente
            </p>
            <p
              className={`font-semibold text-sm flex items-center gap-2 ${isAtrasada ? "text-red-700" : "text-blue-700"}`}
            >
              <Syringe className="h-4 w-4" />
              {dados.vacinaNome}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 pl-6">
              Última dose aplicada em:{" "}
              {formatData(dados.dataAplicacao, "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-slate-50">
          {onZap && (
            <Button
              variant="outline"
              size="sm"
              className="text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800 h-9"
              onClick={onZap}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Contatar
            </Button>
          )}
          <Button
            size="sm"
            className={`h-9 px-4 text-white shadow-sm ${isAtrasada ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={onFicha}
          >
            <ClipboardList className="h-4 w-4 mr-2" /> Abrir Ficha
          </Button>
        </div>
      </div>
    </div>
  );
}
