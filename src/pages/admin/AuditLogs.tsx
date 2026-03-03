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
