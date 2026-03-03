import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PawPrint,
  Activity,
  Pill,
  Syringe,
  PlusCircle,
  Database,
  ArrowRight,
  Thermometer,
  ShieldAlert, // Ícone para Vacinas
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdminCard = ({ title, desc, icon: Icon, colorClass, action }: any) => (
  <Card
    className="hover:shadow-lg transition-all border-l-4 group"
    style={{ borderLeftColor: colorClass }}
  >
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div
          className={`p-3 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors`}
        >
          <Icon className="h-6 w-6" style={{ color: colorClass }} />
        </div>
        <Button size="icon" variant="ghost" onClick={action}>
          <PlusCircle className="h-5 w-5 text-slate-400 hover:text-primary" />
        </Button>
      </div>
      <CardTitle className="text-lg mt-4">{title}</CardTitle>
      <CardDescription className="text-xs">{desc}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button
        variant="outline"
        className="w-full justify-between text-xs"
        onClick={action}
      >
        Cadastrar Novo <ArrowRight className="h-3 w-3" />
      </Button>
    </CardContent>
  </Card>
);

export function AdminConteudo() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <Database className="h-8 w-8 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Central de Cadastros
          </h1>
          <p className="text-slate-500">
            Gerencie a base de conhecimento oficial do Vestris.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard
          title="Espécies"
          desc="Aves, Répteis e Mamíferos. Parâmetros e manejo."
          icon={PawPrint}
          colorClass="#10b981"
          action={() => navigate("/admin/especies/novo")}
        />

        <AdminCard
          title="Doenças"
          desc="Patologias comuns e sintomas."
          icon={Activity}
          colorClass="#ef4444"
          action={() => navigate("/admin/doencas/novo")}
        />

        <AdminCard
          title="Medicamentos"
          desc="Farmacologia e concentrações."
          icon={Pill}
          colorClass="#3b82f6"
          action={() => navigate("/admin/medicamentos/novo")}
        />

        {/* NOVO CARD VACINAS */}
        <AdminCard
          title="Vacinas Oficiais"
          desc="Imunobiológicos para cadastro em prontuário."
          icon={Syringe}
          colorClass="#f59e0b" // Amber
          action={() => navigate("/admin/vacinas/novo")}
        />

        <AdminCard
          title="Protocolos Oficiais"
          desc="Tratamentos padrão ouro."
          icon={Thermometer}
          colorClass="#8b5cf6"
          action={() => navigate("/admin/protocolos/novo")}
        />

        <AdminCard
          title="Segurança Clínica"
          desc="Cadastrar contraindicações (Princípio x Espécie)."
          icon={ShieldAlert}
          colorClass="#dc2626" // Red 600
          action={() => navigate("/admin/seguranca/novo")}
        />
      </div>
    </div>
  );
}
