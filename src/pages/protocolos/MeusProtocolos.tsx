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
