import { useMutation } from "@tanstack/react-query";
import { publicService } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Save, Loader2 } from "lucide-react";

// IDs dos Planos (Fixos do Data.sql)
const PLANOS = [
  { id: "90000000-0000-0000-0000-000000000001", nome: "Autônomo" },
  { id: "90000000-0000-0000-0000-000000000002", nome: "Clínica Pequena" },
  { id: "90000000-0000-0000-0000-000000000003", nome: "Clínica Média" },
  { id: "90000000-0000-0000-0000-000000000004", nome: "Enterprise (Hospital)" },
];

const schema = z.object({
  nomeClinica: z.string().min(3, "Nome da clínica obrigatório"),
  planoId: z.string().min(1, "Selecione um plano"),
  // Dados do Admin da Clínica
  nomeAdmin: z.string().min(3, "Nome do responsável"),
  emailAdmin: z.string().email("Email inválido"),
  crmvAdmin: z.string().min(3, "CRMV obrigatório"),
  senhaAdmin: z.string().min(6, "Senha provisória (min 6 chars)"),
});

type FormValues = z.infer<typeof schema>;

export function AdminClinicas() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeClinica: "",
      planoId: "",
      nomeAdmin: "",
      emailAdmin: "",
      crmvAdmin: "",
      senhaAdmin: "mudar123", // Senha padrão sugerida
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Usa o serviço público de cadastro (reaproveitando a lógica de "combo")
      await publicService.cadastrarClienteSaas({
        nomeClinica: values.nomeClinica,
        planoId: values.planoId,
        nomeUsuario: values.nomeAdmin,
        email: values.emailAdmin,
        crmv: values.crmvAdmin,
        senha: values.senhaAdmin,
      });
    },
    onSuccess: () => {
      toast.success("Clínica e Admin criados com sucesso!");
      form.reset();
    },
    onError: () =>
      toast.error("Erro ao criar clínica. Verifique se o e-mail já existe."),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Gestão de Clínicas (SaaS)
        </h1>
        <p className="text-slate-500">
          Cadastre novas clínicas manualmente (Contratos Enterprise / Offline).
        </p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" /> Nova Clínica
          </CardTitle>
          <CardDescription>
            Isso criará a estrutura da clínica, a assinatura e o usuário
            administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DADOS DA EMPRESA */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase">
                    Dados da Empresa
                  </h3>
                  <FormField
                    control={form.control}
                    name="nomeClinica"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Fantasia</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="planoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano Contratado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLANOS.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* DADOS DO ADMIN */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase">
                    Admin Responsável
                  </h3>
                  <FormField
                    control={form.control}
                    name="nomeAdmin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emailAdmin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail de Acesso</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="crmvAdmin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRMV</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="senhaAdmin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Provisória</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Criar Clínica & Usuário
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
