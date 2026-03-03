import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, Search, LogOut, Loader2, Ban } from "lucide-react";
import { usersService, adminService } from "@/lib/api-client";

export function SuperAdminDashboard() {
  const user = getAuthUser();
  const [busca, setBusca] = useState("");

  // 1. BUSCA REAL DE USUÁRIOS
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Se o usuário não for global, nem tenta buscar para não dar 403 na API
      if (user?.scope !== "GLOBAL") return [];

      try {
        const res = await usersService.listarUsuarios(undefined, undefined);
        return res.data.dados || [];
      } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return [];
      }
    },
    // Só roda a query se for GLOBAL
    enabled: user?.scope === "GLOBAL",
  });

  // 2. IMPERSONATE (VER COMO)
  const impersonateMutation = useMutation({
    mutationFn: async (targetId: string) => {
      if (!user?.id) throw new Error("Admin não logado");

      const res = await adminService.impersonateUser(user.id, targetId);

      if (!res.data.dados?.token) throw new Error("Token não gerado");
      return res.data.dados.token;
    },
    onSuccess: (novoToken) => {
      // 1. Guarda o token atual (Seu crachá de Admin) no bolso
      const adminToken = localStorage.getItem("vestris_token");
      if (adminToken) {
        localStorage.setItem("vestris_admin_token", adminToken);
      }

      // 2. Coloca o crachá do cliente
      localStorage.setItem("vestris_token", novoToken);

      toast.success("Acesso concedido!", {
        description: "Redirecionando para a visão do usuário...",
      });

      // 3. Entra no sistema
      setTimeout(() => (window.location.href = "/area-vet"), 1000);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("ERRO DETALHADO:", error); // Vai aparecer no F12 -> Console
      console.log("Status:", error?.response?.status);
      console.log("URL tentada:", error?.config?.url);

      toast.error(`Erro: ${error.message}`);
    },
  });

  const filtrados =
    usuarios?.filter(
      (u) =>
        (u.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(busca.toLowerCase()),
    ) || [];

  // --- VERIFICAÇÃO DE SEGURANÇA CORRIGIDA ---
  // Agora validamos pelo SCOPE, que é o que define o Super Admin
  if (user?.scope !== "GLOBAL") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50 p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Ban className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Acesso Negado
          </h1>
          <p className="text-slate-600 mb-6">
            Esta área é restrita à administração global do Vestris. Seu perfil
            atual ({user?.role}) não tem permissão.
          </p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/area-vet")}
          >
            Voltar para Clínica
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Painel Super Admin 👑
          </h1>
          <p className="text-slate-500">Gestão Global de Usuários e Clínicas</p>
        </div>

        <Button
          variant="destructive"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-slate-400"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando base de usuários...
                  </TableCell>
                </TableRow>
              ) : filtrados.length > 0 ? (
                filtrados.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.perfil === "ADMIN" ? "default" : "secondary"}
                      >
                        {u.perfil}
                      </Badge>
                      {u.scope === "GLOBAL" && (
                        <Badge className="ml-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                          Global
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50 gap-2"
                          onClick={() => impersonateMutation.mutate(u.id!)}
                          disabled={impersonateMutation.isPending}
                        >
                          <Eye className="h-4 w-4" /> Ver Como
                        </Button>
                      )}
                      {u.id === user.id && (
                        <span className="text-xs text-slate-300 italic pr-2">
                          Você
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-slate-400"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
