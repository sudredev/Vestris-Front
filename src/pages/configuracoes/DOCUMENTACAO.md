## pages\configuracoes

### MinhaClinica.tsx

```typescript
// pages\configuracoes\MinhaClinica.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicaService } from "@/lib/api-client";
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
import {
  Building2,
  Save,
  Upload,
  Image as ImageIcon,
  Lock,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

// --- SCHEMA CLÍNICA ---
const schemaClinica = z.object({
  nomeFantasia: z.string().min(2, "Nome é obrigatório"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  emailContato: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional(),
  logoBase64: z.string().optional(),
});

// --- SCHEMA NOVO VET ---
const schemaVet = z.object({
  nome: z.string().min(3, "Nome completo"),
  email: z.string().email("Email inválido"),
  crmv: z.string().min(3, "CRMV obrigatório"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormValues = z.infer<typeof schemaClinica>;
type VetFormValues = z.infer<typeof schemaVet>;

export function MinhaClinica() {
  const user = getAuthUser();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  // --- CORREÇÃO AQUI: Lógica atualizada para os novos perfis ---
  // Quem pode editar? Apenas ADMIN_CLINICO e ADMIN_GESTOR.
  // VETERINARIO e ADMIN_GLOBAL (neste contexto) são ReadOnly.
  const isReadOnly =
    user?.role !== "ADMIN_CLINICO" && user?.role !== "ADMIN_GESTOR";

  const form = useForm<FormValues>({
    resolver: zodResolver(schemaClinica),
    defaultValues: {
      nomeFantasia: "",
      razaoSocial: "",
      cnpj: "",
      telefone: "",
      emailContato: "",
      endereco: "",
      logoBase64: "",
    },
  });

  const formVet = useForm<VetFormValues>({
    resolver: zodResolver(schemaVet),
    defaultValues: { nome: "", email: "", crmv: "", senha: "" },
  });

  const logoPreview = form.watch("logoBase64");

  // BUSCA DADOS
  const { data: dadosClinica } = useQuery({
    queryKey: ["minha-clinica", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await clinicaService.obterMinhaClinica(user.id);
      return res.data.dados;
    },
  });

  // BUSCA EQUIPE
  const { data: equipe } = useQuery({
    queryKey: ["clinica-equipe", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const res = await clinicaService.listarEquipe(user.id);
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
    // Se for ReadOnly (Veterinário), ele pode ver a equipe?
    // Pela regra de negócio "Compartilhado", sim, ele pode ver quem trabalha com ele.
    // Mas não pode editar. Então removemos o !isReadOnly da condição enabled.
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (dadosClinica) {
      form.reset({
        nomeFantasia: dadosClinica.nomeFantasia || "",
        razaoSocial: dadosClinica.razaoSocial || "",
        cnpj: dadosClinica.cnpj || "",
        telefone: dadosClinica.telefone || "",
        emailContato: dadosClinica.emailContato || "",
        endereco: dadosClinica.endereco || "",
        logoBase64: dadosClinica.logoBase64 || "",
      });
    }
  }, [dadosClinica, form]);

  const mutationClinica = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user?.id) throw new Error("Erro de sessão");
      await clinicaService.salvarMinhaClinica(user.id, values);
    },
    onSuccess: () => toast.success("Dados da clínica salvos!"),
    onError: () => toast.error("Erro ao salvar."),
  });

  const mutationVet = useMutation({
    mutationFn: async (values: VetFormValues) => {
      if (!user?.id) throw new Error("Erro de sessão");
      await clinicaService.adicionarMembroEquipe(user.id, values);
    },
    onSuccess: () => {
      toast.success("Veterinário adicionado!");
      setModalOpen(false);
      formVet.reset();
      queryClient.invalidateQueries({ queryKey: ["clinica-equipe"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => {
      toast.error(e.response?.data?.mensagem || "Erro ao adicionar membro.");
    },
  });

  const mutationRemover = useMutation({
    mutationFn: async (membroId: string) => {
      if (!user?.id) throw new Error("Erro de sessão");
      await clinicaService.removerMembroEquipe(user.id, membroId);
    },
    onSuccess: () => {
      toast.success("Membro removido da equipe.");
      queryClient.invalidateQueries({ queryKey: ["clinica-equipe"] });
    },
    onError: () => toast.error("Erro ao remover membro."),
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        form.setValue("logoBase64", base64, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Building2 className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Minha Clínica</h1>
            <p className="text-sm text-slate-500">
              Gestão da identidade e equipe.
            </p>
          </div>
        </div>
      </div>

      {isReadOnly && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <Lock className="h-4 w-4" />
          <AlertTitle>Modo de Leitura</AlertTitle>
          <AlertDescription>
            Apenas administradores (Clínicos ou Gestores) podem alterar estes
            dados.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="dados">Dados Institucionais</TabsTrigger>
          <TabsTrigger value="equipe">Equipe Veterinária</TabsTrigger>
        </TabsList>

        {/* ABA 1: DADOS */}
        <TabsContent value="dados">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => mutationClinica.mutate(d))}
              className="space-y-6 mt-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Identidade Visual</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-32 w-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="font-semibold text-slate-700">
                      Logotipo da Clínica
                    </h3>
                    <p className="text-xs text-slate-400">
                      Será exibido no cabeçalho de todos os documentos.
                    </p>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="relative cursor-pointer mt-2"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleLogoUpload}
                        />
                        <Upload className="h-4 w-4 mr-2" /> Alterar Imagem
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Informações Cadastrais
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nomeFantasia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Fantasia *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razão Social</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone / WhatsApp</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emailContato"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contato</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="h-20"
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {!isReadOnly && (
                <div className="flex justify-end pb-10">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    disabled={mutationClinica.isPending}
                  >
                    <Save className="h-5 w-5 mr-2" /> Salvar Configurações
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </TabsContent>

        {/* ABA 2: EQUIPE */}
        <TabsContent value="equipe" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" /> Veterinários Vinculados
                </CardTitle>
                <CardDescription>
                  Gerencie o acesso dos profissionais à base de dados da
                  clínica.
                </CardDescription>
              </div>
              {!isReadOnly && (
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Vet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Membro da Equipe</DialogTitle>
                    </DialogHeader>
                    <Form {...formVet}>
                      <form
                        onSubmit={formVet.handleSubmit((d) =>
                          mutationVet.mutate(d),
                        )}
                        className="space-y-4 py-4"
                      >
                        <FormField
                          control={formVet.control}
                          name="nome"
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
                          control={formVet.control}
                          name="email"
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
                            control={formVet.control}
                            name="crmv"
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
                            control={formVet.control}
                            name="senha"
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
                        <Button
                          type="submit"
                          className="w-full mt-4"
                          disabled={mutationVet.isPending}
                        >
                          {mutationVet.isPending
                            ? "Cadastrando..."
                            : "Cadastrar Veterinário"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {/* REMOVIDO: O bloqueio de lista. Vets podem ver a equipe, só não editam. */}
              {equipe && equipe.length > 0 ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {equipe.map((membro: any) => (
                    <div
                      key={membro.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-white border text-slate-500">
                            {membro.nome[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-800">
                            {membro.nome}
                          </p>
                          <p className="text-xs text-slate-500">
                            {membro.email} • {membro.crmv}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {membro.perfil?.replace("ADMIN_", "GESTOR ")}
                        </Badge>

                        {/* BOTÃO DE EXCLUIR (Só se não for ReadOnly e não for ele mesmo) */}
                        {!isReadOnly && membro.id !== user?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remover da equipe?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {membro.nome} perderá acesso aos dados da
                                  clínica.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() =>
                                    mutationRemover.mutate(membro.id)
                                  }
                                >
                                  Confirmar Remoção
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-lg text-slate-400">
                  <p>Nenhum membro adicional na equipe.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

