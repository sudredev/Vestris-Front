import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientsService, speciesService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

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
import { Plus, Search, PawPrint, User, FileText } from "lucide-react";

export function MeusPacientes() {
  const user = getAuthUser();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  const { data: pacientes, isLoading: loadingPacientes } = useQuery({
    queryKey: ["meus-pacientes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await patientsService.listarPacientes(user.id);
      return res.data.dados || [];
    },
    enabled: !!user?.id,
  });

  const { data: especies } = useQuery({
    queryKey: ["lista-especies-lookup"],
    queryFn: async () => {
      const res = await speciesService.listarEspecies();
      return res.data.dados || [];
    },
  });

  const getNomeEspecie = (id: string) => {
    const esp = especies?.find((e) => e.id === id);
    return esp ? esp.nomePopular : "---";
  };

  const filtrados = pacientes?.filter(
    (p) =>
      (p.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
      (p.dadosTutor || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* HEADER: Botão maior e alinhado ao centro */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Meus Pacientes
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gerencie os animais cadastrados.
          </p>
        </div>

        <Button
          // Botão maior (h-12), texto maior (text-base) e mais largo (px-8)
          className="shadow-md bg-slate-900 hover:bg-slate-800 rounded-lg px-8 h-12 text-base font-medium transition-all hover:-translate-y-0.5"
          onClick={() => navigate("/pacientes/novo")}
        >
          <Plus className="h-5 w-5 mr-2" /> Novo Paciente
        </Button>
      </div>

      {/* FILTRO */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome do paciente ou tutor..."
          className="pl-11 h-11 rounded-lg border-slate-200 bg-white shadow-sm focus:ring-1 focus:ring-slate-200 transition-all max-w-lg text-base"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loadingPacientes ? (
          <div className="p-16 text-center text-slate-400">
            Carregando lista...
          </div>
        ) : filtrados && filtrados.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-[25%] py-4 pl-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Paciente
                </TableHead>
                <TableHead className="w-[45%] py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Tutor
                </TableHead>
                <TableHead className="w-[15%] py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  ID
                </TableHead>
                <TableHead className="w-[15%] py-4 text-right pr-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow
                  key={p.id}
                  className="group cursor-pointer hover:bg-slate-50/60 transition-colors border-b border-slate-50 last:border-0"
                  onClick={() => navigate(`/pacientes/${p.id}`)}
                >
                  {/* PACIENTE */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-lg">
                        {p.nome}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1 border border-slate-200">
                        <PawPrint className="h-3 w-3" />
                        {getNomeEspecie(p.especieId || "")}
                      </span>
                    </div>
                  </TableCell>

                  {/* TUTOR */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3 max-w-[400px]">
                      <User className="h-4 w-4 text-slate-300 shrink-0" />
                      <span
                        className="text-sm text-slate-600 truncate font-medium"
                        title={p.dadosTutor}
                      >
                        {p.dadosTutor}
                      </span>
                    </div>
                  </TableCell>

                  {/* ID */}
                  <TableCell className="py-4">
                    <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      {p.identificacaoAnimal || "---"}
                    </span>
                  </TableCell>

                  {/* AÇÃO */}
                  <TableCell className="py-4 text-right pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-slate-200 text-slate-600 hover:bg-white hover:text-primary hover:border-primary transition-all shadow-sm text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pacientes/${p.id}`);
                      }}
                    >
                      <FileText className="mr-2 h-3.5 w-3.5" /> Ficha Clínica
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-base font-medium text-slate-900">
              Nenhum paciente encontrado
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Tente ajustar sua busca ou adicione um novo animal.
            </p>
            <Button variant="outline" onClick={() => setBusca("")}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
