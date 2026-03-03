## components

### BannerAssinatura.tsx

```typescript
// components\BannerAssinatura.tsx
import { useQuery } from "@tanstack/react-query";
import { clinicaService, assinaturaService } from "@/lib/api-client"; // Use o serviço correto
import { getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle } from "lucide-react";

export function BannerAssinatura() {
  const user = getAuthUser();

  // 1. Busca a Clínica para ter o ID
  const { data: clinica } = useQuery({
    queryKey: ["minha-clinica-banner", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const res = await clinicaService.obterMinhaClinica(user.id);
        return res.data.dados;
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // 2. Busca a Assinatura usando o ID da Clínica
  const { data: assinatura } = useQuery({
    queryKey: ["minha-assinatura", clinica?.id],
    queryFn: async () => {
      if (!clinica?.id) return null;
      try {
        // CORREÇÃO: Usando assinaturaService
        const res = await assinaturaService.obterMinhaAssinatura(clinica.id);
        return res.data.dados;
      } catch {
        return null;
      }
    },
    enabled: !!clinica?.id, // Só roda quando a clínica carregar
  });

  // Se não carregou, ou não tem assinatura, ou já é ATIVO/MANUAL (Enterprise), esconde.
  if (!assinatura) return null;
  if (assinatura.status === "ATIVO" || assinatura.tipoFaturamento === "MANUAL")
    return null;

  // Lógica de Link: Tenta pegar do plano, senão usa um link padrão ou contato
  // Você precisa garantir que o DTO do Plano tenha 'urlPagamento' ou 'descricao' com o link
  // Como o Swagger gera tipos estritos, vamos usar 'any' se o campo urlPagamento não foi gerado ainda no TS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkPagamento = (assinatura.plano as any).urlPagamento || "#";

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-full">
          {assinatura.status === "TRIAL" ? (
            <Crown className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {assinatura.status === "TRIAL"
              ? "Período de Teste Gratuito"
              : "Assinatura Pendente"}
          </h3>
          <p className="text-indigo-100 text-sm">
            Plano atual: <strong>{assinatura.plano?.nome}</strong>. Mantenha seu
            acesso completo.
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="whitespace-nowrap font-bold text-indigo-700 shadow-sm"
        onClick={() => window.open(linkPagamento, "_blank")}
      >
        {assinatura.status === "TRIAL" ? "Assinar Agora" : "Regularizar"}
      </Button>
    </div>
  );
}

```

### CalculadoraDosagem.tsx

```typescript
// components\CalculadoraDosagem.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { calcService, segurancaService } from "@/lib/api-client";
import { CalculoSeguroRequestUnidadePesoEnum } from "@/api";
import type { CalculoResponse } from "@/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Syringe,
  TriangleAlert,
  RotateCcw,
  Copy,
  Skull,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const calcSchema = z.object({
  medicamentoId: z.string().min(1, "Selecione o medicamento"),
  peso: z.coerce.number().min(0.001, "Informe o peso (maior que 0)"),
  unidadePeso: z.enum(["KG", "G"]),
});

type FormValues = z.infer<typeof calcSchema>;

interface Props {
  protocoloId: string;
  tituloProtocolo: string;
  opcoesMedicamentos: { id: string; nome: string }[];
  especieId?: string; // Para validar contraindicação fatal
}

export function CalculadoraDosagem({
  protocoloId,
  tituloProtocolo,
  opcoesMedicamentos,
  especieId,
}: Props) {
  const [resultado, setResultado] = useState<CalculoResponse | null>(null);
  const [open, setOpen] = useState(false);

  // --- VALIDAÇÃO MANUAL DA DOSE (Segurança Extra) ---
  const [doseManual, setDoseManual] = useState("");
  const [statusValidacao, setStatusValidacao] = useState<
    "SAFE" | "LOW" | "HIGH" | null
  >(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(calcSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      medicamentoId:
        opcoesMedicamentos.length === 1 ? opcoesMedicamentos[0].id : "",
      peso: 0,
      unidadePeso: "G",
    },
  });

  const medicamentoSelecionado = form.watch("medicamentoId");

  // Verifica Contraindicação Fatal (Antes de calcular)
  const { data: alertasSeguranca } = useQuery({
    queryKey: ["seguranca", medicamentoSelecionado, especieId],
    queryFn: async () => {
      if (!medicamentoSelecionado || !especieId) return [];
      try {
        const res = await segurancaService.validarSeguranca(
          medicamentoSelecionado,
          especieId,
        );
        return res.data || [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!medicamentoSelecionado && !!especieId,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await calcService.calcularDosagemSegura({
        protocoloId,
        medicamentoId: values.medicamentoId,
        peso: values.peso,
        unidadePeso: values.unidadePeso as CalculoSeguroRequestUnidadePesoEnum,
      });

      if (!res.data.dados) throw new Error("Sem dados de retorno");
      return res.data.dados;
    },
    onSuccess: (data) => {
      setResultado(data);
      setDoseManual("");
      setStatusValidacao(null);

      if (riscoFatal) {
        toast.warning("Cálculo realizado (Alerta Ignorado)", {
          description: "Você prosseguiu ciente da contraindicação fatal.",
        });
      } else {
        toast.success("Cálculo realizado!");
      }
    },
    onError: () => toast.error("Erro ao calcular."),
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const resetar = () => {
    setResultado(null);
    setDoseManual("");
    setStatusValidacao(null);
    form.reset();
  };

  const handleCopy = () => {
    if (!resultado) return;

    const nomeMedicamento =
      opcoesMedicamentos.find((m) => m.id === form.getValues("medicamentoId"))
        ?.nome || "Medicamento";

    let notaValidacao = "";
    if (doseManual && statusValidacao) {
      notaValidacao = `\n[Validação Manual: Dose de ${doseManual}mg verificada - ${statusValidacao === "SAFE" ? "OK" : "ALERTA"}]`;
    }

    const textoFormatado = `
📋 CÁLCULO DE DOSE (Ref. ${tituloProtocolo})
Fármaco: ${nomeMedicamento}
Peso: ${resultado.pesoConsideradoKg} kg
--------------------------
Dose Calc: ${resultado.doseMinimaMg} mg ${resultado.doseMaximaMg ? `a ${resultado.doseMaximaMg} mg` : ""}
Volume: ${resultado.volumeMinimoMl} ml ${resultado.volumeMaximoMl ? `a ${resultado.volumeMaximoMl} ml` : ""}
(Conc: ${resultado.concentracaoUtilizada})
${notaValidacao}
--------------------------
Posologia: ${resultado.via} | ${resultado.frequencia} | ${resultado.duracao}
`.trim();

    navigator.clipboard.writeText(textoFormatado);
    toast.success("Copiado!");
    setOpen(false);
  };

  // Valida se a dose manual digitada pelo vet bate com a do protocolo
  const verificarDoseManual = (valor: string) => {
    setDoseManual(valor);
    if (!resultado || !valor) {
      setStatusValidacao(null);
      return;
    }
    const inputMg = parseFloat(valor.replace(",", "."));
    if (isNaN(inputMg)) return;

    const min = resultado.doseMinimaMg || 0;
    const max = resultado.doseMaximaMg || min;

    // Tolerância de 5%
    const minTol = min * 0.95;
    const maxTol = max * 1.05;

    if (inputMg < minTol) setStatusValidacao("LOW");
    else if (inputMg > maxTol) setStatusValidacao("HIGH");
    else setStatusValidacao("SAFE");
  };

  const riscoFatal = alertasSeguranca?.find((a: any) => a.nivel === "FATAL");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetar();
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
          size="sm"
        >
          <Calculator className="h-4 w-4" /> Calcular Dose
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`sm:max-w-lg max-h-[90vh] overflow-y-auto ${riscoFatal ? "border-4 border-red-600 shadow-2xl shadow-red-200" : ""}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            {riscoFatal ? (
              <Skull className="h-7 w-7 text-red-600 animate-pulse" />
            ) : (
              <Calculator className="h-6 w-6 text-slate-500" />
            )}
            Calculadora Segura
          </DialogTitle>
          <DialogDescription>
            Protocolo:{" "}
            <span className="font-semibold text-slate-700">
              {tituloProtocolo}
            </span>
          </DialogDescription>
        </DialogHeader>

        {riscoFatal && (
          <div className="bg-red-50 border-l-8 border-red-600 p-4 rounded-r-md">
            <div className="flex items-center gap-2 mb-1">
              <TriangleAlert className="h-5 w-5 text-red-700" />
              <h3 className="font-black text-red-800 text-sm uppercase tracking-wide">
                Contraindicação Fatal
              </h3>
            </div>
            <p className="text-sm font-medium text-red-700 leading-relaxed">
              {riscoFatal.descricao}
            </p>
          </div>
        )}

        {!resultado ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <FormField
                control={form.control}
                name="medicamentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={
                            riscoFatal
                              ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {opcoesMedicamentos.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="Ex: 85"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidadePeso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Unidade</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-1 bg-slate-100 p-1 rounded-md"
                        >
                          <FormItem className="flex items-center space-x-0 space-y-0 flex-1">
                            <FormControl>
                              <RadioGroupItem
                                value="G"
                                id="r1"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="r1"
                              className="flex-1 text-center rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all hover:bg-white peer-data-[state=checked]:bg-white peer-data-[state=checked]:text-primary peer-data-[state=checked]:shadow-sm cursor-pointer"
                            >
                              g
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-0 space-y-0 flex-1">
                            <FormControl>
                              <RadioGroupItem
                                value="KG"
                                id="r2"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="r2"
                              className="flex-1 text-center rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all hover:bg-white peer-data-[state=checked]:bg-white peer-data-[state=checked]:text-primary peer-data-[state=checked]:shadow-sm cursor-pointer"
                            >
                              kg
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className={`w-full h-12 text-base font-bold ${
                  riscoFatal
                    ? "bg-red-600 hover:bg-red-700 shadow-red-200 shadow-lg"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Calculando..."
                  : riscoFatal
                    ? "IGNORAR RISCO E CALCULAR"
                    : "Calcular Dose Segura"}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Volume a Aspirar
              </p>
              <div className="flex items-center justify-center gap-3 text-4xl font-bold text-blue-900">
                <Syringe className="h-8 w-8 text-blue-500" />
                {resultado.volumeMinimoMl ?? "-"} ml
              </div>
              {resultado.volumeMaximoMl &&
                resultado.volumeMinimoMl &&
                resultado.volumeMaximoMl > resultado.volumeMinimoMl && (
                  <p className="text-blue-600 mt-1 font-medium">
                    a {resultado.volumeMaximoMl} ml
                  </p>
                )}
              <div className="mt-4 inline-block bg-blue-100/50 px-3 py-1 rounded text-xs text-blue-600">
                Conc: {resultado.concentracaoUtilizada || "N/A"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-3 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Dose (Massa)
                </span>
                <span className="font-semibold text-slate-700">
                  {resultado.doseMinimaMg} mg
                  {resultado.doseMaximaMg &&
                    resultado.doseMinimaMg &&
                    resultado.doseMaximaMg > resultado.doseMinimaMg &&
                    ` - ${resultado.doseMaximaMg} mg`}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Peso
                </span>
                <span className="font-semibold text-slate-700">
                  {resultado.pesoConsideradoKg} kg
                </span>
              </div>
            </div>

            {/* --- NOVA ÁREA: VALIDAÇÃO MANUAL --- */}
            <div className="border-t border-slate-100 pt-4 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Verificar Dose Pretendida (mg)
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Ex: 15"
                  value={doseManual}
                  onChange={(e) => verificarDoseManual(e.target.value)}
                  className={`h-10 text-lg font-bold ${
                    statusValidacao === "SAFE"
                      ? "border-green-500 text-green-700 bg-green-50"
                      : statusValidacao === "LOW" || statusValidacao === "HIGH"
                        ? "border-amber-500 text-amber-700 bg-amber-50"
                        : ""
                  }`}
                />
                {statusValidacao === "SAFE" && (
                  <CheckCircle2 className="text-green-600 h-6 w-6" />
                )}
                {(statusValidacao === "LOW" || statusValidacao === "HIGH") && (
                  <TriangleAlert className="text-amber-600 h-6 w-6" />
                )}
              </div>

              {statusValidacao === "SAFE" && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✅ Dose dentro da faixa terapêutica calculada.
                </p>
              )}
              {statusValidacao === "LOW" && (
                <p className="text-xs text-amber-600 mt-1 font-bold">
                  ⚠️ Atenção: Dose abaixo do mínimo recomendado (Subdosagem).
                </p>
              )}
              {statusValidacao === "HIGH" && (
                <p className="text-xs text-amber-600 mt-1 font-bold">
                  ⚠️ Atenção: Dose acima do máximo recomendado (Superdosagem).
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleCopy}
                className="w-full h-11 text-base bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-md shadow-emerald-100"
              >
                <Copy className="h-4 w-4" /> Copiar Resultado
              </Button>
              <Button
                variant="ghost"
                onClick={resetar}
                className="gap-2 text-slate-400 hover:text-slate-600"
              >
                <RotateCcw className="h-3 w-3" /> Novo Cálculo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

```

### DialogSugestao.tsx

```typescript
// components\DialogSugestao.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { feedbackService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { SugestaoRequestTipoEnum } from "@/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";

interface DialogSugestaoProps {
  tipo: "ESPECIE" | "DOENCA" | "PROTOCOLO" | "CALCULO";
  contexto?: string;
  labelBotao?: string;
  // NOVAS PROPS PARA ESTILIZAÇÃO
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export function DialogSugestao({
  tipo,
  contexto,
  labelBotao,
  variant = "outline", // Padrão continua outline
  className,
}: DialogSugestaoProps) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [obs, setObs] = useState("");
  const user = getAuthUser();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuário não logado");

      const conteudoJson = JSON.stringify({
        sugestao: nome,
        observacao: obs,
        contextoTecnico: contexto,
      });

      let tipoEnum: SugestaoRequestTipoEnum;
      switch (tipo) {
        case "ESPECIE":
          tipoEnum = "ESPECIE" as SugestaoRequestTipoEnum;
          break;
        case "DOENCA":
          tipoEnum = "DOENCA" as SugestaoRequestTipoEnum;
          break;
        case "PROTOCOLO":
          tipoEnum = "PROTOCOLO" as SugestaoRequestTipoEnum;
          break;
        case "CALCULO":
          tipoEnum = "CALCULO" as SugestaoRequestTipoEnum;
          break;
        default:
          tipoEnum = "OUTRO" as SugestaoRequestTipoEnum;
      }

      const payload = {
        usuarioId: user.id,
        conteudo: conteudoJson,
        tipo: tipoEnum,
      };

      if (tipo === "ESPECIE") await feedbackService.sugerirEspecie(payload);
      else if (tipo === "DOENCA") await feedbackService.sugerirDoenca(payload);
      else if (tipo === "PROTOCOLO")
        await feedbackService.sugerirProtocolo(payload);
      else await feedbackService.sugerirCalculo(payload);
    },
    onSuccess: () => {
      setAberto(false);
      setNome("");
      setObs("");
      toast.success("Sugestão enviada com sucesso!");
    },
    onError: () => toast.error("Erro ao enviar sugestão."),
  });

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size="sm" // O tamanho pode ser sobrescrito pelo className
          className={`gap-2 ${className}`} // Aplica classes extras
        >
          <PlusCircle className="h-4 w-4" />
          {labelBotao || "Sugerir adição"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sugerir Melhoria</DialogTitle>
          <DialogDescription>
            Ajude a construir a base do Vestris. Nossa curadoria irá analisar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Sua Sugestão (Nome/Título)</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="O que está faltando?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="obs">Observações / Fonte (Opcional)</Label>
            <Textarea
              id="obs"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Detalhes, link da fonte ou justificativa..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !nome}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enviar Sugestão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

### ErrorBoundary.tsx

```typescript
// components\ErrorBoundary.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export class ErrorBoundary extends React.Component<
  { children?: React.ReactNode },
  { hasError: boolean; error?: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] error", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Ocorreu um erro ao carregar a página</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#b00" }}>
            {String(this.state.error)}
          </pre>
          <p>Abra o console para ver o stacktrace.</p>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}

```

### GuiaRapido.tsx

```typescript
// components\GuiaRapido.tsx
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

```

### RoleSwitcher.tsx

```typescript
// components\RoleSwitcher.tsx
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Stethoscope, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAuthUser } from "@/lib/auth";

export function RoleSwitcher() {
  const user = getAuthUser();
  const [isVetMode, setIsVetMode] = useState(false);

  // Só aparece para quem é ADMIN_CLINICO (o "Dono que atende")
  if (user?.role !== "ADMIN_CLINICO") return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const storedMode = localStorage.getItem("vestris_view_mode");
    if (storedMode === "VETERINARIO") setIsVetMode(true);
  }, []);

  const toggleMode = (checked: boolean) => {
    setIsVetMode(checked);
    const novoModo = checked ? "VETERINARIO" : "ADMIN";
    localStorage.setItem("vestris_view_mode", novoModo);

    toast.info(`Modo alternado: ${checked ? "Veterinário" : "Gestor"}`, {
      description: checked
        ? "Você pode atender e prescrever."
        : "Acesso a logs e configurações. Prontuários bloqueados.",
    });

    // Recarrega para aplicar as regras de menu e bloqueio no Cockpit
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100 mx-4 mb-4">
      <div className="flex items-center gap-2 w-full justify-center">
        <ShieldCheck
          className={`h-4 w-4 ${!isVetMode ? "text-indigo-700" : "text-slate-400"}`}
        />
        <Switch
          checked={isVetMode}
          onCheckedChange={toggleMode}
          className="data-[state=checked]:bg-emerald-600"
        />
        <Stethoscope
          className={`h-4 w-4 ${isVetMode ? "text-emerald-600" : "text-slate-400"}`}
        />
      </div>
      <Label className="text-[10px] font-bold text-slate-600 cursor-pointer min-w-[60px]">
        {isVetMode ? "Modo Clínico" : "Modo Gestor"}
      </Label>
    </div>
  );
}

```

### SimpleBadge.tsx

```typescript
// components\SimpleBadge.tsx
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "blue" | "green" | "red" | "orange";
  className?: string;
}

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  gray: "background: #eee; color: #333;",
  blue: "background: #e6f0ff; color: #0b63d6;",
  green: "background: #e6ffef; color: #0a7a3d;",
  red: "background: #ffe6e6; color: #b30b0b;",
  orange: "background: #fff4e6; color: #7a4b00;",
};

export const SimpleBadge: React.FC<BadgeProps> = ({
  children,
  color = "gray",
  className,
}) => {
  const style = colorMap[color];
  return (
    <span
      style={
        {
          display: "inline-block",
          padding: "0.15rem 0.5rem",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          ...Object.fromEntries(
            (style || "")
              .split(";")
              .filter(Boolean)
              .map((s) => {
                const [k, v] = s.split(":");
                return [
                  k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
                  v?.trim(),
                ];
              }),
          ),
        } as React.CSSProperties
      }
      className={className}
      data-testid="simple-badge"
    >
      {children}
    </span>
  );
};

```

