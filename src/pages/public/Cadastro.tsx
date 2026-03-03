import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { publicService } from "@/lib/api-client";
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
import { toast } from "sonner";
import { Loader2, ArrowLeft, Building2, User } from "lucide-react";

const schema = z.object({
  nomeUsuario: z.string().min(3, "Nome completo"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  crmv: z.string().min(3, "CRMV obrigatório"),
  nomeClinica: z.string().min(3, "Nome da clínica"),
});

type FormValues = z.infer<typeof schema>;

export function Cadastro() {
  const [params] = useSearchParams();
  const planoId = params.get("plano");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeUsuario: "",
      email: "",
      senha: "",
      crmv: "",
      nomeClinica: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!planoId) {
      toast.error("Selecione um plano para continuar.");
      navigate("/planos");
      return;
    }

    setLoading(true);
    try {
      const res = await publicService.cadastrarClienteSaas({
        ...values,
        planoId,
      });

      if (res.data.dados?.token) {
        localStorage.setItem("vestris_token", res.data.dados.token);
        toast.success("Conta criada com sucesso!");

        // Redirecionamento forçado para recarregar o App com o novo token
        setTimeout(() => {
          window.location.href = "/area-vet";
        }, 1000);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error(
        "Erro ao criar conta. Verifique os dados ou se o e-mail já existe.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 text-slate-400"
            onClick={() => navigate("/planos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div className="mx-auto bg-emerald-100 p-3 rounded-full w-fit mb-4">
            <Building2 className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl text-slate-800">
            Crie sua conta
          </CardTitle>
          <CardDescription>
            Configure sua clínica e comece a atender agora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <User className="h-3 w-3" /> Dados Pessoais
                </div>

                <FormField
                  control={form.control}
                  name="nomeUsuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seu Nome Completo</FormLabel>
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
                    name="crmv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu CRMV</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="UF-00000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nomeClinica"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Clínica</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Minha Clínica" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-t pt-4">
                  Acesso
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail Profissional</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crie uma Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6 h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Finalizar Cadastro"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
