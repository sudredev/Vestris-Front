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
