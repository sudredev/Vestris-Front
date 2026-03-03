import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { feedbackService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { SugestaoRequestTipoEnum } from "@/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";

interface DialogSugestaoProps {
  tipo: "ESPECIE" | "DOENCA" | "PROTOCOLO" | "CALCULO";
  contexto?: string;
  labelBotao?: string;
  // NOVAS PROPS PARA ESTILIZAÇÃO
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export function DialogSugestao({
  tipo,
  contexto,
  labelBotao,
  variant = "outline", // Padrão continua outline
  className,
}: DialogSugestaoProps) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [obs, setObs] = useState("");
  const user = getAuthUser();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuário não logado");

      const conteudoJson = JSON.stringify({
        sugestao: nome,
        observacao: obs,
        contextoTecnico: contexto,
      });

      let tipoEnum: SugestaoRequestTipoEnum;
      switch (tipo) {
        case "ESPECIE":
          tipoEnum = "ESPECIE" as SugestaoRequestTipoEnum;
          break;
        case "DOENCA":
          tipoEnum = "DOENCA" as SugestaoRequestTipoEnum;
          break;
        case "PROTOCOLO":
          tipoEnum = "PROTOCOLO" as SugestaoRequestTipoEnum;
          break;
        case "CALCULO":
          tipoEnum = "CALCULO" as SugestaoRequestTipoEnum;
          break;
        default:
          tipoEnum = "OUTRO" as SugestaoRequestTipoEnum;
      }

      const payload = {
        usuarioId: user.id,
        conteudo: conteudoJson,
        tipo: tipoEnum,
      };

      if (tipo === "ESPECIE") await feedbackService.sugerirEspecie(payload);
      else if (tipo === "DOENCA") await feedbackService.sugerirDoenca(payload);
      else if (tipo === "PROTOCOLO")
        await feedbackService.sugerirProtocolo(payload);
      else await feedbackService.sugerirCalculo(payload);
    },
    onSuccess: () => {
      setAberto(false);
      setNome("");
      setObs("");
      toast.success("Sugestão enviada com sucesso!");
    },
    onError: () => toast.error("Erro ao enviar sugestão."),
  });

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size="sm" // O tamanho pode ser sobrescrito pelo className
          className={`gap-2 ${className}`} // Aplica classes extras
        >
          <PlusCircle className="h-4 w-4" />
          {labelBotao || "Sugerir adição"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sugerir Melhoria</DialogTitle>
          <DialogDescription>
            Ajude a construir a base do Vestris. Nossa curadoria irá analisar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Sua Sugestão (Nome/Título)</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="O que está faltando?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="obs">Observações / Fonte (Opcional)</Label>
            <Textarea
              id="obs"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Detalhes, link da fonte ou justificativa..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !nome}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enviar Sugestão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
