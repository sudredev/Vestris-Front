import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock, Mail } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // CORREÇÃO: Garante que entra limpo, sem resíduos de admin global
    localStorage.removeItem("vestris_admin_token");
    try {
      const response = await authService.login({ email, senha });

      if (response.data.sucesso && response.data.dados?.token) {
        localStorage.setItem("vestris_token", response.data.dados.token);
        toast.success("Bem-vindo de volta!");

        // Redirecionamento forçado para recarregar contexto
        setTimeout(() => {
          window.location.href = "/area-vet";
        }, 800);
      } else {
        setErro("Credenciais inválidas.");
        toast.error("E-mail ou senha incorretos.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setErro("Erro de conexão.");
      toast.error("Servidor indisponível no momento.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 relative">
      {/* BOTÃO VOLTAR (FLUTUANTE) */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-900 gap-2"
        onClick={() => (window.location.href = "/")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o início
      </Button>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto mb-6">
              <img
                src={logoImg}
                alt="Vestris Logo"
                className="h-16 w-auto mx-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-base text-slate-500">
              Entre com suas credenciais profissionais
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* CORREÇÃO AQUI: className em vez de classID */}
                  <Label htmlFor="senha" className="text-slate-700">
                    Senha
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {erro && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 text-center font-medium">
                  {erro}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 hover:shadow-xl transition-all mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Acessando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-50 pt-6 pb-8 text-center bg-slate-50/50 rounded-b-xl">
            <p className="text-sm text-slate-500">Ainda não tem uma conta?</p>
            <Button
              variant="outline"
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => (window.location.href = "/planos")}
            >
              Conhecer Planos e Assinar
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>&copy; 2026 Vestris Tecnologia Veterinária.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-slate-600">
              Termos
            </a>
            <a href="#" className="hover:text-slate-600">
              Privacidade
            </a>
            <a href="#" className="hover:text-slate-600">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
