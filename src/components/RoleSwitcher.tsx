import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Stethoscope, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAuthUser } from "@/lib/auth";

export function RoleSwitcher() {
  const user = getAuthUser();
  const [isVetMode, setIsVetMode] = useState(false);

  // Só aparece para quem é ADMIN_CLINICO (o "Dono que atende")
  if (user?.role !== "ADMIN_CLINICO") return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const storedMode = localStorage.getItem("vestris_view_mode");
    if (storedMode === "VETERINARIO") setIsVetMode(true);
  }, []);

  const toggleMode = (checked: boolean) => {
    setIsVetMode(checked);
    const novoModo = checked ? "VETERINARIO" : "ADMIN";
    localStorage.setItem("vestris_view_mode", novoModo);

    toast.info(`Modo alternado: ${checked ? "Veterinário" : "Gestor"}`, {
      description: checked
        ? "Você pode atender e prescrever."
        : "Acesso a logs e configurações. Prontuários bloqueados.",
    });

    // Recarrega para aplicar as regras de menu e bloqueio no Cockpit
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100 mx-4 mb-4">
      <div className="flex items-center gap-2 w-full justify-center">
        <ShieldCheck
          className={`h-4 w-4 ${!isVetMode ? "text-indigo-700" : "text-slate-400"}`}
        />
        <Switch
          checked={isVetMode}
          onCheckedChange={toggleMode}
          className="data-[state=checked]:bg-emerald-600"
        />
        <Stethoscope
          className={`h-4 w-4 ${isVetMode ? "text-emerald-600" : "text-slate-400"}`}
        />
      </div>
      <Label className="text-[10px] font-bold text-slate-600 cursor-pointer min-w-[60px]">
        {isVetMode ? "Modo Clínico" : "Modo Gestor"}
      </Label>
    </div>
  );
}
