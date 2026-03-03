import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { speciesService } from "@/lib/api-client";
import { Link, useNavigate } from "react-router-dom";
import { getAuthUser } from "@/lib/auth";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogSugestao } from "@/components/DialogSugestao";
import { Search, BookOpen, PawPrint, Edit, Trash2, Plus } from "lucide-react";
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
import { toast } from "sonner";

export function Biblioteca() {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();

  const isGlobal = user?.scope === "GLOBAL";

  const { data: especies, isLoading } = useQuery({
    queryKey: ["especies"],
    queryFn: async () => {
      try {
        const res = await speciesService.listarEspecies();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await speciesService.deletarEspecie(id);
    },
    onSuccess: () => {
      toast.success("Espécie removida com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["especies"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    onError: (error: any) => {
      toast.error("Não foi possível excluir.", {
        description:
          "Esta espécie possui doenças ou pacientes vinculados. Remova os vínculos primeiro.",
      });
    },
  });

  const especiesFiltradas =
    especies?.filter(
      (esp) =>
        esp.nomePopular?.toLowerCase().includes(busca.toLowerCase()) ||
        esp.nomeCientifico?.toLowerCase().includes(busca.toLowerCase()),
    ) || [];

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            Biblioteca Clínica
          </h1>
          <p className="text-slate-500 mt-1">
            Base de conhecimento de espécies e protocolos.
          </p>
        </div>

        {isGlobal ? (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm gap-2"
            onClick={() => navigate("/admin/especies/novo")}
          >
            <Plus className="h-4 w-4" /> Nova Espécie
          </Button>
        ) : (
          <DialogSugestao tipo="ESPECIE" labelBotao="Sugerir Nova Espécie" />
        )}
      </div>

      {/* BARRA DE BUSCA */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome popular ou científico..."
          className="pl-10 h-12 text-lg bg-white border-slate-200 shadow-sm"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* GRID DE CARDS */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400">
          Carregando acervo...
        </div>
      ) : especiesFiltradas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {especiesFiltradas.map((esp) => {
            const fotoUrl = null; // Futuro: esp.fotoUrl

            return (
              <div key={esp.id} className="relative group">
                <Link to={`/especies/${esp.id}`} className="block h-full">
                  <Card className="h-full hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer border-l-4 border-l-emerald-500 bg-white group-hover:-translate-y-1 overflow-hidden">
                    <CardContent className="p-0 flex flex-col items-center text-center">
                      {/* ÁREA DA FOTO */}
                      <div className="w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center py-6 group-hover:bg-primary/5 transition-colors">
                        <div className="w-28 h-28 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border-4 border-white">
                          {fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt={esp.nomePopular}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl font-bold text-slate-300 group-hover:text-emerald-600 transition-colors select-none">
                              {esp.nomePopular?.[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* TEXTOS */}
                      <div className="p-4 w-full">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-emerald-700 mb-1">
                          {esp.nomePopular}
                        </h3>
                        <p className="text-xs text-slate-500 italic font-serif mb-2">
                          {esp.nomeCientifico}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-slate-400 font-normal border-slate-100 bg-slate-50"
                        >
                          {esp.familiaTaxonomica}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* BOTÕES DE ADMIN (FLUTUANTES) */}
                {isGlobal && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 shadow-sm border border-slate-200 hover:text-blue-600"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/admin/especies/editar/${esp.id}`);
                      }}
                      title="Editar Espécie"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 shadow-sm border border-slate-200 hover:text-red-600"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          title="Excluir Espécie"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir {esp.nomePopular}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cuidado: Esta ação só funcionará se a espécie não
                            tiver doenças ou pacientes vinculados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={(e) => {
                              e.preventDefault();
                              deleteMutation.mutate(esp.id!);
                            }}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <PawPrint className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            Nenhuma espécie encontrada.
          </p>
        </div>
      )}
    </div>
  );
}
