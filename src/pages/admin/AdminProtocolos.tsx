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
