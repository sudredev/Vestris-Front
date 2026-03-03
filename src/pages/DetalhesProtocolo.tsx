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
