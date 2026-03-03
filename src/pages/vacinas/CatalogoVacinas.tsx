/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  vacinasService,
  speciesService,
  vaccinationProtocolsService, // <--- Importe o novo serviço
} from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Syringe,
  ShieldCheck,
  Factory,
  Edit,
  Plus,
  Trash2,
  Biohazard,
  FlaskConical,
  Filter,
  PawPrint,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

export function CatalogoVacinas() {
  const [busca, setBusca] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("TODAS"); // <--- Estado do Filtro

  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();

  const isGlobal = user?.scope === "GLOBAL";

  // 1. Busca Vacinas (Catálogo Completo)
  const { data: vacinas, isLoading: loadingVacinas } = useQuery({
    queryKey: ["vacinas-catalogo"],
    queryFn: async () => {
      try {
        const res = await vacinasService.listarVacinas();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  // 2. Busca Espécies (Para o Dropdown)
  const { data: especies } = useQuery({
    queryKey: ["especies-select"],
    queryFn: async () => {
      try {
        const res = await speciesService.listarEspecies();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  // 3. Busca Protocolos da Espécie Selecionada (Para saber quais vacinas filtrar)
  const { data: protocolosDaEspecie, isLoading: loadingProtoc } = useQuery({
    queryKey: ["protocolos-filtro", filtroEspecie],
    queryFn: async () => {
      if (filtroEspecie === "TODAS") return null;
      try {
        const res =
          await vaccinationProtocolsService.listarProtocolosPorEspecie(
            filtroEspecie,
          );
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
    enabled: filtroEspecie !== "TODAS", // Só roda se tiver espécie selecionada
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await vacinasService.deletarVacina(id);
    },
    onSuccess: () => {
      toast.success("Vacina excluída.");
      queryClient.invalidateQueries({ queryKey: ["vacinas-catalogo"] });
    },
    onError: () => toast.error("Não foi possível excluir (item em uso)."),
  });

  // --- LÓGICA DE FILTRAGEM AVANÇADA ---
  const filtrados = vacinas?.filter((v) => {
    // 1. Filtro de Texto (Nome, Doença, Fabricante)
    const termo = busca.toLowerCase();
    const matchTexto =
      (v.nome || "").toLowerCase().includes(termo) ||
      (v.doencaAlvo || "").toLowerCase().includes(termo) ||
      (v.fabricante || "").toLowerCase().includes(termo);

    // 2. Filtro de Espécie
    // Se for TODAS, passa sempre.
    // Se tiver espécie selecionada, verifica se o ID da vacina está na lista de protocolos daquela espécie.
    let matchEspecie = true;
    if (filtroEspecie !== "TODAS" && protocolosDaEspecie) {
      // Verifica se existe algum protocolo para esta espécie que use esta vacina (v.id)
      // O DTO do protocolo tem o campo `vacinaId`
      matchEspecie = protocolosDaEspecie.some((p: any) => p.vacinaId === v.id);
    }

    return matchTexto && matchEspecie;
  });

  const isLoading =
    loadingVacinas || (filtroEspecie !== "TODAS" && loadingProtoc);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Syringe className="h-8 w-8 text-amber-600" /> Catálogo de
            Imunobiológicos
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Base oficial de vacinas e soros.
          </p>
        </div>

        {isGlobal && (
          <Button
            className="bg-amber-600 hover:bg-amber-700 shadow-sm gap-2 text-white"
            onClick={() => navigate("/admin/vacinas/novo")}
          >
            <Plus className="h-4 w-4" /> Nova Vacina
          </Button>
        )}
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* BUSCA TEXTUAL */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome, doença alvo ou laboratório..."
            className="pl-11 h-11 text-base bg-white border-slate-200"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* FILTRO DE ESPÉCIE */}
        <div className="w-full md:w-72">
          <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
            <SelectTrigger className="h-11 bg-white border-slate-200">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por indicação..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas as Espécies</SelectItem>
              {especies?.map((esp: any) => (
                <SelectItem key={esp.id} value={esp.id}>
                  {esp.nomePopular}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LISTAGEM */}
      {isLoading ? (
        <div className="text-center py-24 text-slate-400 flex flex-col items-center">
          <Biohazard className="h-10 w-10 animate-pulse mb-4 opacity-50" />
          <p>Carregando catálogo...</p>
        </div>
      ) : filtrados && filtrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((vac) => (
            <Card
              key={vac.id}
              className="group relative overflow-hidden border border-slate-200 bg-white hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer hover:-translate-y-1"
              onClick={() => navigate(`/vacinas/${vac.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-slate-600 bg-slate-100 border-slate-200"
                  >
                    {vac.tipoVacina || "Tipo N/A"}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-xl text-slate-800 leading-tight">
                    {vac.nome}
                  </h3>

                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-medium text-slate-700">
                      Alvo: {vac.doencaAlvo}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                    <Factory className="h-3 w-3" />
                    <span>{vac.fabricante || "Laboratório não informado"}</span>
                  </div>

                  {/* Mostra tag se estiver filtrando por espécie */}
                  {filtroEspecie !== "TODAS" && (
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-xs font-medium text-emerald-700">
                      <PawPrint className="h-3 w-3" /> Indicado para esta
                      espécie
                    </div>
                  )}
                </div>

                {isGlobal && (
                  <div
                    className="pt-4 border-t border-slate-100 flex justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-600"
                      onClick={() =>
                        navigate(`/admin/vacinas/editar/${vac.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Vacina?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso removerá a vacina do catálogo. Se houver
                            histórico de aplicações, a exclusão será bloqueada
                            pelo servidor.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={() => deleteMutation.mutate(vac.id!)}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Biohazard className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-700">
            Nenhuma vacina encontrada
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {filtroEspecie !== "TODAS"
              ? "Não há vacinas cadastradas nos protocolos desta espécie."
              : "Tente buscar por outro termo."}
          </p>
          {filtroEspecie !== "TODAS" && (
            <Button
              variant="link"
              onClick={() => setFiltroEspecie("TODAS")}
              className="mt-2 text-amber-600"
            >
              Limpar filtro de espécie
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
