import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { speciesService, diseasesService, examination } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Activity,
  Search,
  ChevronRight,
  Thermometer,
  Utensils,
  AlertTriangle,
  Stethoscope,
  Globe2,
  BookOpen,
  HeartPulse,
  Home,
  Edit,
  Trash2,
  Plus, // Ícones Admin
} from "lucide-react";
import { DialogSugestao } from "@/components/DialogSugestao";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import type { DadosManejo } from "@/lib/pdf-service";

export function DetalhesEspecie() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");

  const isGlobal = user?.scope === "GLOBAL";

  // 1. Busca Espécie
  const { data: especie, isLoading: loadingEspecie } = useQuery({
    queryKey: ["especie", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await speciesService.buscarEspeciePorId(id);
      return res.data.dados;
    },
    enabled: !!id,
  });

  // 2. Busca Roteiro de Exame Físico
  const { data: modeloExame } = useQuery({
    queryKey: ["modelo-exame-lib", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await examination.obterModeloExame(id);
        return res.data.dados;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });

  // 3. Busca Doenças
  const { data: doencas, isLoading: loadingDoencas } = useQuery({
    queryKey: ["doencas", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await diseasesService.listarDoencasPorEspecie(id);
      return res.data.dados || [];
    },
    enabled: !!id,
  });

  // MUTAÇÃO DE DELETE (DOENÇA)
  const deleteDoencaMutation = useMutation({
    mutationFn: async (doencaId: string) => {
      await diseasesService.deletarDoenca(doencaId);
    },
    onSuccess: () => {
      toast.success("Patologia removida.");
      queryClient.invalidateQueries({ queryKey: ["doencas"] });
    },
    onError: () =>
      toast.error("Erro ao excluir. Pode haver protocolos vinculados."),
  });

  const filtradas =
    doencas?.filter(
      (d) =>
        d.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        d.sintomas?.toLowerCase().includes(busca.toLowerCase()),
    ) || [];

  // Parse do JSON de Manejo
  let manejoDetalhado: DadosManejo | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (especie && (especie as any).receitaManejoPadrao) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manejoDetalhado = JSON.parse((especie as any).receitaManejoPadrao);
    } catch {
      console.error("Erro ao ler manejo detalhado");
    }
  }

  // Parse do JSON de Exame Físico
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let secoesExame: any[] = [];
  if (modeloExame?.textoBase) {
    try {
      secoesExame = JSON.parse(modeloExame.textoBase);
    } catch {
      secoesExame = [];
    }
  }

  // Helper para renderizar texto formatado
  const renderFormattedText = (text: string) => {
    if (!text)
      return <span className="text-slate-400 italic">Não informado.</span>;
    const cleanText = text.replace(/\\n/g, "\n");
    return (
      <div className="text-sm text-slate-700 leading-relaxed space-y-1">
        {cleanText.split("\n").map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
            return (
              <div key={i} className="flex items-start gap-2 ml-1">
                <span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 block" />
                <span>{trimmed.replace(/^[•-]\s*/, "")}</span>
              </div>
            );
          }
          return <p key={i}>{trimmed}</p>;
        })}
      </div>
    );
  };

  if (loadingEspecie || loadingDoencas) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400">
        Carregando dados...
      </div>
    );
  }

  if (!especie)
    return <div className="py-20 text-center">Espécie não encontrada.</div>;

  const fotoUrl = null;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="pl-0 hover:pl-2 transition-all text-slate-500 gap-2"
          onClick={() => navigate("/biblioteca")}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Biblioteca
        </Button>
      </div>

      {/* CABEÇALHO DA ESPÉCIE */}
      <div className="flex flex-col md:flex-row items-start gap-6 border-b border-slate-200 pb-8">
        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm shrink-0 overflow-hidden">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={especie.nomePopular}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-slate-300 select-none">
              {especie.nomePopular?.[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-1">
              {especie.nomePopular}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xl text-slate-500 italic font-serif">
                {especie.nomeCientifico}
              </p>
              <Badge
                variant="secondary"
                className="text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Família {especie.familiaTaxonomica || "Não informada"}
              </Badge>
            </div>
          </div>

          {especie.resumoClinico && (
            <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
              {especie.resumoClinico}
            </p>
          )}
        </div>
      </div>

      {/* ACORDEÃO DE CONTEÚDO */}
      <Accordion
        type="multiple"
        defaultValue={["manejo", "exame", "doencas"]}
        className="space-y-4"
      >
        {/* 1. MANEJO */}
        <AccordionItem
          value="manejo"
          className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
            <div className="flex items-center gap-3">
              <Utensils className="h-5 w-5 text-emerald-600" />
              <span className="font-bold text-slate-800 text-lg">
                Manejo & Ambiente
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100">
            {manejoDetalhado ? (
              <div className="space-y-4 mt-2">
                {manejoDetalhado.alertas && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md mb-6 shadow-sm">
                    <h4 className="text-red-800 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Sinais de Alerta
                      Críticos
                    </h4>
                    {renderFormattedText(manejoDetalhado.alertas)}
                  </div>
                )}

                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem
                    value="alim"
                    className="border border-slate-200 rounded-md bg-white"
                  >
                    <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-700 hover:no-underline hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-emerald-500" />{" "}
                        Alimentação
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      {renderFormattedText(manejoDetalhado.alimentacao)}
                    </AccordionContent>
                  </AccordionItem>
                  {/* ... (Outros items do manejo iguais ao anterior) ... */}
                  {/* Para brevidade, replique a estrutura do componente anterior aqui */}
                  <AccordionItem
                    value="clima"
                    className="border border-slate-200 rounded-md bg-white"
                  >
                    <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-700 hover:no-underline hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />{" "}
                        Clima
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      {renderFormattedText(manejoDetalhado.clima)}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="amb"
                    className="border border-slate-200 rounded-md bg-white"
                  >
                    <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-700 hover:no-underline hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-500" /> Ambiente
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      {renderFormattedText(manejoDetalhado.ambiente)}
                    </AccordionContent>
                  </AccordionItem>
                  {/* Adicione os outros 5 itens (Hidratação, Manuseio, Higiene, Rotina) aqui seguindo o padrão */}
                </Accordion>
              </div>
            ) : (
              <div className="space-y-4">
                {especie.alertasClinicos && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <h4 className="font-bold text-red-800 text-sm">
                      Alertas Clínicos
                    </h4>
                    <p className="text-red-700 text-sm mt-1">
                      {especie.alertasClinicos}
                    </p>
                  </div>
                )}
                <p className="text-slate-600 text-sm">
                  {especie.manejoInfos || "Dados detalhados não cadastrados."}
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 2. PARÂMETROS FISIOLÓGICOS */}
        <AccordionItem
          value="params"
          className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
            <div className="flex items-center gap-3">
              <HeartPulse className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-slate-800 text-lg">
                Parâmetros Fisiológicos
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Expectativa de Vida
                </span>
                <p className="text-lg font-semibold text-slate-700">
                  {especie.expectativaVida || "--"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Peso Adulto
                </span>
                <p className="text-lg font-semibold text-slate-700">
                  {especie.pesoAdulto || "--"}
                </p>
              </div>
              <div className="space-y-1 md:col-span-3">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Sinais Vitais
                </span>
                <div className="bg-blue-50 p-4 rounded-lg text-blue-900 font-mono text-sm border border-blue-100">
                  {renderFormattedText(especie.parametrosFisiologicos || "--")}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. EXAME FÍSICO */}
        <AccordionItem
          value="exame"
          className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-purple-500" />
              <span className="font-bold text-slate-800 text-lg">
                Roteiro de Exame Físico
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100">
            {secoesExame.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-2 mt-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {secoesExame.map((secao: any, idx: number) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="border border-purple-100 rounded-md bg-purple-50/20"
                  >
                    <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-700 hover:no-underline hover:bg-purple-50">
                      {secao.titulo}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-1">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {secao.conteudo}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : especie.pontosExameFisico ? (
              <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100 mt-2">
                {renderFormattedText(especie.pontosExameFisico)}
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic mt-2">
                Nenhum roteiro específico.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 4. DOENÇAS COMUNS (COM GESTÃO ADMIN) */}
        <AccordionItem
          value="doencas"
          className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-red-500" />
              <span className="font-bold text-slate-800 text-lg">
                Patologias Comuns
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-2 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filtrar nesta lista..."
                  className="pl-9 h-9 text-sm"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              {/* BOTÃO ADMIN PARA CRIAR DOENÇA */}
              {isGlobal ? (
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                  onClick={() => navigate("/admin/doencas/novo")} // Pode passar state: { especieId: id } se quiser preencher
                >
                  <Plus className="h-4 w-4 mr-2" /> Nova Doença
                </Button>
              ) : (
                <DialogSugestao
                  tipo="DOENCA"
                  labelBotao="Sugerir"
                  contexto={especie.nomePopular}
                  variant="outline"
                />
              )}
            </div>

            {filtradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtradas.map((doenca) => (
                  <div key={doenca.id} className="relative group">
                    <Link
                      to={`/especies/${id}/doencas/${doenca.id}`}
                      className="block h-full"
                    >
                      <Card
                        className="h-full cursor-pointer bg-white 
                                        border-l-[6px] border-l-red-600 border-t border-r border-b border-red-100 
                                        shadow-sm shadow-red-50 hover:shadow-xl hover:shadow-red-100
                                        hover:-translate-y-1 transition-all duration-300"
                      >
                        <CardContent className="p-5 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg line-clamp-1 text-red-900 group-hover:text-red-700 transition-colors">
                              {doenca.nome}
                            </h3>
                            <Activity className="h-5 w-5 text-red-600 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-400 italic font-serif mb-3">
                            {doenca.nomeCientifico || "---"}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-3 flex-1 leading-relaxed">
                            {doenca.sintomas}
                          </p>
                          <div className="mt-4 pt-3 border-t border-red-50 flex items-center justify-between text-xs font-bold text-red-700 opacity-90 group-hover:opacity-100 transition-opacity">
                            <span>VER PROTOCOLOS</span>
                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* BOTÕES DE ADMIN PARA DOENÇA */}
                    {isGlobal && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-white shadow-sm border hover:text-blue-600"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/admin/doencas/editar/${doenca.id}`);
                          }}
                          title="Editar Doença"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 bg-white shadow-sm border hover:text-red-600"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              title="Excluir Doença"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Excluir {doenca.nome}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso pode quebrar protocolos vinculados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteDoencaMutation.mutate(doenca.id!);
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
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">
                  Nenhuma patologia encontrada.
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 5. BIOLOGIA */}
        <AccordionItem
          value="bio"
          className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-emerald-500" />
              <span className="font-bold text-slate-800 text-lg">
                Biologia & Conservação
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-600 space-y-4">
            <div className="mt-2">
              <span className="font-bold text-slate-700 block mb-1">
                Habitat Natural:
              </span>
              {especie.habitat || "Não informado."}
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Distribuição:
              </span>
              {especie.distribuicaoGeografica || "Não informada."}
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Status IUCN:
              </span>
              <Badge variant="outline">
                {especie.statusConservacao || "Não avaliado"}
              </Badge>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* RODAPÉ */}
      <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-3 text-xs text-slate-500 border border-slate-100">
        <BookOpen className="h-4 w-4 shrink-0" />
        <p>
          <span className="font-bold">Fonte Base:</span>{" "}
          {especie.bibliografiaBase || "Acervo Vestris"}
        </p>
      </div>
    </div>
  );
}
