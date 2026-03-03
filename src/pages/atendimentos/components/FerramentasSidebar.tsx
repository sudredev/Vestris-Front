import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Syringe,
  BookOpen,
  ExternalLink,
  Stethoscope,
  Pill,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalculadoraSegura } from "./CalculadoraSegura";
import { BuscadorProtocolos } from "./BuscadorDeProtocolos";
import { FerramentaExame } from "./FerramentaExame";
import { BuscadorFarmacos } from "./BuscadorFarmacos";
import { HistoricoLateral } from "./HistoricoLateral";

interface Props {
  onInject: (
    text: string,
    targetField?:
      | "exameFisico"
      | "condutaClinica"
      | "historicoClinico"
      | "queixaPrincipal",
  ) => void;
  especieId?: string;
  nomeEspecie?: string;
  pacienteId?: string;
  atendimentoId?: string;
}

export function FerramentasSidebar({
  onInject,
  especieId,
  nomeEspecie,
  pacienteId,
  atendimentoId,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white border-l shadow-xl shadow-slate-200/50 z-20 w-full">
      <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
          Ferramentas
        </h2>
      </div>

      <Tabs
        defaultValue="calc"
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* LISTA DE ABAS */}
        <TabsList className="w-full justify-start rounded-none border-b bg-white p-0 h-10 shrink-0 overflow-x-auto">
          <TabsTrigger
            value="calc"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 text-xs h-10 px-2 min-w-[60px]"
          >
            <Calculator className="w-3 h-3 mr-1 md:mr-2" /> Calc
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 text-xs h-10 px-2 min-w-[60px]"
            disabled={!pacienteId}
          >
            <Clock className="w-3 h-3 mr-1 md:mr-2" /> Hist.
          </TabsTrigger>
          <TabsTrigger
            value="meds"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 text-xs h-10 px-2 min-w-[60px]"
          >
            <Pill className="w-3 h-3 mr-1 md:mr-2" /> Meds
          </TabsTrigger>
          <TabsTrigger
            value="exame"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 text-xs h-10 px-2 min-w-[60px]"
            disabled={!especieId}
          >
            <Stethoscope className="w-3 h-3 mr-1 md:mr-2" /> Exame
          </TabsTrigger>
          <TabsTrigger
            value="protos"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 text-xs h-10 px-2 min-w-[60px]"
            disabled={!especieId}
          >
            <Syringe className="w-3 h-3 mr-1 md:mr-2" /> Protoc.
          </TabsTrigger>
          <TabsTrigger
            value="refs"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 text-xs h-10 px-2 min-w-[60px]"
          >
            <BookOpen className="w-3 h-3 mr-1 md:mr-2" /> Biblio
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-3 bg-white/50">
          <TabsContent
            value="calc"
            className="mt-0 h-full animate-in fade-in slide-in-from-right-2 duration-200"
          >
            {/* COMPONENTE SUBSTITUÍDO */}
            <CalculadoraSegura
              onCopiarParaProntuario={(t) => onInject(t, "condutaClinica")}
              especieIdPreSelecionada={especieId}
              nomeEspecie={nomeEspecie}
            />
          </TabsContent>

          <TabsContent
            value="history"
            className="mt-0 h-full animate-in fade-in slide-in-from-right-2 duration-200"
          >
            <HistoricoLateral
              pacienteId={pacienteId}
              atendimentoAtualId={atendimentoId}
              onInject={onInject}
            />
          </TabsContent>

          {/* ABA DE MEDICAMENTOS (AGORA COM ESPECIE ID) */}
          <TabsContent
            value="meds"
            className="mt-0 h-full animate-in fade-in slide-in-from-right-2 duration-200"
          >
            <BuscadorFarmacos
              onInject={(t) => onInject(t, "condutaClinica")}
              especieId={especieId} // <--- CORREÇÃO AQUI
            />
          </TabsContent>

          <TabsContent
            value="exame"
            className="mt-0 h-full animate-in fade-in slide-in-from-right-2 duration-200"
          >
            <FerramentaExame
              especieId={especieId}
              nomeEspecie={nomeEspecie}
              onInject={(t) => onInject(t, "exameFisico")}
            />
          </TabsContent>

          <TabsContent
            value="protos"
            className="mt-0 h-full animate-in fade-in slide-in-from-right-2 duration-200"
          >
            {especieId ? (
              <BuscadorProtocolos
                especieId={especieId}
                onInject={(t) => onInject(t, "condutaClinica")}
              />
            ) : (
              <div className="text-center text-slate-400 mt-10 text-xs">
                Identificando espécie...
              </div>
            )}
          </TabsContent>

          <TabsContent value="refs" className="mt-0 space-y-4">
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600 mb-2">
                Biblioteca Clínica
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open("/biblioteca", "_blank")}
              >
                <ExternalLink className="h-3 w-3" /> Abrir em Nova Aba
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
