## layouts

### AppLayout.tsx

```typescript
// layouts\AppLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LogOut,
  User,
  LayoutDashboard,
  CalendarDays,
  PawPrint,
  Library,
  Syringe,
  Pill,
  ShieldAlert,
  Building2,
  Database,
  EyeOff,
  ShieldCheck, // Ícone Auditoria
} from "lucide-react";
import { logout, getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GuiaRapido } from "@/components/GuiaRapido";
import { RoleSwitcher } from "@/components/RoleSwitcher";

import logoImg from "@/assets/logo-ofc-vestris.png";

export function AppLayout() {
  const user = getAuthUser();
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return `flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
      isActive
        ? "bg-slate-900 text-white shadow-md"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  const displayName = user?.email?.split("@")[0] || "Usuário";
  const isGlobal = user?.scope === "GLOBAL";

  // Lógica de Impersonate
  const adminTokenBackup = localStorage.getItem("vestris_admin_token");
  const isImpersonating = !!adminTokenBackup;

  const handleExitImpersonation = () => {
    if (adminTokenBackup) {
      localStorage.setItem("vestris_token", adminTokenBackup);
      localStorage.removeItem("vestris_admin_token");
      window.location.href = "/admin";
    }
  };

  // --- LÓGICA DE VISIBILIDADE DE MENU (GOVERNANÇA) ---
  const viewMode = localStorage.getItem("vestris_view_mode");

  // Vet Ativo: VETERINARIO ou (ADMIN_CLINICO em modo VETERINARIO)
  const isVetAtivo =
    user?.role === "VETERINARIO" ||
    (user?.role === "ADMIN_CLINICO" && viewMode === "VETERINARIO");

  // Gestor Ativo: ADMIN_GESTOR, ADMIN_GLOBAL ou (ADMIN_CLINICO em modo ADMIN)
  const isGestorAtivo =
    user?.role === "ADMIN_GESTOR" ||
    user?.role === "ADMIN_GLOBAL" ||
    (user?.role === "ADMIN_CLINICO" && viewMode !== "VETERINARIO");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR FIXA */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 z-50 shadow-sm relative">
        <div className="h-24 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo Vestris"
              className="h-12 w-auto object-contain"
            />
            <span className="font-bold text-2xl tracking-tight text-slate-900 mt-1">
              VESTRIS
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
          {/* SWITCHER DE MODO (Só p/ Admin Clínico) */}
          <RoleSwitcher />

          {/* === MENU DO SUPER ADMIN (GLOBAL) === */}
          {isGlobal && !isImpersonating && (
            <>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-2 mx-2">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3" /> Admin Global
                </p>
                <p className="text-[10px] text-purple-600 leading-tight">
                  Você está gerenciando o sistema.
                </p>
              </div>

              <div>
                <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  SaaS & Clientes
                </h3>
                <div className="space-y-1">
                  <Link to="/admin" className={getLinkClass("/admin")}>
                    <User className="h-4 w-4" /> Usuários & Acesso
                  </Link>
                  <Link
                    to="/admin/clinicas"
                    className={getLinkClass("/admin/clinicas")}
                  >
                    <Building2 className="h-4 w-4" /> Gestão de Clínicas
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Base de Conteúdo
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/admin/conteudo"
                    className={getLinkClass("/admin/conteudo")}
                  >
                    <Database className="h-4 w-4" /> Central de Cadastros
                  </Link>
                  <Link
                    to="/admin/protocolos"
                    className={getLinkClass("/admin/protocolos")}
                  >
                    <Syringe className="h-4 w-4" /> Protocolos Oficiais
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* === MENU CLÍNICO (Vets e Admin Clínico no modo Vet) === */}
          {isVetAtivo && !isGlobal && (
            <div>
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Atendimento
              </h3>
              <div className="space-y-1">
                <Link to="/area-vet" className={getLinkClass("/area-vet")}>
                  <LayoutDashboard className="h-4 w-4" /> Visão Geral
                </Link>
                <Link
                  to="/atendimentos"
                  className={getLinkClass("/atendimentos")}
                >
                  <CalendarDays className="h-4 w-4" /> Agenda
                </Link>
                <Link to="/pacientes" className={getLinkClass("/pacientes")}>
                  <PawPrint className="h-4 w-4" /> Pacientes
                </Link>
                <Link to="/protocolos" className={getLinkClass("/protocolos")}>
                  <Syringe className="h-4 w-4" /> Meus Protocolos
                </Link>
              </div>
            </div>
          )}

          {/* === MENU GESTÃO (Gestores e Admin Clínico no modo Admin) === */}
          {isGestorAtivo && !isGlobal && (
            <div>
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gestão da Clínica
              </h3>
              <div className="space-y-1">
                <Link to="/pacientes" className={getLinkClass("/pacientes")}>
                  <PawPrint className="h-4 w-4" /> Base de Pacientes
                </Link>
                <Link
                  to="/atendimentos"
                  className={getLinkClass("/atendimentos")}
                >
                  <CalendarDays className="h-4 w-4" /> Histórico de Agendamentos
                </Link>

                {/* Link para Protocolos no modo Gestão (Leitura) */}
                <Link to="/protocolos" className={getLinkClass("/protocolos")}>
                  <Syringe className="h-4 w-4" /> Protocolos da Instituição
                </Link>

                <Link
                  to="/admin/auditoria"
                  className={getLinkClass("/admin/auditoria")}
                >
                  <ShieldCheck className="h-4 w-4" /> Logs de Auditoria
                </Link>
                <Link
                  to="/minha-clinica"
                  className={getLinkClass("/minha-clinica")}
                >
                  <Building2 className="h-4 w-4" /> Configurações & Equipe
                </Link>
              </div>
            </div>
          )}

          {/* === BASE CIENTÍFICA (COMUM A TODOS) === */}
          <div>
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">
              Base Científica
            </h3>
            <div className="space-y-1">
              <Link to="/biblioteca" className={getLinkClass("/biblioteca")}>
                <Library className="h-4 w-4" /> Espécies & Doenças
              </Link>
              <Link
                to="/medicamentos"
                className={getLinkClass("/medicamentos")}
              >
                <Pill className="h-4 w-4" /> Medicamentos
              </Link>
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div
          className={`p-4 border-t border-slate-100 ${
            isImpersonating ? "bg-purple-50" : "bg-slate-50/50"
          }`}
        >
          {isImpersonating && (
            <div className="mb-4">
              <Button
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white border border-purple-400 shadow-md animate-pulse"
                onClick={handleExitImpersonation}
              >
                <EyeOff className="h-4 w-4 mr-2" /> Sair do Modo Ver Como
              </Button>
            </div>
          )}

          {/* GUIA RÁPIDO */}
          {!isImpersonating && (
            <div className="mb-4">
              <GuiaRapido />
            </div>
          )}

          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate capitalize">
                {displayName}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                  {user?.role?.replace("ADMIN_", "") || "USUÁRIO"}
                </p>
                {isGlobal && (
                  <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-bold">
                    GLOBAL
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isImpersonating && (
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sair do Sistema
            </Button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {isImpersonating && (
          <div className="bg-purple-600 text-white text-xs font-bold text-center py-1 z-50 shadow-md">
            MODO DE VISUALIZAÇÃO ATIVO — Você está acessando a conta de{" "}
            {displayName}
          </div>
        )}

        <main className="flex-1 overflow-auto scroll-smooth bg-slate-50">
          <div className="w-full min-h-full p-6 md:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

```

