import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordsService, patientsService } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Play, // CalendarClock removido
  FileText,
  CheckCircle,
  Plus,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { AgendamentoRequest } from "@/api";

export function AgendaAtendimentos() {
  const user = getAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estado
  const [dataFiltro, setDataFiltro] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Form Estado
  const [novoAgendamento, setNovoAgendamento] = useState({
    pacienteId: "",
    titulo: "",
    hora: "08:00",
  });

  // 1. Busca Atendimentos
  const { data: agenda, isLoading } = useQuery({
    queryKey: ["agenda", user?.id, dataFiltro],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await recordsService.listarMeusAtendimentos(
        user.id,
        undefined,
        undefined,
        dataFiltro,
        dataFiltro
      );
      return res.data.dados || [];
    },
    enabled: !!user?.id,
  });

  // 2. Busca Pacientes
  const { data: pacientes } = useQuery({
    queryKey: ["pacientes-select"],
    queryFn: async () => {
      return (await patientsService.listarPacientes(user!.id)).data.dados || [];
    },
  });

  // 3. Criar Agendamento
  const createMutation = useMutation({
    mutationFn: async () => {
      const dataHoraIso = `${dataFiltro}T${novoAgendamento.hora}:00`;

      const payload = {
        veterinarioId: user?.id,
        pacienteId: novoAgendamento.pacienteId,
        titulo: novoAgendamento.titulo,
        dataHora: new Date(dataHoraIso).toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any as AgendamentoRequest;

      await recordsService.agendarAtendimento(payload);
    },
    onSuccess: () => {
      toast.success("Agendado com sucesso!");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      setNovoAgendamento({ pacienteId: "", titulo: "", hora: "08:00" });
    },
    onError: () => toast.error("Erro ao agendar."),
  });

  // 4. Iniciar Atendimento
  const iniciarMutation = useMutation({
    mutationFn: async (id: string) => {
      await recordsService.atualizarStatusAtendimento(id, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: "EM_ANDAMENTO" as any,
      });
    },
    onSuccess: (_, id) => {
      toast.success("Atendimento iniciado!");
      navigate(`/atendimentos/${id}`);
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Agenda Clínica</h1>
          <p className="text-slate-500">Organize seus atendimentos.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <Filter className="h-4 w-4 text-slate-400 ml-2" />
          <Input
            type="date"
            className="border-0 shadow-none w-auto focus-visible:ring-0"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
          />

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Agendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select
                    onValueChange={(v) =>
                      setNovoAgendamento({ ...novoAgendamento, pacienteId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes?.map((p) => (
                        <SelectItem key={p.id} value={p.id!}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    placeholder="Ex: Consulta Rotina"
                    onChange={(e) =>
                      setNovoAgendamento({
                        ...novoAgendamento,
                        titulo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={novoAgendamento.hora}
                    onChange={(e) =>
                      setNovoAgendamento({
                        ...novoAgendamento,
                        hora: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-center text-slate-500 py-10">
            Carregando agenda...
          </p>
        ) : agenda && agenda.length > 0 ? (
          agenda.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-all border-l-4 border-l-primary/50"
            >
              <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px] bg-slate-50 p-2 rounded">
                    <span className="block text-xl font-bold text-slate-700">
                      {item.dataHora
                        ? format(new Date(item.dataHora), "HH:mm")
                        : "--:--"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.titulo}</h3>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        {item.pacienteNome}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{item.pacienteEspecie}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  {/* Badges de Status */}
                  {item.status === "AGENDADO" && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      Agendado
                    </Badge>
                  )}
                  {item.status === "EM_ANDAMENTO" && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                    >
                      Em Andamento
                    </Badge>
                  )}
                  {item.status === "REALIZADO" && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Finalizado
                    </Badge>
                  )}

                  {item.status === "AGENDADO" && (
                    <Button
                      size="sm"
                      onClick={() => iniciarMutation.mutate(item.id!)}
                    >
                      <Play className="mr-2 h-4 w-4" /> Iniciar
                    </Button>
                  )}
                  {item.status === "EM_ANDAMENTO" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/atendimentos/${item.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" /> Prontuário
                    </Button>
                  )}
                  {item.status === "REALIZADO" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/atendimentos/${item.id}`)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{" "}
                      Ver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-10 text-center border-2 border-dashed rounded-lg">
            <p className="text-slate-500">Nenhum atendimento para esta data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
