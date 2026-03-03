import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { speciesService } from "@/lib/api-client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Save, PawPrint, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const schema = z.object({
  nomePopular: z.string().min(2),
  nomeCientifico: z.string().min(2),
  familiaTaxonomica: z.string().optional(),
  grupo: z.string().optional(),
  resumoClinico: z.string().optional(),
  parametrosFisiologicos: z.string().optional(),
  expectativaVida: z.string().optional(),
  pesoAdulto: z.string().optional(),
  manejo_ambiente: z.string().optional(),
  manejo_clima: z.string().optional(),
  manejo_alimentacao: z.string().optional(),
  manejo_hidratacao: z.string().optional(),
  manejo_manuseio: z.string().optional(),
  manejo_higiene: z.string().optional(),
  manejo_alertas: z.string().optional(),
  manejo_rotina: z.string().optional(),
  habitat: z.string().optional(),
  bibliografiaBase: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AdminEspecieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: especieExistente } = useQuery({
    queryKey: ["especie", id],
    queryFn: async () => {
      if (!id) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await speciesService.buscarEspeciePorId(id)).data.dados as any;
    },
    enabled: !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomePopular: "",
      nomeCientifico: "",
      familiaTaxonomica: "",
      grupo: "",
      resumoClinico: "",
      parametrosFisiologicos: "",
      expectativaVida: "",
      pesoAdulto: "",
      manejo_ambiente: "",
      manejo_clima: "",
      manejo_alimentacao: "",
      manejo_hidratacao: "",
      manejo_manuseio: "",
      manejo_higiene: "",
      manejo_alertas: "",
      manejo_rotina: "",
      habitat: "",
      bibliografiaBase: "",
    },
  });

  useEffect(() => {
    if (especieExistente) {
      let manejo = {};
      try {
        if (especieExistente.receitaManejoPadrao) {
          manejo = JSON.parse(especieExistente.receitaManejoPadrao);
        }
        // eslint-disable-next-line no-empty
      } catch {}

      form.reset({
        nomePopular: especieExistente.nomePopular,
        nomeCientifico: especieExistente.nomeCientifico,
        familiaTaxonomica: especieExistente.familiaTaxonomica,
        grupo: especieExistente.grupo,
        resumoClinico: especieExistente.resumoClinico,
        parametrosFisiologicos: especieExistente.parametrosFisiologicos,
        expectativaVida: especieExistente.expectativaVida,
        pesoAdulto: especieExistente.pesoAdulto,
        habitat: especieExistente.habitat,
        bibliografiaBase: especieExistente.bibliografiaBase,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_ambiente: (manejo as any).ambiente || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_clima: (manejo as any).clima || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_alimentacao: (manejo as any).alimentacao || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_hidratacao: (manejo as any).hidratacao || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_manuseio: (manejo as any).manuseio || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_higiene: (manejo as any).higiene || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_alertas: (manejo as any).alertas || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manejo_rotina: (manejo as any).rotina || "",
      });
    }
  }, [especieExistente, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const jsonManejo = JSON.stringify({
        ambiente: values.manejo_ambiente,
        clima: values.manejo_clima,
        alimentacao: values.manejo_alimentacao,
        hidratacao: values.manejo_hidratacao,
        manuseio: values.manejo_manuseio,
        higiene: values.manejo_higiene,
        alertas: values.manejo_alertas,
        rotina: values.manejo_rotina,
      });

      const payload = {
        ...values,
        receitaManejoPadrao: jsonManejo,
        manejoInfos: values.manejo_alimentacao,
        alertasClinicos: values.manejo_alertas,
      };

      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await speciesService.atualizarEspecie(id, payload as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await speciesService.criarEspecie(payload as any);
      }
    },
    onSuccess: () => {
      toast.success("Espécie salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["especies"] });
      navigate("/admin/conteudo");
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (id) await speciesService.deletarEspecie(id);
    },
    onSuccess: () => {
      toast.success("Espécie excluída.");
      queryClient.invalidateQueries({ queryKey: ["especies"] });
      navigate("/admin/conteudo");
    },
    onError: () =>
      toast.error("Não é possível excluir. Verifique se há vínculos."),
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
        <CardHeader className="bg-emerald-50 border-b border-emerald-100 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <PawPrint className="h-5 w-5" />{" "}
            {id ? "Editar Espécie" : "Nova Espécie"}
          </CardTitle>

          {/* BOTÃO DE EXCLUIR */}
          {id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Espécie?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso só funcionará se não houver doenças ou pacientes
                    vinculados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600"
                    onClick={() => deleteMutation.mutate()}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-6"
            >
              <Tabs defaultValue="geral" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="geral">Identificação</TabsTrigger>
                  <TabsTrigger value="clinica">Dados Clínicos</TabsTrigger>
                  <TabsTrigger value="manejo">Manejo (8 Pilares)</TabsTrigger>
                </TabsList>

                {/* ABA 1: GERAL */}
                <TabsContent value="geral" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomePopular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Popular</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nomeCientifico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Científico</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="familiaTaxonomica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Família</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grupo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo (Ave, Réptil...)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="resumoClinico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resumo Clínico (Descrição)</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="habitat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habitat</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bibliografiaBase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bibliografia Base</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* ABA 2: CLÍNICA */}
                <TabsContent value="clinica" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expectativaVida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expectativa de Vida</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pesoAdulto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso Adulto</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="parametrosFisiologicos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Parâmetros Fisiológicos (FC, FR, Temp)
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} className="font-mono h-32" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* ABA 3: MANEJO */}
                <TabsContent value="manejo" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="manejo_ambiente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1. Ambiente</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_clima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2. Clima</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_alimentacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>3. Alimentação</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_hidratacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>4. Hidratação</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_manuseio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>5. Manuseio</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_higiene"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>6. Higiene</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_alertas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600">
                            7. Alertas de Saúde
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24 bg-red-50" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manejo_rotina"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>8. Rotina</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="h-24" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                  disabled={mutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar Espécie
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
