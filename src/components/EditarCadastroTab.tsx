import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientsService, speciesService } from "@/lib/api-client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Save, Trash2, User, PawPrint, Loader2 } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  especieId: z.string().min(1, "Selecione uma espécie"),
  tutorNome: z.string().min(3, "Nome do tutor obrigatório"),
  tutorTelefone: z.string().min(8, "Telefone obrigatório"),
  tutorDocumento: z.string().optional(),
  identificacaoAnimal: z.string().optional(),
  sexo: z.enum(["MACHO", "FEMEA", "INDEFINIDO"]),
  pesoValor: z.string().min(1, "Informe o peso"),
  unidadePeso: z.enum(["g", "kg"]),
  pelagemCor: z.string().optional(),
  microchip: z.string().optional(),
  dataNascimento: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paciente: any;
}

export function EditarCadastroTab({ paciente }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Busca lista de espécies (Adicionado isLoading)
  const { data: especiesList, isLoading: loadingEspecies } = useQuery({
    queryKey: ["especies-select"],
    queryFn: async () =>
      (await speciesService.listarEspecies()).data.dados || [],
  });

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    // Valores padrão iniciais vazios
    defaultValues: {
      nome: "",
      especieId: "",
      tutorNome: "",
      tutorTelefone: "",
      tutorDocumento: "",
      identificacaoAnimal: "",
      sexo: "INDEFINIDO",
      pesoValor: "",
      unidadePeso: "g",
      pelagemCor: "",
      microchip: "",
      dataNascimento: "",
    },
  });

  // 2. Preencher formulário ao carregar
  useEffect(() => {
    if (paciente) {
      const parts = paciente.dadosTutor ? paciente.dadosTutor.split(" | ") : [];
      const tNome = parts[0] || "";
      const tTel =
        parts.find((p: string) => p.includes("Tel:"))?.replace("Tel: ", "") ||
        "";
      const tDoc =
        parts.find((p: string) => p.includes("Doc:"))?.replace("Doc: ", "") ||
        "";

      let dataNasc = "";
      if (paciente.dataNascimento) {
        dataNasc = paciente.dataNascimento.split("T")[0];
      }

      // RESET COMPLETO COM DADOS VINDOS DO PROPS
      form.reset({
        nome: paciente.nome || "",
        especieId: paciente.especieId || "",
        tutorNome: tNome,
        tutorTelefone: tTel,
        tutorDocumento: tDoc,
        identificacaoAnimal: paciente.identificacaoAnimal || "",
        sexo: paciente.sexo || "INDEFINIDO",
        pesoValor: paciente.pesoAtualGramas
          ? paciente.pesoAtualGramas.toString()
          : "",
        unidadePeso: "g",
        pelagemCor: paciente.pelagemCor || "",
        microchip: paciente.microchip || "",
        dataNascimento: dataNasc,
      });
    }
  }, [paciente, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const dadosTutor = `${values.tutorNome} | Tel: ${values.tutorTelefone}${
        values.tutorDocumento ? ` | Doc: ${values.tutorDocumento}` : ""
      }`;

      const pesoNum = parseFloat(values.pesoValor.replace(",", "."));
      const pesoFinal = values.unidadePeso === "kg" ? pesoNum * 1000 : pesoNum;

      await patientsService.atualizarPaciente(paciente.id, {
        veterinarioId: paciente.veterinarioId,
        especieId: values.especieId,
        nome: values.nome,
        dadosTutor: dadosTutor,
        identificacaoAnimal: values.identificacaoAnimal,
        pesoAtualGramas: Math.round(pesoFinal),
        pelagemCor: values.pelagemCor,
        microchip: values.microchip,
        dataNascimento: values.dataNascimento || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sexo: values.sexo as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente", paciente.id] });
      toast.success("Cadastro atualizado com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar cadastro."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await patientsService.deletarPaciente(paciente.id);
    },
    onSuccess: () => {
      toast.success("Paciente excluído.");
      navigate("/pacientes");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    onError: (e: any) => {
      toast.error("Não foi possível excluir.", {
        description: "Verifique se existem atendimentos ou vacinas vinculadas.",
      });
    },
  });

  // --- CORREÇÃO PRINCIPAL: TRAVA DE CARREGAMENTO ---
  // Só mostra o formulário quando as espécies carregaram E o paciente existe.
  // Isso evita que o Select renderize vazio e perca o valor inicial.
  if (loadingEspecies || !paciente) {
    return (
      <div className="py-20 flex justify-center items-center text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Carregando dados para edição...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => updateMutation.mutate(d))}
          className="space-y-6"
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-emerald-600" /> Dados do
                Animal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Paciente</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="especieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Espécie</FormLabel>
                    {/* Select Controlado apenas por value */}
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {especiesList?.map((esp: any) => (
                          <SelectItem key={esp.id} value={esp.id}>
                            {esp.nomePopular}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Linha de Detalhes */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pesoValor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso</FormLabel>
                      <div className="flex gap-0">
                        <FormControl>
                          <Input {...field} className="rounded-r-none" />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="unidadePeso"
                          render={({ field: fUnit }) => (
                            <Select
                              value={fUnit.value}
                              onValueChange={fUnit.onChange}
                            >
                              <SelectTrigger className="w-[70px] rounded-l-none border-l-0 bg-slate-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sexo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MACHO">Macho</SelectItem>
                          <SelectItem value="FEMEA">Fêmea</SelectItem>
                          <SelectItem value="INDEFINIDO">Indefinido</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pelagemCor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor / Pelagem</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <FormField
                  control={form.control}
                  name="identificacaoAnimal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anilha / Identificação</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: BR-123" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="microchip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Microchip</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Código..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" /> Dados do Responsável
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tutorNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Tutor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tutorTelefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone / WhatsApp</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tutorDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF / RG (Opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 min-w-[200px]"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>

      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-700 text-sm font-bold uppercase flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-red-600">
            A exclusão do paciente é irreversível.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Excluir Paciente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente
                  o paciente <strong>{paciente.nome}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sim, excluir paciente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
