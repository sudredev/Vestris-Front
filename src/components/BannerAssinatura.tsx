import { useQuery } from "@tanstack/react-query";
import { clinicaService, assinaturaService } from "@/lib/api-client"; // Use o serviço correto
import { getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle } from "lucide-react";

export function BannerAssinatura() {
  const user = getAuthUser();

  // 1. Busca a Clínica para ter o ID
  const { data: clinica } = useQuery({
    queryKey: ["minha-clinica-banner", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const res = await clinicaService.obterMinhaClinica(user.id);
        return res.data.dados;
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // 2. Busca a Assinatura usando o ID da Clínica
  const { data: assinatura } = useQuery({
    queryKey: ["minha-assinatura", clinica?.id],
    queryFn: async () => {
      if (!clinica?.id) return null;
      try {
        // CORREÇÃO: Usando assinaturaService
        const res = await assinaturaService.obterMinhaAssinatura(clinica.id);
        return res.data.dados;
      } catch {
        return null;
      }
    },
    enabled: !!clinica?.id, // Só roda quando a clínica carregar
  });

  // Se não carregou, ou não tem assinatura, ou já é ATIVO/MANUAL (Enterprise), esconde.
  if (!assinatura) return null;
  if (assinatura.status === "ATIVO" || assinatura.tipoFaturamento === "MANUAL")
    return null;

  // Lógica de Link: Tenta pegar do plano, senão usa um link padrão ou contato
  // Você precisa garantir que o DTO do Plano tenha 'urlPagamento' ou 'descricao' com o link
  // Como o Swagger gera tipos estritos, vamos usar 'any' se o campo urlPagamento não foi gerado ainda no TS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkPagamento = (assinatura.plano as any).urlPagamento || "#";

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-full">
          {assinatura.status === "TRIAL" ? (
            <Crown className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {assinatura.status === "TRIAL"
              ? "Período de Teste Gratuito"
              : "Assinatura Pendente"}
          </h3>
          <p className="text-indigo-100 text-sm">
            Plano atual: <strong>{assinatura.plano?.nome}</strong>. Mantenha seu
            acesso completo.
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="whitespace-nowrap font-bold text-indigo-700 shadow-sm"
        onClick={() => window.open(linkPagamento, "_blank")}
      >
        {assinatura.status === "TRIAL" ? "Assinar Agora" : "Regularizar"}
      </Button>
    </div>
  );
}
