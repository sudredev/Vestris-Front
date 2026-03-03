import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Auth & Layout
import { Login } from "./pages/Login";
import { AppLayout } from "./layouts/AppLayout";

// Páginas Vet
import { VetDashboard } from "./pages/vet/VetDashboard";
import { AgendaAtendimentos } from "./pages/atendimentos/AgendaAtendimentos";
import { NovoAgendamento } from "./pages/atendimentos/NovoAgendamento";
import { CockpitAtendimento } from "./pages/atendimentos/CockpitAtendimento";

// Páginas Pacientes
import { MeusPacientes } from "./pages/pacientes/MeusPacientes";
import { PacienteForm } from "./pages/pacientes/PacienteForm";
import { DetalhesPaciente } from "./pages/pacientes/DetalhesPaciente";

// Páginas Conhecimento
import { Biblioteca } from "./pages/Biblioteca";
import { DetalhesEspecie } from "./pages/DetalhesEspecie";
import { DetalhesProtocolo } from "./pages/DetalhesProtocolo";
import { MeusProtocolos } from "./pages/protocolos/MeusProtocolos";
import { ProtocoloForm } from "./pages/protocolos/ProtocoloForm";
import { CatalogoMedicamentos } from "./pages/medicamentos/CatalogoMedicamentos";
import { DetalhesMedicamento } from "./pages/medicamentos/DetalhesMedicamentos";
import { HubVacinacao } from "./pages/vacinacao/HubVacinacao";

// Configurações
import { MinhaClinica } from "./pages/configuracoes/MinhaClinica";

// Públicas
import { Planos } from "./pages/public/Planos";
import { Cadastro } from "./pages/public/Cadastro";
import { LandingPage } from "./pages/public/LandingPage";

// ADMIN GLOBAL
import { SuperAdminDashboard } from "./pages/admin/SuperAdminDashboard";
import { AdminClinicas } from "./pages/admin/AdminClinicas";
import { AdminConteudo } from "./pages/admin/AdminConteudo";
import { AdminProtocolos } from "./pages/admin/AdminProtocolos";
// Forms Admin
import { AdminMedicamentoForm } from "./pages/admin/forms/AdminMedicamentoForm";
import { AdminVacinaForm } from "./pages/admin/forms/AdminVacinaForm";
import { AdminDoencaForm } from "./pages/admin/forms/AdminDoencaForm";
import { AdminEspecieForm } from "./pages/admin/forms/AdminEspecieForm";
import { AdminProtocoloForm } from "./pages/admin/forms/AdminProtocoloForm";
import { AdminContraindicacaoForm } from "./pages/admin/forms/AdminContraindicacaoForm";
import { AuditLogs } from "./pages/admin/AuditLogs";
import { CatalogoVacinas } from "./pages/vacinas/CatalogoVacinas";
import { DetalhesVacina } from "./pages/vacinas/DetalhesVacina";

function App() {
  const isAuthenticated = !!localStorage.getItem("vestris_token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Landing Page) */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/area-vet" />}
        />

        <Route path="/planos" element={<Planos />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* --- ÁREA PROTEGIDA --- */}
        <Route
          element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}
        >
          <Route path="/area-vet" element={<VetDashboard />} />

          {/* Atendimentos */}
          <Route path="/atendimentos" element={<AgendaAtendimentos />} />
          <Route
            path="/atendimentos/novo-agendamento"
            element={<NovoAgendamento />}
          />
          <Route path="/atendimentos/:id" element={<CockpitAtendimento />} />

          {/* Pacientes */}
          <Route path="/pacientes" element={<MeusPacientes />} />
          <Route path="/pacientes/novo" element={<PacienteForm />} />
          <Route path="/pacientes/:id" element={<DetalhesPaciente />} />

          {/* Biblioteca */}
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/especies/:id" element={<DetalhesEspecie />} />
          <Route
            path="/especies/:especieId/doencas/:doencaId"
            element={<DetalhesProtocolo />}
          />

          {/* CATÁLOGO DE VACINAS (NOVO) */}
          <Route path="/vacinas" element={<CatalogoVacinas />} />
          <Route path="/vacinas/:id" element={<DetalhesVacina />} />

          <Route path="/vacinacao" element={<HubVacinacao />} />

          {/* Ferramentas */}
          <Route path="/protocolos" element={<MeusProtocolos />} />
          <Route path="/protocolos/novo" element={<ProtocoloForm />} />
          <Route path="/medicamentos" element={<CatalogoMedicamentos />} />
          <Route path="/medicamentos/:id" element={<DetalhesMedicamento />} />

          {/* Configurações */}
          <Route path="/minha-clinica" element={<MinhaClinica />} />

          {/* --- ROTA ADMIN GLOBAL --- */}
          <Route path="/admin" element={<SuperAdminDashboard />} />
          <Route path="/admin/clinicas" element={<AdminClinicas />} />
          <Route path="/admin/conteudo" element={<AdminConteudo />} />
          <Route path="/admin/protocolos" element={<AdminProtocolos />} />
          <Route path="/admin/auditoria" element={<AuditLogs />} />

          {/* Formulários Admin */}
          <Route
            path="/admin/medicamentos/novo"
            element={<AdminMedicamentoForm />}
          />
          <Route
            path="/admin/medicamentos/editar/:id"
            element={<AdminMedicamentoForm />}
          />
          <Route path="/admin/vacinas/novo" element={<AdminVacinaForm />} />
          <Route
            path="/admin/vacinas/editar/:id"
            element={<AdminVacinaForm />}
          />
          <Route path="/admin/doencas/novo" element={<AdminDoencaForm />} />
          <Route
            path="/admin/doencas/editar/:id"
            element={<AdminDoencaForm />}
          />
          <Route path="/admin/especies/novo" element={<AdminEspecieForm />} />
          <Route
            path="/admin/especies/editar/:id"
            element={<AdminEspecieForm />}
          />
          <Route
            path="/admin/protocolos/novo"
            element={<AdminProtocoloForm />}
          />
          <Route
            path="/admin/protocolos/editar/:id"
            element={<AdminProtocoloForm />}
          />

          {/* Rota Nova: CRUD Segurança */}
          <Route
            path="/admin/seguranca/novo"
            element={<AdminContraindicacaoForm />}
          />
          <Route
            path="/admin/seguranca/editar/:id"
            element={<AdminContraindicacaoForm />}
          />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/area-vet" : "/"} replace />
          }
        />
      </Routes>

      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}

export default App;
