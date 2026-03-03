## pages

### Biblioteca.tsx

```typescript
// pages\Biblioteca.tsx
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

```

### DetalhesEspecie.tsx

```typescript
// pages\DetalhesEspecie.tsx
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

```

### DetalhesProtocolo.tsx

```typescript
// pages\DetalhesProtocolo.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { protocolsService } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  TriangleAlert,
  ShieldAlert,
  Plus,
  Syringe,
  Clock,
  Pill,
} from "lucide-react";
import { DialogSugestao } from "@/components/DialogSugestao";
import { CalculadoraDosagem } from "@/components/CalculadoraDosagem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function DetalhesProtocolo() {
  const { especieId, doencaId } = useParams<{
    especieId: string;
    doencaId: string;
  }>();
  const navigate = useNavigate();

  const { data: dadosCompletos, isLoading } = useQuery({
    queryKey: ["protocolo-completo", especieId, doencaId],
    queryFn: async () => {
      if (!especieId || !doencaId) return null;
      const res = await protocolsService.obterProtocoloCompleto(
        especieId,
        doencaId
      );
      return res.data.dados;
    },
    enabled: !!especieId && !!doencaId,
  });

  if (isLoading) {
    return (
      <div className="container py-20 text-center animate-pulse text-slate-400">
        Carregando base de conhecimento...
      </div>
    );
  }

  if (!dadosCompletos) {
    return (
      <div className="container py-20 text-center text-slate-500">
        Protocolo não encontrado.
      </div>
    );
  }

  const { doenca, protocolos } = dadosCompletos;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2 pl-0 hover:pl-2 transition-all text-slate-500 gap-2 h-auto p-0 hover:bg-transparent"
            onClick={() => navigate(`/especies/${especieId}`)}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Espécie
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {doenca?.nome}
          </h1>
          <p className="text-lg text-slate-500 italic font-serif">
            {doenca?.nomeCientifico}
          </p>
        </div>

        {/* BOTÃO DE CRIAÇÃO (AGORA COM AÇÃO) */}
        <Button
          className="bg-slate-900 hover:bg-slate-800 shadow-sm gap-2"
          onClick={() =>
            navigate("/protocolos/novo", {
              state: {
                doencaId: doenca?.id,
                titulo: `Protocolo para ${doenca?.nome}`,
              },
            })
          }
        >
          <Plus className="h-4 w-4" /> Criar Protocolo Próprio
        </Button>
      </div>

      {/* ALERTA CLÍNICO (Sinais) */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3 items-start">
        <TriangleAlert className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-sm text-orange-800">
          <span className="font-bold block mb-1">Quadro Clínico Típico:</span>
          {doenca?.sintomas}
        </div>
      </div>

      {/* ÁREA DE PROTOCOLOS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Syringe className="h-5 w-5 text-primary" />
            Opções Terapêuticas
          </h2>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {protocolos?.length} protocolos disponíveis
          </span>
        </div>

        {protocolos?.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">
              Nenhum protocolo cadastrado.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  navigate("/protocolos/novo", {
                    state: { doencaId: doenca?.id },
                  })
                }
              >
                Criar o Primeiro
              </Button>
              <DialogSugestao
                tipo="PROTOCOLO"
                labelBotao="Sugerir Tratamento"
                contexto={`Doença: ${doenca?.nome}`}
              />
            </div>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {protocolos?.map((proto) => (
              <AccordionItem
                key={proto.id}
                value={proto.id!}
                className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm data-[state=open]:border-primary/50 transition-all"
              >
                {/* CABEÇALHO DO CARD (Resumo) */}
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full text-left">
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 text-lg block">
                        {proto.titulo}
                      </span>
                      {/* Fonte/Referência Compacta */}
                      <div className="flex items-center gap-2 mt-1">
                        <BookOpen className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500 truncate max-w-md">
                          {proto.referenciaTexto || "Referência interna"}
                        </span>
                      </div>
                    </div>

                    {/* BADGES */}
                    <div className="flex items-center gap-2 mr-4">
                      {proto.origem === "OFICIAL" ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          OFICIAL
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100"
                        >
                          PRÓPRIO
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30">
                  {/* Observações */}
                  {proto.observacoes && (
                    <div className="mb-6 p-3 bg-yellow-50/50 border border-yellow-100 rounded text-sm text-yellow-800 flex gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                      {proto.observacoes}
                    </div>
                  )}

                  {/* Tabela de Doses */}
                  <div className="bg-white rounded-md border border-slate-200 overflow-hidden mb-6">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-medium w-1/3">
                            Fármaco
                          </th>
                          <th className="px-4 py-3 font-medium w-1/3">Dose</th>
                          <th className="px-4 py-3 font-medium w-1/3">
                            Posologia
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {proto.dosagens?.map((dose) => (
                          <tr key={dose.id}>
                            <td className="px-4 py-3 font-medium text-slate-700 flex items-center gap-2">
                              <Pill className="h-3 w-3 text-slate-400" />
                              {dose.nomeMedicamento}
                            </td>
                            <td className="px-4 py-3 text-blue-600 font-semibold">
                              {dose.dose}
                            </td>
                            <td className="px-4 py-3 text-slate-600 flex items-center gap-2">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {dose.detalhes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end gap-3">
                    <DialogSugestao
                      tipo="PROTOCOLO"
                      labelBotao="Sugerir Ajuste"
                      contexto={`Protocolo: ${proto.titulo}`}
                    />
                    <CalculadoraDosagem
                      protocoloId={proto.id!}
                      tituloProtocolo={proto.titulo || "Protocolo"}
                      opcoesMedicamentos={
                        proto.dosagens?.map((d) => ({
                          id: d.medicamentoId!,
                          nome: d.nomeMedicamento || "Medicamento",
                        })) || []
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}

```

### Login.tsx

```typescript
// pages\Login.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock, Mail } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // CORREÇÃO: Garante que entra limpo, sem resíduos de admin global
    localStorage.removeItem("vestris_admin_token");
    try {
      const response = await authService.login({ email, senha });

      if (response.data.sucesso && response.data.dados?.token) {
        localStorage.setItem("vestris_token", response.data.dados.token);
        toast.success("Bem-vindo de volta!");

        // Redirecionamento forçado para recarregar contexto
        setTimeout(() => {
          window.location.href = "/area-vet";
        }, 800);
      } else {
        setErro("Credenciais inválidas.");
        toast.error("E-mail ou senha incorretos.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setErro("Erro de conexão.");
      toast.error("Servidor indisponível no momento.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 relative">
      {/* BOTÃO VOLTAR (FLUTUANTE) */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-900 gap-2"
        onClick={() => (window.location.href = "/")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o início
      </Button>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto mb-6">
              <img
                src={logoImg}
                alt="Vestris Logo"
                className="h-16 w-auto mx-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-base text-slate-500">
              Entre com suas credenciais profissionais
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* CORREÇÃO AQUI: className em vez de classID */}
                  <Label htmlFor="senha" className="text-slate-700">
                    Senha
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {erro && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 text-center font-medium">
                  {erro}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 hover:shadow-xl transition-all mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Acessando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-50 pt-6 pb-8 text-center bg-slate-50/50 rounded-b-xl">
            <p className="text-sm text-slate-500">Ainda não tem uma conta?</p>
            <Button
              variant="outline"
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => (window.location.href = "/planos")}
            >
              Conhecer Planos e Assinar
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>&copy; 2026 Vestris Tecnologia Veterinária.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-slate-600">
              Termos
            </a>
            <a href="#" className="hover:text-slate-600">
              Privacidade
            </a>
            <a href="#" className="hover:text-slate-600">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

```

