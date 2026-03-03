/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  medicamentosService,
  speciesService,
  calcService,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Calculator,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Syringe,
  Keyboard,
  Database,
  SearchX,
  Loader2,
  Star,
  Copy, // <--- IMPORTADO
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthUser } from "@/lib/auth";

const TODAS_VIAS = [
  "ORAL",
  "SC",
  "IM",
  "IV",
  "IO",
  "INALATORIA",
  "TOPICA",
  "OUTRA",
];

async function fetchViasSugeridas(medId: string, espId: string) {
  const token = localStorage.getItem("vestris_token");
  const res = await fetch(
    `http://localhost:8080/api/v1/medicamentos/${medId}/vias?especieId=${espId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) return [];
  return (await res.json()) as string[];
}

interface Props {
  onCopiarParaProntuario: (texto: string) => void;
  especieIdPreSelecionada?: string;
  nomeEspecie?: string;
  medicamentoIdPreSelecionado?: string;
  // NOVA PROP
  contexto?: "prontuario" | "avulso";
}

export function CalculadoraSegura({
  onCopiarParaProntuario,
  especieIdPreSelecionada,
  nomeEspecie,
  medicamentoIdPreSelecionado,
  contexto = "prontuario", // Padrão é prontuário (comportamento antigo)
}: Props) {
  const user = getAuthUser();

  const [modo, setModo] = useState<"catalogo" | "manual">("catalogo");
  const [medicamentoId, setMedicamentoId] = useState(
    medicamentoIdPreSelecionado || "",
  );
  const [especieId, setEspecieId] = useState(especieIdPreSelecionada || "");
  const [peso, setPeso] = useState("");
  const [unidadePeso, setUnidadePeso] = useState<"KG" | "G">("KG");
  const [dose, setDose] = useState("");

  const [nomeManual, setNomeManual] = useState("");
  const [concentracaoManual, setConcentracaoManual] = useState("");

  const [via, setVia] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [duracao, setDuracao] = useState("");

  const [resultado, setResultado] = useState<any | null>(null);

  const { data: especies } = useQuery({
    queryKey: ["especies-lista"],
    queryFn: async () =>
      (await speciesService.listarEspecies()).data.dados || [],
  });

  const { data: medicamentos } = useQuery({
    queryKey: ["medicamentos-lista"],
    queryFn: async () =>
      (await medicamentosService.listarMedicamentos()).data.dados || [],
  });

  const { data: viasSugeridas, isLoading: loadingVias } = useQuery({
    queryKey: ["vias-sugeridas", medicamentoId, especieId],
    queryFn: () => fetchViasSugeridas(medicamentoId, especieId),
    enabled: !!medicamentoId && !!especieId && modo === "catalogo",
  });

  useEffect(() => {
    if (viasSugeridas && viasSugeridas.length > 0) {
      if (!via || !viasSugeridas.includes(via)) {
        setVia(viasSugeridas[0]);
        if (viasSugeridas.length === 1) {
          toast.info(`Via ${viasSugeridas[0]} selecionada automaticamente.`);
        }
      }
    } else {
      // Opcional: Limpar via se mudar medicamento e não tiver sugestão
    }
  }, [viasSugeridas, medicamentoId]);

  useEffect(() => {
    if (especieIdPreSelecionada) setEspecieId(especieIdPreSelecionada);
  }, [especieIdPreSelecionada]);

  useEffect(() => {
    if (medicamentoIdPreSelecionado)
      setMedicamentoId(medicamentoIdPreSelecionado);
  }, [medicamentoIdPreSelecionado]);

  useEffect(() => {
    setResultado(null);
  }, [medicamentoId, especieId, dose, peso, concentracaoManual, via]);

  const calcularMutation = useMutation({
    mutationFn: async () => {
      if (!peso || !dose) throw new Error("Informe peso e dose.");

      if (modo === "catalogo" && !medicamentoId)
        throw new Error("Selecione o medicamento do catálogo.");

      if (modo === "catalogo" && !via) {
        throw new Error("Selecione a via de administração.");
      }

      const pesoNum = parseFloat(peso.replace(",", "."));
      const doseNum = parseFloat(dose.replace(",", "."));
      const unidadePesoStr = unidadePeso === "G" ? "G" : "KG";

      if (modo === "catalogo") {
        const payload = {
          medicamentoId: medicamentoId || undefined,
          especieId: especieId || undefined,
          peso: pesoNum,
          doseInformada: doseNum,
          unidadePeso: unidadePesoStr,
          via,
          frequencia: frequencia || undefined,
          duracao: duracao || undefined,
          clinicaId: user?.clinicaId,
          usuarioId: user?.id,
        };
        const res = await (calcService as any).validarDoseCatalogo(payload);
        return res.data.dados;
      } else {
        const payload = {
          nomeMedicamento: nomeManual,
          concentracao: parseFloat(concentracaoManual.replace(",", ".")),
          peso: pesoNum,
          doseInformada: doseNum,
          unidadePeso: unidadePesoStr,
          via,
          frequencia: frequencia || undefined,
          duracao: duracao || undefined,
          clinicaId: user?.clinicaId,
          usuarioId: user?.id,
        };
        const res = await (calcService as any).calcularDoseLivre(payload);
        return res.data.dados;
      }
    },
    onSuccess: (data) => {
      setResultado(data);
      if (
        data?.statusSeguranca === "SUBDOSE" ||
        data?.statusSeguranca === "SUPERDOSE"
      ) {
        toast.warning("Dose fora da faixa de referência!", {
          description: "Verifique o card de segurança abaixo.",
        });
      } else if (data?.statusSeguranca === "SEM_REFERENCIA") {
        toast.warning("Cálculo realizado (Modo Livre)", {
          description: `Não há referência cadastrada para ${via} nesta espécie. O cálculo de volume está correto.`,
        });
      } else {
        toast.success("Cálculo realizado e validado!");
      }
    },
    onError: (e) => toast.error(e.message || "Erro ao calcular."),
  });

  const handleInserir = () => {
    if (!resultado) return;

    const medNome =
      modo === "catalogo"
        ? medicamentos?.find((m: any) => m.id === medicamentoId)?.nome ||
          "Medicamento"
        : nomeManual || "Medicamento Manual";

    const espNome =
      especies?.find((e: any) => e.id === especieId)?.nomePopular ||
      nomeEspecie ||
      "Espécie não inf.";

    let alertaTexto = "";
    if (resultado.statusSeguranca === "SUPERDOSE")
      alertaTexto = " ⚠️ [ALERTA: SUPERDOSAGEM CONFIRMADA PELO VETERINÁRIO]";
    if (resultado.statusSeguranca === "SUBDOSE")
      alertaTexto = " ⚠️ [ALERTA: SUBDOSAGEM CONFIRMADA PELO VETERINÁRIO]";

    const texto = `
💊 PRESCRIÇÃO
Fármaco: ${medNome} (${resultado.concentracaoUtilizada || concentracaoManual + " mg/ml"})
Paciente: ${peso} ${unidadePeso.toLowerCase()} (${espNome})
--------------------------
Dose: ${dose} mg/kg${alertaTexto}
Volume: ${resultado.volumeCalculadoMl || resultado.volumeMinimoMl} ml
Via: ${via} | Freq: ${frequencia || "?"} | Dur: ${duracao || "?"}
Ref: ${resultado.refFonte || "Sem referência"}
`.trim();

    // Executa a função passada pelo pai (Copiar ou Injetar)
    onCopiarParaProntuario(texto);

    // Feedback apenas se for Prontuário, pois o Dashboard (Avulso) já dá toast no pai
    if (contexto === "prontuario") {
      toast.success("Inserido no prontuário!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SEGURO":
        return "bg-green-50 border-green-200 text-green-900";
      case "SUBDOSE":
        return "bg-amber-50 border-amber-300 text-amber-900";
      case "SUPERDOSE":
        return "bg-red-50 border-red-300 text-red-900";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SEGURO":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "SUBDOSE":
        return <AlertTriangle className="h-6 w-6 text-amber-600" />;
      case "SUPERDOSE":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case "SEM_REFERENCIA":
        return <SearchX className="h-6 w-6 text-slate-400" />;
      default:
        return <Info className="h-6 w-6 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SEGURO":
        return "Dose Segura";
      case "SUBDOSE":
        return "Subdosagem (Baixo)";
      case "SUPERDOSE":
        return "Superdosagem (Alto)";
      case "SEM_REFERENCIA":
        return "Sem Referência";
      default:
        return "Não Validado";
    }
  };

  return (
    <div className="space-y-4 p-1">
      {/* ... (Bloco de Inputs igual, mantendo o SelectGroup das Vias) ... */}
      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm space-y-4">
        <Tabs
          value={modo}
          onValueChange={(v: any) => {
            setModo(v);
            setResultado(null);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9 mb-2">
            <TabsTrigger value="catalogo" className="text-xs">
              <Database className="h-3 w-3 mr-2" /> Catálogo (Seguro)
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs">
              <Keyboard className="h-3 w-3 mr-2" /> Manual (Livre)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400 uppercase">
              Espécie
            </Label>
            <Select value={especieId} onValueChange={setEspecieId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {especies?.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nomePopular}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {modo === "catalogo" ? (
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">
                Medicamento
              </Label>
              <Select value={medicamentoId} onValueChange={setMedicamentoId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {medicamentos?.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome} ({m.concentracao})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Nome Med.</Label>
                <Input
                  className="h-9"
                  value={nomeManual}
                  onChange={(e) => setNomeManual(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Conc (mg/ml)</Label>
                <Input
                  className="h-9"
                  type="number"
                  value={concentracaoManual}
                  onChange={(e) => setConcentracaoManual(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">
                Peso
              </Label>
              <div className="flex">
                <Input
                  type="number"
                  className="h-9 rounded-r-none"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
                <Button
                  variant="outline"
                  className="h-9 px-2 rounded-l-none text-xs"
                  onClick={() =>
                    setUnidadePeso(unidadePeso === "KG" ? "G" : "KG")
                  }
                >
                  {unidadePeso}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">
                Dose (mg/kg)
              </Label>
              <Input
                type="number"
                className="h-9"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">
                Via
              </Label>
              {modo === "catalogo" ? (
                <Select
                  value={via}
                  onValueChange={setVia}
                  disabled={loadingVias}
                >
                  <SelectTrigger className="h-8 text-xs bg-slate-50">
                    {loadingVias ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <SelectValue placeholder="Selecione" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {viasSugeridas && viasSugeridas.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-[10px] text-emerald-600">
                          Recomendadas
                        </SelectLabel>
                        {viasSugeridas.map((v: string) => (
                          <SelectItem
                            key={`sug-${v}`}
                            value={v}
                            className="font-bold"
                          >
                            <div className="flex items-center gap-2">
                              {v}
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}

                    {viasSugeridas && viasSugeridas.length > 0 && (
                      <SelectSeparator />
                    )}

                    <SelectGroup>
                      <SelectLabel className="text-[10px] text-slate-400">
                        Outras Opções
                      </SelectLabel>
                      {TODAS_VIAS.filter(
                        (v) => !viasSugeridas?.includes(v),
                      ).map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Via (Ex: Oral)"
                  className="h-8 text-xs"
                  value={via}
                  onChange={(e) => setVia(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">
                Frequência
              </Label>
              <Input
                placeholder="Ex: 12h"
                className="h-8 text-xs"
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">
                Duração
              </Label>
              <Input
                placeholder="Ex: 5d"
                className="h-8 text-xs"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 h-10 gap-2 mt-4"
            onClick={() => calcularMutation.mutate()}
            disabled={calcularMutation.isPending}
          >
            {calcularMutation.isPending ? (
              "Validando..."
            ) : (
              <>
                <Calculator className="w-4 h-4" /> Calcular Dose Segura
              </>
            )}
          </Button>
        </div>
      </div>

      {resultado && (
        <Card
          className={`border-l-[6px] shadow-sm animate-in fade-in slide-in-from-top-2 ${getStatusColor(resultado.statusSeguranca)}`}
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(resultado.statusSeguranca)}
                <div>
                  <h4 className="font-bold text-sm">
                    {getStatusLabel(resultado.statusSeguranca)}
                  </h4>
                  {resultado.refMin && resultado.refMax && (
                    <p className="text-[10px] opacity-80">
                      Ref: {resultado.refMin} - {resultado.refMax} mg/kg
                    </p>
                  )}
                </div>
              </div>
            </div>
            {resultado.mensagemSeguranca && (
              <p className="text-xs font-medium mb-3 border-t border-black/10 pt-2 opacity-90">
                {resultado.mensagemSeguranca}
              </p>
            )}
            <div className="bg-white/80 p-3 rounded-lg flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                Volume Final
              </span>
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                <span className="text-2xl font-black">
                  {resultado.volumeCalculadoMl || resultado.volumeMinimoMl} ml
                </span>
              </div>
            </div>

            {/* BOTÃO DINÂMICO BASEADO NO CONTEXTO */}
            <Button
              className={`w-full mt-4 h-9 text-xs font-bold shadow-sm ${
                resultado.statusSeguranca === "SUPERDOSE" ||
                resultado.statusSeguranca === "SUBDOSE"
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
              onClick={handleInserir}
            >
              {contexto === "avulso" ? (
                <>
                  <Copy className="h-3 w-3 mr-2" /> Copiar Resultado
                </>
              ) : (
                <>
                  <ArrowRight className="h-3 w-3 mr-2" /> Inserir no Prontuário
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
