## pages\atendimentos\components

### AbaExames.tsx

```typescript
// pages\atendimentos\components\AbaExames.tsx
// src/pages/atendimentos/components/AbaExames.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examesService } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Paperclip,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  atendimentoId: string;
  readOnly?: boolean;
}

export function AbaExames({ atendimentoId, readOnly }: Props) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [obsUpload, setObsUpload] = useState("");

  // 1. Listar Exames
  const { data: exames, isLoading } = useQuery({
    queryKey: ["exames-atendimento", atendimentoId],
    queryFn: async () => {
      try {
        const res =
          await examesService.listarExamesPorAtendimento(atendimentoId);
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
    enabled: !!atendimentoId,
  });

  // 2. Upload
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // O endpoint espera multipart/form-data. O cliente gerado geralmente aceita File.
      // Se o cliente gerado pedir 'blob', 'File' satisfaz.
      await examesService.uploadExame(
        atendimentoId,
        file,
        obsUpload, // Nota opcional
      );
    },
    onSuccess: () => {
      toast.success("Arquivo anexado com sucesso!");
      setObsUpload("");
      queryClient.invalidateQueries({
        queryKey: ["exames-atendimento", atendimentoId],
      });
    },
    onError: () => toast.error("Erro ao enviar arquivo."),
    onSettled: () => setUploading(false),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    uploadMutation.mutate(file);
  };

  // 3. Deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await examesService.deletarExame(id);
    },
    onSuccess: () => {
      toast.success("Anexo removido.");
      queryClient.invalidateQueries({
        queryKey: ["exames-atendimento", atendimentoId],
      });
    },
    onError: () => toast.error("Erro ao remover."),
  });

  return (
    <div className="space-y-6 pt-4 h-full flex flex-col">
      {/* AREA DE UPLOAD */}
      {!readOnly && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
          <div>
            <Label className="text-xs font-bold text-slate-500 uppercase">
              Novo Anexo
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Observação (opcional, ex: Hemograma)"
                value={obsUpload}
                onChange={(e) => setObsUpload(e.target.value)}
                className="bg-white h-10 text-sm"
              />
              <div className="relative">
                <input
                  type="file"
                  id="upload-exame"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <Button
                  asChild
                  disabled={uploading}
                  className="gap-2 cursor-pointer bg-slate-900 h-10"
                >
                  <label htmlFor="upload-exame">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Anexar</span>
                  </label>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTAGEM */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">
            Carregando anexos...
          </div>
        ) : !exames || exames.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Paperclip className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum exame anexado.</p>
            <p className="text-xs text-slate-400">Suporta PDF, JPG e PNG.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {exames.map((exame) => (
              <Card
                key={exame.id}
                className="group hover:border-blue-300 transition-all border-slate-200"
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${exame.tipoArquivo?.includes("pdf") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      {exame.tipoArquivo?.includes("pdf") ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-bold text-slate-800 text-sm truncate"
                        title={exame.nomeArquivo}
                      >
                        {exame.nomeArquivo}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {exame.observacoes || "Sem observações"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar/Baixar"
                      onClick={() => window.open(exame.urlArquivo, "_blank")}
                    >
                      <Eye className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                    </Button>

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remover"
                        className="hover:bg-red-50"
                        onClick={() => deleteMutation.mutate(exame.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

```

### BuscadorDeProtocolos.tsx

```typescript
// pages\atendimentos\components\BuscadorDeProtocolos.tsx
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

```

### BuscadorFarmacos.tsx

```typescript
// pages\atendimentos\components\BuscadorFarmacos.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { medicamentosService, segurancaService } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Search, Pill, Loader2, Plus, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  onInject: (text: string, targetField: "condutaClinica") => void;
  especieId?: string;
}

export function BuscadorFarmacos({ onInject, especieId }: Props) {
  const [busca, setBusca] = useState("");

  // Estado para controlar o Modal de Risco
  const [riscoDetectado, setRiscoDetectado] = useState<{
    nivel: string;
    descricao: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    medicamento: any;
  } | null>(null);

  const { data: farmacos, isLoading } = useQuery({
    queryKey: ["medicamentos-lista"],
    queryFn: async () => {
      try {
        const res = await medicamentosService.listarMedicamentos();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClickUsar = async (medicamento: any) => {
    // 1. Se não tiver espécie, injeta direto (vet assume que sabe o que faz)
    if (!especieId) {
      injetarMedicamento(medicamento);
      return;
    }

    // 2. Valida Segurança
    try {
      const res = await segurancaService.validarSeguranca(
        medicamento.id,
        especieId,
      );
      const alertas = res.data || [];

      // Pega o pior risco (FATAL > GRAVE > MODERADA)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const riscoFatal = alertas.find((a: any) => a.nivel === "FATAL");
      const riscoGrave = alertas.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => a.nivel === "GRAVE" || a.nivel === "MODERADA",
      );

      const risco = riscoFatal || riscoGrave;

      if (risco) {
        // ABRE O MODAL
        setRiscoDetectado({
          nivel: risco.nivel || "",
          descricao: risco.descricao || "",
          medicamento: medicamento,
        });
      } else {
        // SEGURO: Injeta direto
        injetarMedicamento(medicamento);
      }
    } catch (e) {
      console.error("Erro ao validar", e);
      // Em caso de erro de rede, permite usar com aviso
      injetarMedicamento(medicamento);
    }
  };

  const confirmarRisco = () => {
    if (riscoDetectado) {
      injetarMedicamento(riscoDetectado.medicamento, true); // true = Risco Aceito
      setRiscoDetectado(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const injetarMedicamento = (medicamento: any, riscoAceito = false) => {
    let texto = `Rx: ${medicamento.nome} (${medicamento.concentracao})\nVia: \nDose: \nFreq: `;

    if (riscoAceito) {
      texto += `\n⚠️ [ALERTA DE SEGURANÇA IGNORADO: Risco ${riscoDetectado?.nivel}]`;
      toast.warning("Medicamento inserido com alerta de risco.");
    } else {
      toast.success("Medicamento inserido!");
    }

    onInject(texto, "condutaClinica");
  };

  const filtrados =
    farmacos?.filter((f) =>
      (f.nome || "").toLowerCase().includes(busca.toLowerCase()),
    ) || [];

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar fármaco..."
          className="pl-8 bg-white h-9 text-xs"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : filtrados.length > 0 ? (
          filtrados.map((item) => (
            <Card
              key={item.id}
              className="border border-slate-100 shadow-sm hover:border-blue-200 transition-colors bg-white"
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">
                      {item.nome}
                    </h4>
                    <p className="text-[10px] text-slate-500 italic">
                      {item.fabricante || "Genérico"} • {item.formaFarmaceutica}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 bg-slate-100 text-slate-600"
                  >
                    {item.concentracao}
                  </Badge>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2 h-7 text-xs text-blue-600 hover:bg-blue-50 border border-blue-100"
                  onClick={() => handleClickUsar(item)}
                >
                  <Plus className="h-3 w-3 mr-2" /> Usar
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Pill className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs">Nenhum medicamento.</p>
          </div>
        )}
      </div>

      {/* MODAL DE SEGURANÇA */}
      <AlertDialog
        open={!!riscoDetectado}
        onOpenChange={(open) => !open && setRiscoDetectado(null)}
      >
        <AlertDialogContent className="border-l-8 border-l-red-600">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Skull className="h-6 w-6" />
              <AlertDialogTitle className="text-xl">
                ALERTA DE SEGURANÇA
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-700 font-medium">
              O sistema detectou uma contraindicação para esta espécie.
            </AlertDialogDescription>

            <div className="bg-red-50 p-4 rounded-md border border-red-100 my-4 text-red-900 text-sm">
              <p className="font-bold uppercase text-xs mb-1">
                Risco {riscoDetectado?.nivel}:
              </p>
              {riscoDetectado?.descricao}
            </div>

            <p className="text-xs text-slate-500">
              Ao confirmar, o medicamento será inserido no prontuário com uma
              nota de alerta, registrando que você optou por prosseguir (uso
              off-label ou risco calculado).
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRiscoDetectado(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarRisco}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Estou ciente, usar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

```

### CalculadoraSegura.tsx

```typescript
// pages\atendimentos\components\CalculadoraSegura.tsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  medicamentosService,
  speciesService,
  calcService,
} from "@/lib/api-client";
// (imports for specific API models are not needed for the new catalog/manual calls)

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthUser } from "@/lib/auth";

interface Props {
  onCopiarParaProntuario: (texto: string) => void;
  especieIdPreSelecionada?: string;
  nomeEspecie?: string;
  medicamentoIdPreSelecionado?: string;
}

export function CalculadoraSegura({
  onCopiarParaProntuario,
  especieIdPreSelecionada,
  nomeEspecie,
  medicamentoIdPreSelecionado,
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

  const [via, setVia] = useState("Oral");
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

  useEffect(() => {
    if (especieIdPreSelecionada) setEspecieId(especieIdPreSelecionada);
  }, [especieIdPreSelecionada]);

  useEffect(() => {
    if (medicamentoIdPreSelecionado)
      setMedicamentoId(medicamentoIdPreSelecionado);
  }, [medicamentoIdPreSelecionado]);

  const calcularMutation = useMutation({
    mutationFn: async () => {
      if (!peso || !dose) throw new Error("Informe peso e dose.");

      if (modo === "catalogo" && !medicamentoId)
        throw new Error("Selecione o medicamento do catálogo.");
      if (modo === "manual" && !concentracaoManual)
        throw new Error("Informe a concentração (mg/ml).");

      const pesoNum = parseFloat(peso.replace(",", "."));
      const doseNum = parseFloat(dose.replace(",", "."));
      const unidadePesoStr = unidadePeso === "G" ? "G" : "KG";

      if (modo === "catalogo") {
        // CHAMA ROTA VALIDAR (catalogo)
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
        // CHAMA ROTA LIVRE (manual)
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
        toast.warning("Atenção: Dose fora da faixa de referência!");
      } else {
        toast.success("Cálculo realizado.");
      }
    },
    onError: (e) => toast.error(e.message || "Erro ao calcular."),
  });

  const handleInserir = () => {
    if (!resultado) return;

    const medNome =
      modo === "catalogo"
        ? medicamentos?.find((m) => m.id === medicamentoId)?.nome ||
          "Medicamento"
        : nomeManual || "Medicamento Manual";

    const espNome =
      especies?.find((e) => e.id === especieId)?.nomePopular ||
      nomeEspecie ||
      "Espécie não inf.";

    let alertaTexto = "";
    if (resultado.statusSeguranca === "SUPERDOSE")
      alertaTexto = " ⚠️ [ALERTA: SUPERDOSAGEM CONFIRMADA PELO VETERINÁRIO]";
    if (resultado.statusSeguranca === "SUBDOSE")
      alertaTexto = " ⚠️ [ALERTA: SUBDOSAGEM CONFIRMADA PELO VETERINÁRIO]";

    const texto = `
💊 PRESCRIÇÃO / CÁLCULO
Fármaco: ${medNome} (${resultado.concentracaoUtilizada || concentracaoManual + " mg/ml"})
Paciente: ${peso} ${unidadePeso.toLowerCase()} (${espNome})
--------------------------
Dose: ${dose} mg/kg${alertaTexto}
Volume: ${resultado.volumeMinimoMl} ml
Via: ${via} | Freq: ${frequencia || "?"} | Dur: ${duracao || "?"}
--------------------------
Ref: ${resultado.refFonte || "Sem referência/Manual"}
`.trim();

    onCopiarParaProntuario(texto);
    toast.success("Inserido no prontuário!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SEGURO":
        return "bg-green-50 border-green-200 text-green-800";
      case "SUBDOSE":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "SUPERDOSE":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-slate-50 border-slate-200 text-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SEGURO":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "SUBDOSE":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "SUPERDOSE":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 p-1">
      <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-4">
        {/* SELETOR DE MODO */}
        <Tabs
          value={modo}
          onValueChange={(v) => {
            setModo(v as any);
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

        {/* CAMPOS COMUNS */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">
            Espécie {modo === "catalogo" ? "(para validar)" : "(opcional)"}
          </Label>
          <Select value={especieId || undefined} onValueChange={setEspecieId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {especies?.map((e: any) => (
                <SelectItem key={e.id} value={e.id!}>
                  {e.nomePopular}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CAMPOS ESPECÍFICOS DO MODO */}
        {modo === "catalogo" ? (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">
              Medicamento
            </Label>
            <Select value={medicamentoId} onValueChange={setMedicamentoId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Selecione do banco..." />
              </SelectTrigger>
              <SelectContent>
                {medicamentos?.map((m: any) => (
                  <SelectItem key={m.id} value={m.id!}>
                    {m.nome} ({m.concentracao})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500 uppercase">
                Nome
              </Label>
              <Input
                placeholder="Ex: Dipirona"
                value={nomeManual}
                onChange={(e) => setNomeManual(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500 uppercase">
                Conc. (mg/ml)
              </Label>
              <Input
                type="number"
                placeholder="500"
                value={concentracaoManual}
                onChange={(e) => setConcentracaoManual(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Peso</Label>
            <div className="flex">
              <Input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="h-9 rounded-r-none"
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
            <Label className="text-xs text-slate-500">Dose (mg/kg)</Label>
            <Input
              type="number"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 mt-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
            Detalhes para Prescrição (Opcional para cálculo)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Via (ex: Oral)"
              value={via}
              onChange={(e) => setVia(e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Freq (ex: 12h)"
              value={frequencia}
              onChange={(e) => setFrequencia(e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Duração (ex: 5d)"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <Button
          className="w-full bg-slate-900 hover:bg-slate-800 h-10 text-xs gap-2 mt-4"
          onClick={() => calcularMutation.mutate()}
          disabled={calcularMutation.isPending}
        >
          {calcularMutation.isPending ? (
            "Processando..."
          ) : (
            <>
              <Calculator className="h-3 w-3" /> Calcular e Validar
            </>
          )}
        </Button>
      </div>

      {resultado && (
        <Card
          className={`border-l-4 p-4 animate-in fade-in slide-in-from-top-2 ${getStatusColor(resultado.statusSeguranca)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(resultado.statusSeguranca)}
              <div>
                <h4 className="font-bold text-sm">
                  {resultado.statusSeguranca === "SEGURO"
                    ? "Dose Segura"
                    : resultado.statusSeguranca === "SEM_REFERENCIA"
                      ? "Sem Referência (Manual)"
                      : "Alerta de Dose"}
                </h4>
                {resultado.refFonte && (
                  <p className="text-[10px] opacity-80">
                    Ref: {resultado.refFonte}
                  </p>
                )}
              </div>
            </div>
          </div>

          {resultado.mensagemSeguranca && (
            <p className="text-xs font-medium mb-3 border-t border-black/10 pt-2">
              {resultado.mensagemSeguranca}
            </p>
          )}

          <div className="bg-white/60 p-3 rounded-lg flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Aplicar:
            </span>
            <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              <span className="text-xl font-bold">
                {resultado.volumeMinimoMl} ml
              </span>
            </div>
          </div>

          <Button
            className={`w-full mt-3 h-8 text-xs font-bold shadow-sm 
                    ${
                      resultado.statusSeguranca === "SUPERDOSE" ||
                      resultado.statusSeguranca === "SUBDOSE"
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
            onClick={handleInserir}
          >
            <ArrowRight className="h-3 w-3 mr-2" />
            Inserir no Prontuário
          </Button>
        </Card>
      )}
    </div>
  );
}

```

### FerramentaExame.tsx

```typescript
// pages\atendimentos\components\FerramentaExame.tsx
import { useQuery } from "@tanstack/react-query";
import { examination } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Stethoscope,
  Copy,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface Props {
  especieId?: string;
  nomeEspecie?: string;
  onInject: (text: string, targetField: "exameFisico") => void;
}

type SecaoExame = {
  titulo: string;
  conteudo: string;
};

export function FerramentaExame({ especieId, nomeEspecie, onInject }: Props) {
  const { data: modeloResponse, isLoading } = useQuery({
    queryKey: ["modelo-exame", especieId],
    queryFn: async () => {
      if (!especieId) return null;
      try {
        const res = await examination.obterModeloExame(especieId);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!especieId,
    retry: false,
  });

  let secoes: SecaoExame[] = [];
  let isTemplateEspecifico = false;

  if (modeloResponse?.sucesso && modeloResponse.dados?.textoBase) {
    try {
      secoes = JSON.parse(modeloResponse.dados.textoBase);
      isTemplateEspecifico = true;
    } catch (e) {
      console.error("Erro ao ler JSON do exame", e);
    }
  }

  if (!isTemplateEspecifico && !isLoading) {
    secoes = [
      {
        titulo: "Avaliação Geral",
        conteudo: "Consciência, Postura, Escore Corporal (1-5), Hidratação.",
      },
      {
        titulo: "Cabeça & Pescoço",
        conteudo: "Mucosas, TPC, Olhos, Narinas, Cavidade Oral, Linfonodos.",
      },
      {
        titulo: "Cardiopulmonar",
        conteudo:
          "Frequência Cardíaca, Ritmo, Frequência Respiratória, Ausculta.",
      },
      {
        titulo: "Abdominal/Digestório",
        conteudo:
          "Palpação abdominal, sensibilidade, conteúdo intestinal/estomacal.",
      },
      {
        titulo: "Tegumentar",
        conteudo: "Pele, Pelos/Penas/Escamas, Ectoparasitas, Lesões.",
      },
      {
        titulo: "Musculoesquelético",
        conteudo: "Locomoção, Palpação de membros, Articulações, Coluna.",
      },
    ];
  }

  const handleInjectSection = (secao: SecaoExame) => {
    const texto = `\n[${secao.titulo.toUpperCase()}]\n${secao.conteudo}`;
    onInject(texto, "exameFisico");
    toast.success("Seção inserida!");
  };

  const handleInjectAll = () => {
    // CORREÇÃO: Fallback para evitar 'undefined' no texto
    const nomeLimpo = nomeEspecie ? nomeEspecie.toUpperCase() : "PACIENTE";

    const cabecalho = isTemplateEspecifico
      ? `-- EXAME FÍSICO: ${nomeLimpo} --`
      : "-- EXAME FÍSICO GERAL --";

    const textoCompleto = secoes
      .map((s) => `[${s.titulo.toUpperCase()}]\n${s.conteudo}`)
      .join("\n\n");

    onInject(`${cabecalho}\n\n${textoCompleto}`, "exameFisico");
    toast.success("Roteiro completo inserido!");
  };

  if (!especieId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
        <Stethoscope className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-xs text-center">
          Selecione um paciente para carregar o roteiro específico.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
        <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-50" />
        <p className="text-xs">Carregando roteiro...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-700 text-xs uppercase flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            {isTemplateEspecifico
              ? `Roteiro: ${nomeEspecie || "Específico"}`
              : "Roteiro Padrão"}
          </h3>
          {!isTemplateEspecifico && (
            <p className="text-[10px] text-slate-400 mt-1">
              Sem modelo específico para esta espécie.
            </p>
          )}
        </div>

        <Badge
          variant={isTemplateEspecifico ? "default" : "secondary"}
          className="text-[10px] h-5"
        >
          {isTemplateEspecifico ? "Específico" : "Genérico"}
        </Badge>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs h-8 border-slate-200 text-slate-600 hover:text-primary hover:border-primary bg-slate-50"
        onClick={handleInjectAll}
      >
        <Copy className="h-3 w-3 mr-2" /> Inserir Roteiro Completo
      </Button>

      <div className="flex-1 overflow-y-auto pr-1">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {secoes.map((secao, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-slate-200 rounded-md bg-white shadow-sm"
            >
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-slate-700 hover:no-underline hover:bg-slate-50">
                {secao.titulo}
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-1 bg-slate-50/30">
                <p className="text-xs text-slate-600 mb-3 leading-relaxed font-mono">
                  {secao.conteudo}
                </p>
                <Button
                  size="sm"
                  className="w-full h-7 text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-800 shadow-sm transition-colors"
                  onClick={() => handleInjectSection(secao)}
                >
                  <ArrowRight className="h-3 w-3 mr-1" /> Usar este bloco
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {!isTemplateEspecifico && (
        <div className="bg-blue-50 p-2 rounded border border-blue-100 flex gap-2 items-start">
          <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-tight">
            Você pode sugerir um roteiro específico para{" "}
            <strong>{nomeEspecie}</strong> na área de Biblioteca.
          </p>
        </div>
      )}
    </div>
  );
}

```

### FerramentasSidebar.tsx

```typescript
// pages\atendimentos\components\FerramentasSidebar.tsx
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

```

### HistoricoLateral.tsx

```typescript
// pages\atendimentos\components\HistoricoLateral.tsx
import { useQuery } from "@tanstack/react-query";
import { recordsService } from "@/lib/api-client";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ArrowRight, History, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface Props {
  pacienteId?: string;
  atendimentoAtualId?: string; // Para não mostrar o próprio atendimento na lista
  onInject: (
    text: string,
    targetField: "historicoClinico" | "condutaClinica" | "queixaPrincipal"
  ) => void;
}

export function HistoricoLateral({
  pacienteId,
  atendimentoAtualId,
  onInject,
}: Props) {
  const { data: historico, isLoading } = useQuery({
    queryKey: ["historico-lateral", pacienteId],
    queryFn: async () => {
      if (!pacienteId) return [];
      const res = await recordsService.listarAtendimentosPorPaciente(
        pacienteId
      );
      return res.data.dados || [];
    },
    enabled: !!pacienteId,
  });

  // Filtra para não mostrar o atendimento que estamos editando agora
  const listaPassada =
    historico?.filter((a) => a.id !== atendimentoAtualId) || [];

  const handleCopy = (
    texto: string | undefined,
    label: string,
    campo: "historicoClinico" | "condutaClinica" | "queixaPrincipal"
  ) => {
    if (!texto) {
      toast.error("Campo vazio neste registro.");
      return;
    }
    onInject(texto, campo);
    toast.success(`${label} copiado para o atendimento atual!`);
  };

  if (!pacienteId)
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        Carregando paciente...
      </div>
    );
  if (isLoading)
    return (
      <div className="p-6 text-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );

  if (listaPassada.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg m-4">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Este é o primeiro atendimento deste paciente.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        <History className="h-4 w-4 text-blue-500" /> Histórico Clínico (
        {listaPassada.length})
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {listaPassada.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id!}
              className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                <div className="text-left w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm">
                      {format(new Date(item.dataHora!), "dd/MM/yyyy")}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    {item.titulo}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Dr(a). {item.veterinarioNome?.split(" ")[0]}
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/30">
                <div className="space-y-4 pt-3">
                  {/* QUEIXA */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Queixa Principal
                    </p>
                    <p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100">
                      {item.queixaPrincipal}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-blue-600 hover:bg-blue-50 w-full justify-start"
                      onClick={() =>
                        handleCopy(
                          item.queixaPrincipal,
                          "Queixa",
                          "queixaPrincipal"
                        )
                      }
                    >
                      <Copy className="h-3 w-3 mr-2" /> Reutilizar Queixa
                    </Button>
                  </div>

                  {/* HISTÓRICO */}
                  {item.historicoClinico && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Anamnese Anterior
                      </p>
                      <p
                        className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100 line-clamp-4 hover:line-clamp-none transition-all cursor-help"
                        title="Clique para expandir"
                      >
                        {item.historicoClinico}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-blue-600 hover:bg-blue-50 w-full justify-start"
                        onClick={() =>
                          handleCopy(
                            item.historicoClinico,
                            "Anamnese",
                            "historicoClinico"
                          )
                        }
                      >
                        <Copy className="h-3 w-3 mr-2" /> Reutilizar Anamnese
                      </Button>
                    </div>
                  )}

                  {/* CONDUTA (O MAIS IMPORTANTE) */}
                  {item.condutaClinica && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" /> Conduta / Tratamento
                      </p>
                      <div className="text-xs text-slate-700 bg-emerald-50/50 p-2 rounded border border-emerald-100 font-mono line-clamp-6 hover:line-clamp-none">
                        {item.condutaClinica}
                      </div>
                      <Button
                        size="sm"
                        className="h-7 text-[10px] bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full shadow-sm"
                        onClick={() =>
                          handleCopy(
                            item.condutaClinica,
                            "Conduta",
                            "condutaClinica"
                          )
                        }
                      >
                        <ArrowRight className="h-3 w-3 mr-2" /> Copiar para
                        Conduta Atual
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

```

### ProntuarioEditor.tsx

```typescript
// pages\atendimentos\components\ProntuarioEditor.tsx
import type { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Save,
  Lock,
  User,
  Stethoscope,
  AlertCircle,
  FileEdit,
  FilePlus2,
} from "lucide-react";
import type { AtendimentoFormValues } from "../CockpitAtendimento";

interface Props {
  form: UseFormReturn<AtendimentoFormValues>;
  readOnly?: boolean;
  onSaveDraft: () => void;
  onFinalize: () => void;
  isSaving: boolean;
  isFinalizing: boolean;
  onFieldFocus: (field: keyof AtendimentoFormValues) => void;
}

export function ProntuarioEditor({
  form,
  readOnly,
  onSaveDraft,
  onFinalize,
  isSaving,
  isFinalizing,
  onFieldFocus,
}: Props) {
  const navigate = useNavigate();

  // Função que pega os dados escritos e joga para a tela de criação de protocolo
  const handleCreateProtocol = () => {
    const currentData = form.getValues();

    navigate("/protocolos/novo", {
      state: {
        titulo: `Protocolo Ref.: ${
          currentData.titulo || "Atendimento Clínico"
        }`,
        conduta: currentData.condutaClinica,
        origem: "ATENDIMENTO",
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4 pb-10">
        {/* BLOCO 1: DADOS INICIAIS (Compacto) */}
        <Card className="border-slate-200 shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Motivo do Atendimento
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={readOnly}
                        className="font-semibold text-slate-800 bg-slate-50"
                        placeholder="Ex: Consulta Rotina"
                        onFocus={() => onFieldFocus("titulo")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-8">
              <FormField
                control={form.control}
                name="queixaPrincipal"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Queixa Principal
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={readOnly}
                        placeholder="Relato do tutor..."
                        className="bg-slate-50"
                        onFocus={() => onFieldFocus("queixaPrincipal")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 2: AVALIAÇÃO GERAL (GRID DE 3 COLUNAS - VISÃO PANORÂMICA) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* COLUNA 1: ANAMNESE */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <div className="bg-blue-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">
                Histórico / Anamnese
              </span>
            </div>
            <CardContent className="p-3 flex-1">
              <FormField
                control={form.control}
                name="historicoClinico"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={readOnly}
                        className="min-h-[140px] border-0 focus-visible:ring-0 resize-none p-0 text-sm"
                        placeholder="Descreva ambiente, manejo, alimentação..."
                        onFocus={() => onFieldFocus("historicoClinico")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* COLUNA 2: EXAME FÍSICO */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <div className="bg-amber-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-slate-700">
                Exame Físico
              </span>
            </div>
            <CardContent className="p-3 flex-1">
              <FormField
                control={form.control}
                name="exameFisico"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={readOnly}
                        className="min-h-[140px] border-0 focus-visible:ring-0 resize-none p-0 text-sm font-mono"
                        placeholder="Peso: __g | TPC: __s | Mucosas: __ | FC: __"
                        onFocus={() => onFieldFocus("exameFisico")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* COLUNA 3: DIAGNÓSTICO */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <div className="bg-purple-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-slate-700">
                Suspeita / Diagnóstico
              </span>
            </div>
            <CardContent className="p-3 flex-1">
              <FormField
                control={form.control}
                name="diagnostico"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={readOnly}
                        className="min-h-[140px] border-0 focus-visible:ring-0 resize-none p-0 text-sm"
                        placeholder="Diagnósticos diferenciais ou definitivo..."
                        onFocus={() => onFieldFocus("diagnostico")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* BLOCO 3: CONDUTA (Ocupa largura total, abaixo) */}
        <Card className="border-emerald-200 shadow-md ring-1 ring-emerald-50">
          <div className="bg-emerald-50/50 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
            <span className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              CONDUTA TERAPÊUTICA E PRESCRIÇÃO
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Campo Alvo da Calculadora
            </span>
          </div>
          <CardContent className="p-0">
            <FormField
              control={form.control}
              name="condutaClinica"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={readOnly}
                      className="min-h-[250px] border-0 focus-visible:ring-0 p-4 text-sm font-mono leading-relaxed resize-y"
                      placeholder="Descreva o tratamento, receitas e procedimentos realizados..."
                      onFocus={() => onFieldFocus("condutaClinica")}
                    />
                  </FormControl>
                  <FormMessage className="px-4 pb-2" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* OBSERVAÇÕES FINAIS */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <AlertCircle className="h-3 w-3" /> Notas de Retorno /
                Observações
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={readOnly}
                  className="bg-white min-h-[80px] resize-none border-slate-200"
                  placeholder="Notas internas, lembretes para retorno, etc..."
                  onFocus={() => onFieldFocus("observacoes")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* BARRA DE AÇÕES */}
        {!readOnly && (
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            {/* BOTÃO NOVO: SALVAR COMO PROTOCOLO */}
            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-100"
              onClick={handleCreateProtocol}
            >
              <FilePlus2 className="h-4 w-4" /> Salvar como Protocolo
            </Button>

            <div className="flex gap-3">
              <span className="text-xs text-slate-400 flex items-center mr-2 italic">
                {isSaving ? "Salvando..." : "Lembre-se de salvar antes de sair"}
              </span>

              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSaving || isFinalizing}
                className="gap-2 bg-white hover:bg-slate-50"
              >
                <Save className="h-4 w-4" />
                Salvar Rascunho
              </Button>

              <Button
                type="button"
                onClick={onFinalize}
                disabled={isSaving || isFinalizing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm px-6"
              >
                <Lock className="h-4 w-4" />
                Finalizar Atendimento
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}

```

### ReceitaManejoModal.tsx

```typescript
// pages\atendimentos\components\ReceitaManejoModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Printer, Leaf, Wand2, Eraser, Loader2 } from "lucide-react";
import { gerarPDFManejo } from "@/lib/pdf-service";
import type {
  DadosManejo,
  DadosCabecalho,
  DadosPaciente,
} from "@/lib/pdf-service";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { speciesService } from "@/lib/api-client";
import { Label } from "@/components/ui/label";
import { registrarEventoAuditoria } from "@/api/auditoria"; // <--- Import

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: DadosPaciente & { especieId?: string };
  veterinario: DadosCabecalho;
  onSave?: (textoJSON: string) => void;
  dadosSalvos?: string;
  // Novos campos opcionais
  atendimentoId?: string;
  pacienteId?: string;
}

const estadoInicial: DadosManejo = {
  ambiente: "",
  clima: "",
  alimentacao: "",
  hidratacao: "",
  manuseio: "",
  higiene: "",
  alertas: "",
  rotina: "",
};

export function ReceitaManejoModal({
  open,
  onOpenChange,
  paciente,
  veterinario,
  onSave,
  dadosSalvos,
  atendimentoId,
  pacienteId,
}: Props) {
  const [campos, setCampos] = useState<DadosManejo>(estadoInicial);

  const limparQuebrasDeLinha = (dados: DadosManejo): DadosManejo => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limpo: any = {};
    Object.keys(dados).forEach((key) => {
      const k = key as keyof DadosManejo;
      limpo[k] = dados[k] ? dados[k].replace(/\\n/g, "\n") : "";
    });
    return limpo as DadosManejo;
  };

  const { data: especieData, isLoading } = useQuery({
    queryKey: ["especie-manejo", paciente.especieId],
    queryFn: async () => {
      if (!paciente.especieId) return null;
      try {
        const res = await speciesService.buscarEspeciePorId(paciente.especieId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return res.data.dados as any;
      } catch {
        return null;
      }
    },
    enabled: open && !!paciente.especieId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!open) return;

    const atualizarSeNecessario = (novosDados: DadosManejo) => {
      const dadosLimpos = limparQuebrasDeLinha(novosDados);
      if (JSON.stringify(campos) !== JSON.stringify(dadosLimpos)) {
        setCampos(dadosLimpos);
      }
    };

    if (dadosSalvos) {
      const parsed = JSON.parse(dadosSalvos);
      atualizarSeNecessario({ ...estadoInicial, ...parsed });
      return;
    }

    const isFormularioLimpo =
      JSON.stringify(campos) === JSON.stringify(estadoInicial);

    if (especieData?.receitaManejoPadrao && isFormularioLimpo) {
      try {
        const template = JSON.parse(especieData.receitaManejoPadrao);
        atualizarSeNecessario(template);
      } catch {
        console.error("Erro ao ler template da espécie");
      }
    }
  }, [open, dadosSalvos, especieData]);

  const handleChange = (campo: keyof DadosManejo, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleRestaurarPadrao = () => {
    if (especieData?.receitaManejoPadrao) {
      try {
        const template = JSON.parse(especieData.receitaManejoPadrao);
        setCampos(limparQuebrasDeLinha(template));
        toast.success("Padrão da espécie restaurado!");
      } catch {
        toast.error("Erro no formato do template.");
      }
    } else {
      toast.info("Não há template padrão para esta espécie.");
    }
  };

  const handlePrint = async () => {
    const temConteudo = Object.values(campos).some((v) => v.trim().length > 0);
    if (!temConteudo) {
      toast.error("Preencha pelo menos um campo.");
      return;
    }

    // 1. Gera PDF
    gerarPDFManejo(campos, paciente, veterinario);

    if (onSave) {
      onSave(JSON.stringify(campos));
    }

    // 2. Registra Auditoria
    const token = localStorage.getItem("vestris_token");
    if (token) {
      try {
        await registrarEventoAuditoria(
          {
            acao: "PDF_MANEJO_GERADO",
            entidade: "MANEJO",
            idAlvo:
              atendimentoId ||
              pacienteId ||
              "00000000-0000-0000-0000-000000000000",
            descricao: `Guia de manejo gerado para ${paciente.especie}`,
            metadados: JSON.stringify({ especie: paciente.especie }),
          },
          token,
        );
      } catch (error) {
        console.error("Erro auditoria manejo", error);
      }
    }

    toast.success("Documento gerado e salvo!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-emerald-800">
              <Leaf className="h-5 w-5" /> Orientação de Manejo:{" "}
              {paciente.especie}
            </DialogTitle>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </div>
          <DialogDescription>
            Documento estruturado. Edite conforme a necessidade do paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 my-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCampos(estadoInicial)}
            className="text-xs text-slate-400"
          >
            <Eraser className="h-3 w-3 mr-2" /> Limpar Tudo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestaurarPadrao}
            className="text-xs gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            disabled={!especieData?.receitaManejoPadrao}
          >
            <Wand2 className="h-3 w-3" /> Restaurar Padrão {paciente.especie}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🏠 1. Ambiente / Recinto
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.ambiente}
              onChange={(e) => handleChange("ambiente", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🌡️ 2. Clima
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.clima}
              onChange={(e) => handleChange("clima", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🥬 3. Alimentação
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.alimentacao}
              onChange={(e) => handleChange("alimentacao", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              💧 4. Hidratação
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.hidratacao}
              onChange={(e) => handleChange("hidratacao", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              ✋ 5. Manuseio
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.manuseio}
              onChange={(e) => handleChange("manuseio", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              🧼 6. Higiene
            </Label>
            <Textarea
              className="h-24 resize-none bg-slate-50 text-sm"
              value={campos.higiene}
              onChange={(e) => handleChange("higiene", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
              🚨 7. Alertas
            </Label>
            <Textarea
              className="h-24 resize-none bg-red-50/30 border-red-100 text-sm"
              value={campos.alertas}
              onChange={(e) => handleChange("alertas", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
              🔄 8. Rotina
            </Label>
            <Textarea
              className="h-24 resize-none bg-blue-50/30 border-blue-100 text-sm"
              value={campos.rotina}
              onChange={(e) => handleChange("rotina", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-emerald-700 hover:bg-emerald-800 gap-2 text-white"
          >
            <Printer className="h-4 w-4" /> Gerar Documento & Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

### ReceitaModal.tsx

```typescript
// pages\atendimentos\components\ReceitaModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Printer, Pill } from "lucide-react";
import {
  gerarPDFReceita,
  type ItemReceita,
  type DadosCabecalho,
  type DadosPaciente,
} from "@/lib/pdf-service";
import { toast } from "sonner";
import { registrarEventoAuditoria } from "@/api/auditoria"; // <--- Import

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: DadosPaciente;
  veterinario: DadosCabecalho;
  // Novos campos opcionais para auditoria
  atendimentoId?: string;
  pacienteId?: string;
}

export function ReceitaModal({
  open,
  onOpenChange,
  paciente,
  veterinario,
  atendimentoId,
  pacienteId,
}: Props) {
  const [itens, setItens] = useState<ItemReceita[]>([
    { farmaco: "", instrucoes: "" },
  ]);
  const [obs, setObs] = useState("");

  const updateItem = (
    index: number,
    field: keyof ItemReceita,
    value: string,
  ) => {
    const newItens = [...itens];
    newItens[index][field] = value;
    setItens(newItens);
  };

  const addItem = () => setItens([...itens, { farmaco: "", instrucoes: "" }]);

  const removeItem = (index: number) => {
    const newItens = itens.filter((_, i) => i !== index);
    setItens(newItens);
  };

  const handlePrint = async () => {
    const itensValidos = itens.filter((i) => i.farmaco.trim() !== "");
    if (itensValidos.length === 0) {
      toast.error("Adicione pelo menos um medicamento.");
      return;
    }

    // 1. Gera PDF
    gerarPDFReceita(itensValidos, obs, paciente, veterinario);

    // 2. Registra Auditoria
    const token = localStorage.getItem("vestris_token");
    if (token) {
      try {
        await registrarEventoAuditoria(
          {
            acao: "PDF_RECEITA_GERADO",
            entidade: "RECEITA",
            // Usa o ID do atendimento se tiver, senão o do paciente, senão zero
            idAlvo:
              atendimentoId ||
              pacienteId ||
              "00000000-0000-0000-0000-000000000000",
            descricao: `Receita gerada para ${paciente.nome} (${itensValidos.length} itens)`,
            metadados: JSON.stringify({
              farmacos: itensValidos.map((i) => i.farmaco).join(", "),
            }),
          },
          token,
        );
      } catch (error) {
        console.error("Falha ao auditar receita", error);
      }
    }

    toast.success("Receita gerada!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-600" /> Nova Receita
            Veterinária
          </DialogTitle>
          <DialogDescription>
            Adicione os medicamentos e instruções claras para o tutor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            {itens.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative group"
              >
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Medicamento / Concentração
                    </label>
                    <Input
                      placeholder="Ex: Doxfin Suspensão 10mg/ml"
                      className="bg-white font-medium"
                      value={item.farmaco}
                      onChange={(e) =>
                        updateItem(index, "farmaco", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Instruções ao Tutor
                    </label>
                    <Textarea
                      placeholder="Ex: Dar 0.5ml via oral, a cada 12 horas, por 10 dias."
                      className="bg-white resize-none"
                      value={item.instrucoes}
                      onChange={(e) =>
                        updateItem(index, "instrucoes", e.target.value)
                      }
                    />
                  </div>
                </div>

                {itens.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addItem}
            className="w-full border-dashed border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Outro Medicamento
          </Button>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Observações Gerais (Opcional)
            </label>
            <Input
              placeholder="Ex: Retorno em 7 dias para reavaliação."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 gap-2"
          >
            <Printer className="h-4 w-4" /> Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

