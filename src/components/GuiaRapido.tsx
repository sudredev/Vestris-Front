// src/components/GuiaRapido.tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function GuiaRapido() {
  const passos = [
    {
      titulo: "1. Cadastre seus Pacientes",
      desc: "Comece registrando o tutor e o animal na aba 'Pacientes'. O peso e a espécie são cruciais para os cálculos.",
    },
    {
      titulo: "2. Inicie um Atendimento",
      desc: "Na 'Agenda', clique em 'Novo Agendamento' ou 'Atender Agora' para abrir o cockpit clínico.",
    },
    {
      titulo: "3. Use as Ferramentas",
      desc: "Dentro do atendimento, use a aba lateral para calcular doses, buscar protocolos oficiais e copiar textos prontos para o prontuário.",
    },
    {
      titulo: "4. Valide a Segurança",
      desc: "A calculadora alerta automaticamente sobre subdosagem, superdosagem ou contraindicações fatais para a espécie.",
    },
    {
      titulo: "5. Gere Documentos",
      desc: "Ao final, clique nos botões de 'Receita' ou 'Prontuário' para gerar PDFs formatados prontos para impressão.",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-blue-600 gap-2"
        >
          <HelpCircle className="h-4 w-4" />{" "}
          <span className="hidden md:inline">Guia de Uso</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl text-slate-800">
            Como usar o Vestris
          </SheetTitle>
          <SheetDescription>
            Fluxo de trabalho recomendado para agilizar seu atendimento clínico.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {passos.map((p, i) => (
            <div key={i} className="flex gap-4 relative">
              {i !== passos.length - 1 && (
                <div className="absolute left-[11px] top-8 bottom-[-32px] w-[2px] bg-slate-100"></div>
              )}
              <div className="mt-1 shrink-0 bg-white z-10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  {p.titulo}
                </h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800 text-center">
          <p className="font-bold mb-2">Precisa de ajuda avançada?</p>
          <p className="mb-4 text-blue-600">
            Nossa equipe de suporte técnico veterinário está disponível.
          </p>
          <Button
            variant="outline"
            className="bg-white border-blue-200 text-blue-700 w-full"
            onClick={() => window.open("mailto:suporte@vestris.com")}
          >
            Fale com o Suporte <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
