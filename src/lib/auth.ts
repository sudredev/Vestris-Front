/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/auth.ts

import { jwtDecode } from "jwt-decode";

export interface User {
  id: string;
  email: string;
  role:
    | "ADMIN_GLOBAL"
    | "ADMIN_GESTOR"
    | "ADMIN_CLINICO"
    | "VETERINARIO"
    | "ESTUDANTE";
  scope?: string;
  clinicaId?: string;
  exp: number;
}

export function getAuthUser(): User | null {
  const token = localStorage.getItem("vestris_token");
  if (!token) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded: any = jwtDecode(token);

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.perfil,
      scope: decoded.scope,
      clinicaId: decoded.clinicaId, // O Backend vai começar a mandar isso agora
      exp: decoded.exp,
    };
  } catch (error) {
    return null;
  }
}

// --- CORREÇÃO: Limpar todos os vestígios de Admin/Modos ---
export function logout() {
  localStorage.removeItem("vestris_token");
  localStorage.removeItem("vestris_admin_token"); // Remove o modo impersonate
  localStorage.removeItem("vestris_view_mode"); // Remove a preferência de Vet/Gestor
  window.location.href = "/login";
}
