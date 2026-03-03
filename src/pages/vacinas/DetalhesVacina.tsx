import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { vacinasService } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Syringe,
  Info,
  ShieldAlert,
  Factory,
  CheckCircle2,
} from "lucide-react";

export function DetalhesVacina() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Busca Dados da Vacina
  const { data: vacina, isLoading } = useQuery({
    queryKey: ["vacina-detalhe", id],
    queryFn: async () => {
      if (!id) return null;
      return (await vacinasService.buscarVacinaPorId(id)).data.dados;
    },
    enabled: !!id,
  });

  if (isLoading || !vacina) {
    return (
      <div className="p-20 text-center text-slate-400 animate-pulse">
        Carregando informações do imunobiológico...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/vacinas")} // Rota do catálogo
        className="pl-0 text-slate-500 hover:text-slate-900 gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o Catálogo
      </Button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start gap-6 border-b border-slate-200 pb-8">
        <div className="h-24 w-24 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm shrink-0">
          <Syringe className="h-10 w-10 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {vacina.nome}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge
              variant="outline"
              className="text-sm px-3 py-1 bg-white text-slate-700 border-slate-300 flex items-center gap-2"
            >
              <Factory className="h-3 w-3" />
              {vacina.fabricante || "Fabricante N/A"}
            </Badge>
            <span className="text-slate-300">•</span>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
              {vacina.tipoVacina || "Tipo N/A"}
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit">
            <ShieldAlert className="h-4 w-4 text-emerald-600" />
            <span>
              Proteção contra: <strong>{vacina.doencaAlvo}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: DESCRIÇÃO */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                <Info className="h-5 w-5 text-blue-500" /> Descrição Técnica
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 text-sm leading-relaxed">
              {vacina.descricao ? (
                <p className="whitespace-pre-line">{vacina.descricao}</p>
              ) : (
                <p className="italic text-slate-400">
                  Sem descrição cadastrada.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: INFO RÁPIDA */}
        <div className="space-y-6">
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase text-slate-500 font-bold tracking-wider">
                Status no Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Ativo para uso
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Disponível para seleção em protocolos vacinais e registro em
                prontuário.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
