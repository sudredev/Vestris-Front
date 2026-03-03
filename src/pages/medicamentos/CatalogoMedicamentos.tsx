import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicamentosService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Pill,
  FlaskConical,
  Factory,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function CatalogoMedicamentos() {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const user = getAuthUser();
  const queryClient = useQueryClient();

  const isGlobal = user?.scope === "GLOBAL";

  const { data: farmacos, isLoading } = useQuery({
    queryKey: ["medicamentos-catalogo"],
    queryFn: async () => {
      try {
        const res = await medicamentosService.listarMedicamentos();
        return res.data.dados || [];
      } catch {
        return [];
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await medicamentosService.deletarMedicamento(id);
    },
    onSuccess: () => {
      toast.success("Medicamento excluído.");
      queryClient.invalidateQueries({ queryKey: ["medicamentos-catalogo"] });
    },
    onError: () => toast.error("Não foi possível excluir (item em uso)."),
  });

  const filtrados = farmacos?.filter(
    (f) =>
      (f.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
      (f.fabricante || "").toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Pill className="h-8 w-8 text-blue-600" /> Catálogo Farmacológico
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Base oficial de medicamentos.
          </p>
        </div>

        {isGlobal && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2"
            onClick={() => navigate("/admin/medicamentos/novo")}
          >
            <Plus className="h-4 w-4" /> Novo Medicamento
          </Button>
        )}
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Buscar..."
          className="pl-11 h-12 text-base"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-24 text-slate-400">Carregando...</div>
      ) : filtrados && filtrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((med) => (
            <Card
              key={med.id}
              // CORREÇÃO: Cursor pointer e onClick no Card
              className="group relative overflow-hidden border border-slate-200 bg-white hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer hover:-translate-y-1"
              onClick={() => navigate(`/medicamentos/${med.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-slate-600 bg-slate-50"
                  >
                    {med.concentracao || "N/A"}
                  </Badge>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-xl text-slate-800 leading-tight">
                    {med.nome}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Factory className="h-3.5 w-3.5" />{" "}
                    <span>{med.fabricante || "Genérico"}</span>
                  </div>
                </div>

                {isGlobal && (
                  <div
                    className="pt-4 border-t border-slate-100 flex justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-600"
                      onClick={() =>
                        navigate(`/admin/medicamentos/editar/${med.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir Medicamento?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={() => deleteMutation.mutate(med.id!)}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500">Nenhum medicamento encontrado</p>
        </div>
      )}
    </div>
  );
}
