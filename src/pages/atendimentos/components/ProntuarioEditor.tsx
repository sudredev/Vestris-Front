/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Save,
  Lock,
  User,
  Stethoscope,
  AlertCircle,
  FileEdit,
  Syringe, // Vacina
  FilePlus2,
} from "lucide-react";
import type { AtendimentoFormValues } from "../CockpitAtendimento";
import { RegistroVacinaModal } from "../../pacientes/components/RegistroVacinalModal";
import { useState } from "react";

interface Props {
  form: UseFormReturn<AtendimentoFormValues>;
  readOnly?: boolean;
  onSaveDraft: () => void;
  onFinalize: () => void;
  isSaving: boolean;
  isFinalizing: boolean;
  onFieldFocus: (field: keyof AtendimentoFormValues) => void;
  tipoAtendimento: string;
  pacienteId?: string;
}

export function ProntuarioEditor({
  form,
  readOnly,
  onSaveDraft,
  onFinalize,
  isSaving,
  isFinalizing,
  onFieldFocus,
  tipoAtendimento,
  pacienteId,
}: Props) {
  const navigate = useNavigate();
  const [modalVacinaOpen, setModalVacinaOpen] = useState(false);

  // DEBUG: Veja no console do navegador o que está chegando
  // console.log("ProntuarioEditor - Tipo recebido:", tipoAtendimento);

  // Lógica de Exibição
  const isVacina = tipoAtendimento === "VACINACAO";
  const isRetorno = tipoAtendimento === "RETORNO";
  const isProcedimento =
    tipoAtendimento === "PROCEDIMENTO" || tipoAtendimento === "CIRURGIA";

  // Se for qualquer coisa diferente de Vacina, assume comportamento de consulta padrão
  const isConsulta = !isVacina && !isRetorno && !isProcedimento;

  const handleCreateProtocol = () => {
    const currentData = form.getValues();
    navigate("/protocolos/novo", {
      state: {
        titulo: `Protocolo Ref.: ${currentData.titulo || "Atendimento Clínico"}`,
        conduta: currentData.condutaClinica,
        origem: "ATENDIMENTO",
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4 pb-10">
        {/* === MODO VACINAÇÃO: CARD ESPECIAL === */}
        {isVacina && (
          <Card className="border-emerald-200 bg-emerald-50/40 mb-6">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-emerald-100 rounded-full text-emerald-600 shadow-sm">
                <Syringe className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900">
                  Atendimento de Imunização
                </h3>
                <p className="text-emerald-700 text-sm max-w-lg mx-auto mt-1">
                  Este prontuário é simplificado para registro vacinal. Clique
                  abaixo para lançar a dose aplicada no histórico e no Hub de
                  Controle.
                </p>
              </div>
              {!readOnly && pacienteId && (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setModalVacinaOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2 mt-2"
                >
                  <Syringe className="h-5 w-5" /> Registrar Vacina Aplicada
                </Button>
              )}

              {/* Modal Integrado */}
              <RegistroVacinaModal
                pacienteId={pacienteId || ""}
                open={modalVacinaOpen}
                onOpenChange={setModalVacinaOpen}
              />
            </CardContent>
          </Card>
        )}

        {/* === CAMPOS CLÍNICOS (Só aparecem se NÃO for vacinação) === */}

        {/* Motivo (Sempre visível) */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
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
                      onFocus={() => onFieldFocus("titulo")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Anamnese e Exame Físico (Esconde na Vacinação) */}
        {!isVacina && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(isConsulta || isRetorno || isProcedimento) && (
              <Card className="border-slate-200 shadow-sm flex flex-col">
                <div className="bg-blue-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">
                    {isRetorno ? "Evolução Clínica" : "Histórico / Anamnese"}
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
                            placeholder={
                              isRetorno
                                ? "Evolução desde a última visita..."
                                : "Relato do tutor..."
                            }
                            onFocus={() => onFieldFocus("historicoClinico")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {(isConsulta || isProcedimento) && (
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
                            placeholder="TPC, Mucosas, FC, FR, Temp..."
                            onFocus={() => onFieldFocus("exameFisico")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Diagnóstico (Só Consulta) */}
        {!isVacina && isConsulta && (
          <Card className="border-slate-200 shadow-sm">
            <div className="bg-purple-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-slate-700">
                Suspeita / Diagnóstico
              </span>
            </div>
            <CardContent className="p-3">
              <FormField
                control={form.control}
                name="diagnostico"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={readOnly}
                        className="min-h-[80px] border-0 focus-visible:ring-0 resize-none p-0 text-sm"
                        onFocus={() => onFieldFocus("diagnostico")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Conduta (Esconde na Vacinação, pois a conduta é a própria vacina) */}
        {!isVacina && (
          <Card className="border-emerald-200 shadow-md ring-1 ring-emerald-50">
            <div className="bg-emerald-50/50 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
              <span className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                CONDUTA TERAPÊUTICA
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
                        className="min-h-[200px] border-0 focus-visible:ring-0 p-4 text-sm font-mono leading-relaxed resize-y"
                        placeholder="Prescrição, procedimentos..."
                        onFocus={() => onFieldFocus("condutaClinica")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Observações Gerais (Sempre Visível) */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <AlertCircle className="h-3 w-3" /> Notas Gerais / Retorno
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={readOnly}
                  className="bg-white min-h-[80px] resize-none border-slate-200"
                  placeholder={
                    isVacina
                      ? "Lote da vacina, reação alérgica, etc..."
                      : "Notas administrativas..."
                  }
                  onFocus={() => onFieldFocus("observacoes")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* --- BARRA DE AÇÕES --- */}
        {!readOnly && (
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            {!isVacina && (
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-100"
                onClick={handleCreateProtocol}
              >
                <FilePlus2 className="h-4 w-4" /> Salvar como Protocolo
              </Button>
            )}

            <div className="flex gap-3 ml-auto">
              <span className="text-xs text-slate-400 flex items-center mr-2 italic">
                {isSaving ? "Salvando..." : "Salve antes de sair"}
              </span>

              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSaving || isFinalizing}
                className="gap-2"
              >
                <Save className="h-4 w-4" /> Salvar Rascunho
              </Button>

              <Button
                type="button"
                onClick={onFinalize}
                disabled={isSaving || isFinalizing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm px-6"
              >
                <Lock className="h-4 w-4" /> Finalizar Atendimento
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
