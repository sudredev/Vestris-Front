import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { speciesService, patientsService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PawPrint, Save, User, ArrowLeft } from "lucide-react";

// Schema de Validação
const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  especieId: z.string().min(1, "Selecione uma espécie"),

  // Tutor
  tutorNome: z.string().min(3, "Nome do tutor obrigatório"),
  tutorTelefone: z.string().min(8, "Telefone obrigatório"),
  tutorDocumento: z.string().optional(),

  // Detalhes
  identificacaoAnimal: z.string().optional(),
  sexo: z.enum(["MACHO", "FEMEA", "INDEFINIDO"]),

  // Peso
  pesoValor: z.coerce.string().min(1, "Informe o peso"),
  unidadePeso: z.enum(["g", "kg"]),

  pelagemCor: z.string().optional(),
  microchip: z.string().optional(),
  dataNascimento: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PacienteForm() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();

  const { data: especiesList, isError } = useQuery({
    queryKey: ["especies-select"],
    queryFn: async () => {
      try {
        const res = await speciesService.listarEspecies();
        return res.data.dados || [];
      } catch (e) {
        console.error("Erro ao buscar espécies", e);
        return [];
      }
    },
  });

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
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

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user?.id) throw new Error("Sessão inválida");

      const dadosTutor = `${values.tutorNome} | Tel: ${values.tutorTelefone}${
        values.tutorDocumento ? ` | Doc: ${values.tutorDocumento}` : ""
      }`;

      const pesoNum = parseFloat(values.pesoValor.replace(",", "."));
      const pesoFinal = values.unidadePeso === "kg" ? pesoNum * 1000 : pesoNum;

      await patientsService.criarPaciente({
        veterinarioId: user.id,
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
      queryClient.invalidateQueries({ queryKey: ["meus-pacientes"] });
      toast.success("Paciente cadastrado!");
      navigate("/pacientes");
    },
    onError: () => toast.error("Erro ao salvar. Verifique os dados."),
  });

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar o formulário. Verifique sua conexão.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:pl-2 transition-all gap-2 text-slate-500"
        onClick={() => navigate("/pacientes")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para lista
      </Button>

      <Card className="border-none shadow-lg overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 text-white pb-8 pt-6 px-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <PawPrint className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Novo Paciente</CardTitle>
              <CardDescription className="text-slate-300">
                Preencha os dados estruturados para iniciar o prontuário.
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
              {/* --- DADOS DO ANIMAL --- */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dados do Animal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Animal *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Loro"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
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
                        <FormLabel>Espécie *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {especiesList?.map((esp) => (
                              <SelectItem key={esp.id} value={esp.id!}>
                                {esp.nomePopular}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PESO */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Peso Atual *
                    </label>
                    <div className="flex gap-0">
                      <FormField
                        control={form.control}
                        name="pesoValor"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormControl>
                              <Input
                                placeholder="0.00"
                                {...field}
                                className="rounded-r-none h-11 bg-slate-50 border-slate-200 focus:bg-white"
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
                          <FormItem className="w-[80px] space-y-0">
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-l-none bg-slate-100 border-l-0 border-slate-200 h-11 focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

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
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MACHO">Macho</SelectItem>
                            <SelectItem value="FEMEA">Fêmea</SelectItem>
                            <SelectItem value="INDEFINIDO">
                              Indefinido
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nascimento (Aprox)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="pelagemCor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor / Pelagem</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Verde"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="identificacaoAnimal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anilha / Marca</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: BR-123"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="microchip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Microchip (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Código..."
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- DADOS DO TUTOR --- */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Responsável (Tutor)
                  </span>
                </div>

                {/* CORREÇÃO DO LAYOUT: Stack Vertical */}
                <div className="grid gap-6">
                  {/* Linha 1: Nome (Ocupa tudo) */}
                  <FormField
                    control={form.control}
                    name="tutorNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Maria Silva"
                            {...field}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Linha 2: Telefone e Documento (Lado a Lado) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tutorTelefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(xx) 9xxxx-xxxx"
                              {...field}
                              className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
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
                          <FormLabel>CPF / RG</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              {...field}
                              className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* RODAPÉ */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/pacientes")}
                  className="h-12 px-6 text-slate-500"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-12 px-8 shadow-md transition-all"
                  disabled={mutation.isPending}
                >
                  <Save className="h-5 w-5" />
                  {mutation.isPending ? "Salvando..." : "Cadastrar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
