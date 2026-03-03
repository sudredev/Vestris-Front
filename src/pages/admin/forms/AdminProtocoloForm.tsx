import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  protocolsService,
  diseasesService,
  medicamentosService,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, Syringe } from "lucide-react";

// Schema (Rigoroso para Oficial)
const dosagemSchema = z.object({
  medicamentoId: z.string().min(1, "Medicamento obrigatório"), // ID real
  medicamentoTexto: z.string().optional(),
  doseMinima: z.coerce.number().min(0.0001, "Dose obrigatória"),
  doseMaxima: z.coerce.number().optional(),
  unidade: z.string().min(1),
  frequencia: z.string().min(1),
  duracao: z.string().min(1),
  via: z.string().min(1),
});

const schema = z.object({
  titulo: z.string().min(3),
  doencaId: z.string().min(1, "Doença obrigatória"),
  referenciaTexto: z
    .string()
    .min(3, "Fonte bibliográfica obrigatória para oficiais"),
  observacoes: z.string().optional(),
  dosagens: z.array(dosagemSchema).min(1, "Adicione medicamentos"),
});

type FormValues = z.infer<typeof schema>;

export function AdminProtocoloForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Busca Doenças
  const { data: doencas } = useQuery({
    queryKey: ["doencas-combo"],
    queryFn: async () =>
      (await diseasesService.listarDoencas()).data.dados || [],
  });

  // 2. Busca Medicamentos (Base Oficial)
  const { data: medicamentos } = useQuery({
    queryKey: ["medicamentos-combo"],
    queryFn: async () =>
      (await medicamentosService.listarMedicamentos()).data.dados || [],
  });

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      titulo: "",
      doencaId: "",
      referenciaTexto: "",
      observacoes: "",
      dosagens: [
        {
          medicamentoId: "",
          doseMinima: 0,
          unidade: "mg/kg",
          frequencia: "BID",
          duracao: "7 dias",
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
      const payload = {
        ...values,
        origem: "OFICIAL", // Força Oficial
        // Mapeia o ID do medicamento também como texto para compatibilidade
        dosagens: values.dosagens.map((d) => ({
          ...d,
          medicamentoTexto: medicamentos?.find((m) => m.id === d.medicamentoId)
            ?.nome,
        })),
      };

      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await protocolsService.atualizarProtocolo(id, payload as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await protocolsService.criarProtocolo(payload as any);
      }
    },
    onSuccess: () => {
      toast.success("Protocolo Oficial Salvo!");
      queryClient.invalidateQueries({ queryKey: ["protocolos"] });
      navigate("/admin/conteudo");
    },
    onError: () => toast.error("Erro ao salvar protocolo."),
  });

  // Lógica de Delete (se edição)
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (id) await protocolsService.deletarProtocolo(id);
    },
    onSuccess: () => {
      toast.success("Protocolo removido.");
      navigate("/admin/conteudo");
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 pl-0 text-slate-500"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <Card>
        <CardHeader className="bg-violet-50 border-b border-violet-100 flex flex-row justify-between">
          <CardTitle className="flex items-center gap-2 text-violet-700">
            <Syringe className="h-5 w-5" />{" "}
            {id ? "Editar Protocolo Oficial" : "Novo Protocolo Oficial"}
          </CardTitle>
          {id && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doencaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doença Alvo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!id}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doencas?.map((d) => (
                            <SelectItem key={d.id} value={d.id!}>
                              {d.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="referenciaTexto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Referência Bibliográfica (Livro/Artigo)
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Técnicas</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DOSAGENS */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">
                    Itens do Protocolo
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      append({
                        medicamentoId: "",
                        doseMinima: 0,
                        unidade: "mg/kg",
                        frequencia: "BID",
                        duracao: "7 dias",
                        via: "Oral",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-slate-50 p-4 rounded border grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                  >
                    <div className="md:col-span-4">
                      <FormField
                        control={form.control}
                        name={`dosagens.${index}.medicamentoId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Medicamento Oficial
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {medicamentos?.map((m) => (
                                  <SelectItem key={m.id} value={m.id!}>
                                    {m.nome} ({m.concentracao})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                            <FormLabel className="text-xs">Dose Min</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                className="h-9"
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
                            <FormLabel className="text-xs">Unid</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-9" />
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
                            <FormLabel className="text-xs">Freq</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-9" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={mutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar Protocolo Oficial
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
