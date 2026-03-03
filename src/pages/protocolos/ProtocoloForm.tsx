import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { protocolsService, diseasesService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pill,
  Stethoscope,
  Wand2,
  Users,
  Lock,
} from "lucide-react";

// REMOVIDO IMPORT DE ENUM QUEBRADO
// import { OrigemProtocoloEnum } from "@/api";

// --- SCHEMA HÍBRIDO ---
const dosagemSchema = z.object({
  medicamentoId: z.string().optional(),
  medicamentoTexto: z.string().min(1, "Nome do fármaco obrigatório"),
  doseMinima: z.coerce.number().optional(),
  unidade: z.string().optional(),
  frequencia: z.string().optional(),
  duracao: z.string().optional(),
  via: z.string().optional(),
});

const formSchema = z.object({
  titulo: z.string().min(3, "Dê um nome para este tratamento"),
  doencaId: z.string().optional(),
  doencaTexto: z.string().min(1, "Informe a doença ou condição"),
  referenciaTexto: z.string().optional(),
  observacoes: z.string().optional(),
  // NOVO: Tipo de Compartilhamento
  tipoCompartilhamento: z.enum(["PROPRIO", "INSTITUCIONAL"]),
  dosagens: z.array(dosagemSchema).min(1, "Adicione pelo menos 1 item"),
});

type FormValues = z.infer<typeof formSchema>;

export function ProtocoloForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthUser();

  const prefillData = location.state as {
    titulo?: string;
    conduta?: string;
    origem?: string;
  } | null;

  // Permissão para criar Institucional
  const podeCriarInstitucional =
    user?.role === "ADMIN_CLINICO" || user?.role === "ADMIN_GLOBAL";

  const { data: doencas } = useQuery({
    queryKey: ["doencas-list"],
    queryFn: async () => {
      try {
        const res = await diseasesService.listarDoencas();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  const medicamentosSugestoes = [
    { id: "20000000-0000-0000-0000-000000000001", nome: "Doxfin Suspensão" },
    { id: "20000000-0000-0000-0000-000000000003", nome: "Baytril 10%" },
    { id: "20000000-0000-0000-0000-000000000005", nome: "Maxicam 0.2%" },
  ];

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      titulo: prefillData?.titulo || "",
      doencaTexto: "",
      referenciaTexto: "Protocolo Próprio",
      observacoes: prefillData?.conduta
        ? `Conduta Original:\n${prefillData.conduta}`
        : "",
      tipoCompartilhamento: "PROPRIO", // Padrão
      dosagens: [
        {
          medicamentoTexto: "",
          doseMinima: 0,
          unidade: "mg/kg",
          frequencia: "",
          duracao: "",
          via: "Oral",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dosagens",
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user?.id) throw new Error("Sessão inválida");

      const doencaExistente = doencas?.find(
        (d) => d.nome?.toLowerCase() === values.doencaTexto.toLowerCase(),
      );

      await protocolsService.criarProtocolo({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doencaId: (doencaExistente?.id || undefined) as any,
        doencaTexto: values.doencaTexto,
        titulo: values.titulo,
        referenciaTexto: values.referenciaTexto || "Próprio",
        observacoes: values.observacoes,

        // CORREÇÃO 2: Passando string direta como any para evitar erro de importação do Enum
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        origem: values.tipoCompartilhamento as any,

        // CORREÇÃO 1: Cast para any no clinicaId para o TS aceitar a string ou undefined
        clinicaId:
          values.tipoCompartilhamento === "INSTITUCIONAL"
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (user.clinicaId as any)
            : undefined,

        autorId: user.id,

        dosagens: values.dosagens.map((d) => {
          const medExistente = medicamentosSugestoes.find(
            (m) => m.nome.toLowerCase() === d.medicamentoTexto.toLowerCase(),
          );
          return {
            ...d,
            medicamentoId: medExistente?.id,
            medicamentoTexto: d.medicamentoTexto,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
      });
    },
    onSuccess: () => {
      toast.success("Protocolo salvo na sua biblioteca!");
      navigate("/protocolos");
    },
    onError: () => toast.error("Erro ao salvar protocolo."),
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="pl-0 text-slate-500 hover:bg-transparent hover:text-slate-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </Button>
        {prefillData && (
          <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
            <Wand2 className="h-3 w-3" /> Criando a partir de atendimento
          </span>
        )}
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-slate-900 text-white rounded-t-lg pb-8 pt-8 px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Stethoscope className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Novo Protocolo Terapêutico
              </CardTitle>
              <CardDescription className="text-slate-300 border-none">
                Crie um modelo de tratamento para reutilizar em futuros
                atendimentos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-8"
            >
              {/* SEÇÃO 1: CONTEXTO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Nome do Protocolo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Tratamento Suporte - Calopsita"
                          {...field}
                          className="h-11 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DOENÇA */}
                <FormField
                  control={form.control}
                  name="doencaTexto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Doença ou Condição
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            list="doencas-list"
                            placeholder="Digite ou selecione..."
                            className="h-11"
                            {...field}
                          />
                          <datalist id="doencas-list">
                            {doencas?.map((d) => (
                              <option key={d.id} value={d.nome} />
                            ))}
                          </datalist>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SELETOR DE VISIBILIDADE (INSTITUCIONAL vs PROPRIO) */}
              {podeCriarInstitucional && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <FormField
                    control={form.control}
                    name="tipoCompartilhamento"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Visibilidade do Protocolo
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Opção Privada */}
                            <label
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                field.value === "PROPRIO"
                                  ? "bg-white border-slate-400 shadow-sm ring-1 ring-slate-400"
                                  : "bg-transparent border-slate-200 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                {...field}
                                value="PROPRIO"
                                checked={field.value === "PROPRIO"}
                                className="sr-only"
                              />
                              <Lock
                                className={`h-5 w-5 ${
                                  field.value === "PROPRIO"
                                    ? "text-slate-700"
                                    : "text-slate-400"
                                }`}
                              />
                              <div>
                                <span className="block text-sm font-bold text-slate-800">
                                  Pessoal (Privado)
                                </span>
                                <span className="block text-xs text-slate-500">
                                  Visível apenas para você.
                                </span>
                              </div>
                            </label>

                            {/* Opção Institucional */}
                            <label
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                field.value === "INSTITUCIONAL"
                                  ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
                                  : "bg-transparent border-slate-200 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                {...field}
                                value="INSTITUCIONAL"
                                checked={field.value === "INSTITUCIONAL"}
                                className="sr-only"
                              />
                              <Users
                                className={`h-5 w-5 ${
                                  field.value === "INSTITUCIONAL"
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              />
                              <div>
                                <span className="block text-sm font-bold text-slate-800">
                                  Institucional (Compartilhado)
                                </span>
                                <span className="block text-xs text-slate-500">
                                  Toda a equipe da clínica poderá usar.
                                </span>
                              </div>
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">
                      Conduta Padrão / Notas
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o procedimento, recomendações ao tutor, etc..."
                        {...field}
                        className="min-h-[120px] font-medium text-slate-600 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SEÇÃO 2: MEDICAMENTOS (MANTIDA) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" /> Prescrição
                    (Itens)
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      append({
                        medicamentoTexto: "",
                        doseMinima: 0,
                        unidade: "mg/kg",
                        frequencia: "",
                        duracao: "",
                        via: "Oral",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Medicamento
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative group hover:border-blue-300 transition-colors"
                  >
                    <div className="md:col-span-4">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.medicamentoTexto`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Fármaco
                            </FormLabel>
                            <FormControl>
                              <div>
                                <Input
                                  list="meds-list"
                                  placeholder="Nome do remédio"
                                  {...field}
                                  className="h-10"
                                />
                                <datalist id="meds-list">
                                  {medicamentosSugestoes.map((m) => (
                                    <option key={m.id} value={m.nome} />
                                  ))}
                                </datalist>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.doseMinima`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Dose
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                className="h-10"
                                placeholder="0"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.unidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Unidade
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="mg/kg"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.frequencia`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Frequência
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="Ex: BID (12/12h)"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="md:col-span-6">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.via`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Via de Administração
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="Ex: Oral"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-6">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.duracao`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                              Duração
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10"
                                placeholder="Ex: 7 dias"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 text-base shadow-lg transition-all hover:-translate-y-0.5"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Salvando..." : "Salvar Protocolo"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
