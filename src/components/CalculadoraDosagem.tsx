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
