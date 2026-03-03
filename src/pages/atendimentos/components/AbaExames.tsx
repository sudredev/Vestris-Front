// src/pages/atendimentos/components/AbaExames.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examesService } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Paperclip,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  atendimentoId: string;
  readOnly?: boolean;
}

export function AbaExames({ atendimentoId, readOnly }: Props) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [obsUpload, setObsUpload] = useState("");

  // 1. Listar Exames
  const { data: exames, isLoading } = useQuery({
    queryKey: ["exames-atendimento", atendimentoId],
    queryFn: async () => {
      try {
        const res =
          await examesService.listarExamesPorAtendimento(atendimentoId);
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
    enabled: !!atendimentoId,
  });

  // 2. Upload
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // O endpoint espera multipart/form-data. O cliente gerado geralmente aceita File.
      // Se o cliente gerado pedir 'blob', 'File' satisfaz.
      await examesService.uploadExame(
        atendimentoId,
        file,
        obsUpload, // Nota opcional
      );
    },
    onSuccess: () => {
      toast.success("Arquivo anexado com sucesso!");
      setObsUpload("");
      queryClient.invalidateQueries({
        queryKey: ["exames-atendimento", atendimentoId],
      });
    },
    onError: () => toast.error("Erro ao enviar arquivo."),
    onSettled: () => setUploading(false),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    uploadMutation.mutate(file);
  };

  // 3. Deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await examesService.deletarExame(id);
    },
    onSuccess: () => {
      toast.success("Anexo removido.");
      queryClient.invalidateQueries({
        queryKey: ["exames-atendimento", atendimentoId],
      });
    },
    onError: () => toast.error("Erro ao remover."),
  });

  return (
    <div className="space-y-6 pt-4 h-full flex flex-col">
      {/* AREA DE UPLOAD */}
      {!readOnly && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
          <div>
            <Label className="text-xs font-bold text-slate-500 uppercase">
              Novo Anexo
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Observação (opcional, ex: Hemograma)"
                value={obsUpload}
                onChange={(e) => setObsUpload(e.target.value)}
                className="bg-white h-10 text-sm"
              />
              <div className="relative">
                <input
                  type="file"
                  id="upload-exame"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <Button
                  asChild
                  disabled={uploading}
                  className="gap-2 cursor-pointer bg-slate-900 h-10"
                >
                  <label htmlFor="upload-exame">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Anexar</span>
                  </label>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTAGEM */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">
            Carregando anexos...
          </div>
        ) : !exames || exames.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Paperclip className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum exame anexado.</p>
            <p className="text-xs text-slate-400">Suporta PDF, JPG e PNG.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {exames.map((exame) => (
              <Card
                key={exame.id}
                className="group hover:border-blue-300 transition-all border-slate-200"
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${exame.tipoArquivo?.includes("pdf") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      {exame.tipoArquivo?.includes("pdf") ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-bold text-slate-800 text-sm truncate"
                        title={exame.nomeArquivo}
                      >
                        {exame.nomeArquivo}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {exame.observacoes || "Sem observações"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar/Baixar"
                      onClick={() => window.open(exame.urlArquivo, "_blank")}
                    >
                      <Eye className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                    </Button>

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remover"
                        className="hover:bg-red-50"
                        onClick={() => deleteMutation.mutate(exame.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
