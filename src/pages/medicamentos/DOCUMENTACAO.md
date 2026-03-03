## pages\medicamentos

### CatalogoMedicamentos.tsx

```typescript
// pages\medicamentos\CatalogoMedicamentos.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicamentosService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Pill,
  FlaskConical,
  Factory,
  Edit,
  Plus,
  Trash2,
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

export function CatalogoMedicamentos() {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();

  const isGlobal = user?.scope === "GLOBAL";

  const { data: farmacos, isLoading } = useQuery({
    queryKey: ["medicamentos-catalogo"],
    queryFn: async () => {
      try {
        const res = await medicamentosService.listarMedicamentos();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await medicamentosService.deletarMedicamento(id);
    },
    onSuccess: () => {
      toast.success("Medicamento excluído.");
      queryClient.invalidateQueries({ queryKey: ["medicamentos-catalogo"] });
    },
    onError: () => toast.error("Não foi possível excluir (item em uso)."),
  });

  const filtrados = farmacos?.filter(
    (f) =>
      (f.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
      (f.fabricante || "").toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Pill className="h-8 w-8 text-blue-600" /> Catálogo Farmacológico
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Base oficial de medicamentos.
          </p>
        </div>

        {isGlobal && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2"
            onClick={() => navigate("/admin/medicamentos/novo")}
          >
            <Plus className="h-4 w-4" /> Novo Medicamento
          </Button>
        )}
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Buscar..."
          className="pl-11 h-12 text-base"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-24 text-slate-400">Carregando...</div>
      ) : filtrados && filtrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((med) => (
            <Card
              key={med.id}
              // CORREÇÃO: Cursor pointer e onClick no Card
              className="group relative overflow-hidden border border-slate-200 bg-white hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer hover:-translate-y-1"
              onClick={() => navigate(`/medicamentos/${med.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-slate-600 bg-slate-50"
                  >
                    {med.concentracao || "N/A"}
                  </Badge>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-xl text-slate-800 leading-tight">
                    {med.nome}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Factory className="h-3.5 w-3.5" />{" "}
                    <span>{med.fabricante || "Genérico"}</span>
                  </div>
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
                        navigate(`/admin/medicamentos/editar/${med.id}`)
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
                          <AlertDialogTitle>
                            Excluir Medicamento?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={() => deleteMutation.mutate(med.id!)}
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
          <p className="text-slate-500">Nenhum medicamento encontrado</p>
        </div>
      )}
    </div>
  );
}

```

### DetalhesMedicamentos.tsx

```typescript
// pages\medicamentos\DetalhesMedicamentos.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  medicamentosService,
  contraindicacoesService,
  speciesService,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Pill,
  AlertTriangle,
  FlaskConical,
  Calculator,
  ShieldCheck,
  Info,
} from "lucide-react";
// CORREÇÃO: Usar a Calculadora Segura
import { CalculadoraSegura } from "../atendimentos/components/CalculadoraSegura";
import { toast } from "sonner";

export function DetalhesMedicamento() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Busca Dados do Medicamento
  const { data: medicamento, isLoading: loadingMed } = useQuery({
    queryKey: ["medicamento", id],
    queryFn: async () => {
      if (!id) return null;
      return (await medicamentosService.buscarMedicamentoPorId(id)).data.dados;
    },
    enabled: !!id,
  });

  // 2. Busca Riscos
  const { data: riscos } = useQuery({
    queryKey: ["riscos-medicamento", id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const res =
          await contraindicacoesService.listarContraindicacoesPorMedicamento(
            id,
          );
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
    enabled: !!id,
  });

  // 3. Busca Espécies (Lookup Map para traduzir ID -> Nome)
  const { data: especiesMap } = useQuery({
    queryKey: ["especies-lookup"],
    queryFn: async () => {
      const res = await speciesService.listarEspecies();
      const map: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.data.dados?.forEach((e: any) => {
        map[e.id] = e.nomePopular;
      });
      return map;
    },
  });

  if (loadingMed || !medicamento) {
    return (
      <div className="p-20 text-center text-slate-400 animate-pulse">
        Carregando bula...
      </div>
    );
  }

  const principioNome =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (medicamento as any).principioAtivoNome || "Princípio Ativo";

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="pl-0 text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Catálogo
      </Button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start gap-6 border-b border-slate-200 pb-8">
        <div className="h-24 w-24 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
          <Pill className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {medicamento.nome}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant="secondary"
              className="text-sm px-3 py-1 bg-slate-100 text-slate-700 border-slate-200"
            >
              {medicamento.concentracao || "Concentração N/A"}
            </Badge>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">
              {medicamento.fabricante || "Fabricante não informado"}
            </span>
          </div>
          <p className="text-slate-500 mt-3 flex items-center gap-2 text-sm bg-blue-50/50 px-3 py-1.5 rounded-lg w-fit border border-blue-100">
            <FlaskConical className="h-4 w-4 text-blue-500" />
            Princípio Ativo:{" "}
            <strong className="text-slate-700">{principioNome}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: INFORMAÇÕES E RISCOS */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD DE SEGURANÇA */}
          <Card
            className={`shadow-sm overflow-hidden ${riscos && riscos.length > 0 ? "border-l-4 border-l-red-500" : "border-l-4 border-l-emerald-500"}`}
          >
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                {riscos && riscos.length > 0 ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-500" />{" "}
                    Contraindicações & Riscos
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-500" /> Perfil
                    de Segurança
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {riscos && riscos.length > 0 ? (
                  riscos.map((r) => {
                    // Traduz ID para Nome
                    const nomeEspecie = especiesMap
                      ? especiesMap[r.especieId!]
                      : "Espécie ID: " + r.especieId?.slice(0, 8);

                    return (
                      <div
                        key={r.id}
                        className="flex flex-col sm:flex-row sm:items-start gap-4 bg-red-50 p-4 rounded-lg border border-red-100 shadow-sm"
                      >
                        <Badge
                          className={`w-fit shrink-0 ${r.gravidade === "FATAL" ? "bg-red-700" : "bg-orange-500"}`}
                        >
                          {r.gravidade}
                        </Badge>
                        <div>
                          <p className="font-bold text-red-900 text-sm mb-1 flex items-center gap-2">
                            Restrição para:{" "}
                            <span className="underline decoration-red-300">
                              {nomeEspecie || "Carregando..."}
                            </span>
                          </p>
                          <p className="text-sm text-red-800 mt-1 leading-relaxed">
                            {r.descricao}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-4 text-emerald-800 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="font-bold">
                        Nenhum risco específico cadastrado.
                      </p>
                      <p className="text-xs opacity-80 mt-1">
                        Este medicamento não possui contraindicações fatais
                        registradas nesta base para as espécies cadastradas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* DADOS TÉCNICOS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                <Info className="h-5 w-5 text-blue-500" /> Dados Farmacológicos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Forma Farmacêutica
                  </span>
                  <p className="font-medium text-slate-900">
                    {medicamento.formaFarmaceutica || "---"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Grupo
                  </span>
                  <p className="font-medium text-slate-900">
                    Vide Princípio Ativo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: CALCULADORA RÁPIDA (SEGURA) */}
        <div>
          <Card className="sticky top-6 border-indigo-100 bg-indigo-50/30 shadow-sm overflow-hidden">
            <div className="h-2 bg-indigo-500 w-full"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
                <Calculator className="h-5 w-5" /> Simular Dose
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* COMPONENTE SUBSTITUÍDO: CalculadoraSegura com pré-seleção */}
              <CalculadoraSegura
                onCopiarParaProntuario={(t) => {
                  navigator.clipboard.writeText(t);
                  toast.success("Copiado para área de transferência!");
                }}
                medicamentoIdPreSelecionado={medicamento.id} // <--- Passa o ID para pré-selecionar
              />

              <div className="mt-4 p-3 bg-white rounded border border-indigo-100 text-xs text-center text-indigo-600">
                Esta é uma simulação. Para salvar no prontuário, utilize a aba{" "}
                <strong>Atendimentos</strong>.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

```

