import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { diseasesService, protocolsService } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Copy, AlertCircle } from "lucide-react"; // Syringe removido
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
  especieId: string;
  onInject: (texto: string) => void;
}

export function BuscadorProtocolos({ especieId, onInject }: Props) {
  const [busca, setBusca] = useState("");

  // 1. Busca Doenças da Espécie
  const { data: doencas, isLoading } = useQuery({
    queryKey: ["doencas-busca", especieId],
    queryFn: async () => {
      if (!especieId) return [];
      const res = await diseasesService.listarDoencasPorEspecie(especieId);
      return res.data.dados || [];
    },
    enabled: !!especieId,
  });

  // Filtro local
  const filtradas = doencas?.filter((d) =>
    d.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  // Componente interno para carregar protocolos ao expandir a doença
  const ListaProtocolos = ({
    doencaId,
    nomeDoenca,
  }: {
    doencaId: string;
    nomeDoenca: string;
  }) => {
    const { data: protocolos, isLoading: loadingProto } = useQuery({
      queryKey: ["protos", doencaId],
      queryFn: async () =>
        (await protocolsService.listarProtocolosPorDoenca(doencaId)).data
          .dados || [],
    });

    if (loadingProto)
      return (
        <p className="text-xs text-slate-400 p-2">Carregando protocolos...</p>
      );

    if (!protocolos?.length)
      return (
        <p className="text-xs text-slate-400 p-2 italic">
          Sem protocolos cadastrados para esta doença.
        </p>
      );

    return (
      <div className="space-y-3 pt-2">
        {protocolos.map((proto) => (
          <div
            key={proto.id}
            className="bg-slate-50 p-3 rounded border border-slate-100 text-sm hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-800 text-sm">{proto.titulo}</p>
              <Badge variant="outline" className="text-[10px]">
                Oficial
              </Badge>
            </div>

            {proto.observacoes && (
              <p className="text-slate-600 text-xs mb-3 italic">
                Obs: {proto.observacoes}
              </p>
            )}

            <Button
              size="sm"
              variant="secondary"
              className="w-full h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              onClick={() => {
                // Formata o texto bonito para o prontuário
                const texto = `
📘 PROTOCOLO APLICADO
Doença: ${nomeDoenca}
Protocolo: ${proto.titulo}
Itens:
${
  proto.dosagens
    ?.map((d) => `- ${d.nomeMedicamento}: ${d.dose} (${d.detalhes})`)
    .join("\n") || "Ver detalhes no sistema"
}
--------------------------`.trim();

                onInject(texto);
                toast.success("Protocolo inserido no prontuário!");
              }}
            >
              <Copy className="h-3 w-3 mr-2" /> Usar no Prontuário
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar doença (ex: Psitacose)..."
          className="pl-8 bg-white"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center py-4 text-xs text-slate-400">
            Carregando índice...
          </div>
        ) : filtradas?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma doença encontrada.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filtradas?.map((d) => (
              <AccordionItem key={d.id} value={d.id!}>
                <AccordionTrigger className="text-sm font-medium text-left px-1 hover:no-underline hover:bg-slate-50 rounded">
                  {d.nome}
                </AccordionTrigger>
                <AccordionContent>
                  <ListaProtocolos doencaId={d.id!} nomeDoenca={d.nome!} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
