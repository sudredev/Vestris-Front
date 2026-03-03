// pages/public/Planos.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Check,
  Building2,
  ShieldCheck,
  HeartHandshake,
  Zap,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo-ofc-vestris.png";

// Dados baseados no texto fornecido
const PLANOS = [
  {
    id: "autonomo", // IDs do banco de dados (ajuste se necessário)
    nome: "Veterinário Autônomo",
    preco: "79",
    desc: "Ideal para quem atende de forma independente.",
    destaque: false,
    limit: "1 usuário (veterinário)",
    features: [
      "Prontuário eletrônico ilimitado",
      "Biblioteca clínica por espécie",
      "Protocolos terapêuticos oficiais e próprios",
      "Calculadora de doses",
      "Prescrição e documentos em PDF",
    ],
  },
  {
    id: "pequena",
    nome: "Clínica Pequena",
    preco: "249",
    desc: "Para equipes em crescimento.",
    destaque: true, // "Mais Popular"
    limit: "Até 3 veterinários",
    features: [
      "Gestão de equipe",
      "Prontuário compartilhado por clínica",
      "Biblioteca científica centralizada",
      "Protocolos institucionais e individuais",
      "Calculadora terapêutica integrada",
      "Documentos personalizados com identidade da clínica",
      "Tudo do plano anterior",
    ],
  },
  {
    id: "media",
    nome: "Clínica Média",
    preco: "449",
    desc: "Gestão completa para clínicas estruturadas.",
    destaque: false,
    limit: "Até 6 veterinários",
    extraInfo: "(opção de expansão por usuário adicional)",
    features: [
      "Múltiplos consultórios",
      "Controle avançado de permissões",
      "Agenda integrada por profissional",
      "Histórico clínico centralizado",
      "Suporte prioritário",
      "Tudo do plano anterior",
    ],
  },
  {
    id: "enterprise",
    nome: "Institucional / Enterprise",
    preco: null, // Sob consulta
    desc: "Para grandes operações e ambientes institucionais.",
    enterprise: true,
    destaque: false,
    publicoAlvo: [
      "Hospitais veterinários",
      "ONGs e centros de reabilitação",
      "Zoológicos",
      "Universidades e faculdades",
      "Centros de conservação e pesquisa",
    ],
    features: [
      "Veterinários e equipes multidisciplinares",
      "Governança de acesso por função",
      "Histórico clínico institucional",
      "Padronização de protocolos e condutas",
      "Base científica centralizada",
      "Implantação assistida",
      "Treinamento dedicado",
      "Integrações e customizações sob demanda",
    ],
  },
];

export function Planos() {
  const navigate = useNavigate();

  const handleEnterpriseContact = () => {
    window.location.href =
      "mailto:contato@vestris.com.br?subject=Interesse Institucional Vestris";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- HEADER --- */}
      <div className="bg-white border-b py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logoImg}
            alt="Vestris"
            className="h-9 w-auto object-contain"
          />
          <span className="font-bold text-2xl tracking-tight text-slate-900">
            VESTRIS
          </span>
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Retornar à Pagina Inicial
          </Button>
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Já tenho conta
          </Button>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="py-20 px-6 text-center bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Escolha o plano ideal para sua <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              clínica ou instituição
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Potencialize o atendimento a animais silvestres com uma plataforma
            clínica completa, segura e baseada em evidência científica.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500 mt-4">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Transparência total
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Sem fidelidade
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Sem amarras
            </span>
          </div>

          <p className="text-sm text-slate-500 max-w-2xl mx-auto pt-6 border-t border-slate-100 mt-8">
            O Vestris foi desenvolvido para apoiar veterinários e equipes no
            atendimento clínico de animais silvestres, exóticos e não
            convencionais — unindo prontuário, biblioteca científica,
            protocolos, cálculo terapêutico e gestão clínica em um único
            sistema.
          </p>
        </div>
      </section>

      {/* --- GRID DE PLANOS --- */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {PLANOS.map((plano) => (
            <Card
              key={plano.id}
              className={`flex flex-col h-full hover:shadow-xl transition-all relative duration-300
                ${plano.destaque ? "border-emerald-500 shadow-lg scale-105 z-10 border-2" : "border-slate-200"}
                ${plano.enterprise ? "bg-slate-900 text-white border-slate-900" : "bg-white"}
              `}
            >
              {plano.destaque && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-sm">
                  Mais Popular
                </div>
              )}

              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle
                  className={`text-xl font-bold ${plano.enterprise ? "text-white" : "text-slate-800"}`}
                >
                  {plano.nome}
                </CardTitle>
                <CardDescription
                  className={
                    plano.enterprise ? "text-slate-400" : "text-slate-500"
                  }
                >
                  {plano.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col items-center">
                <div className="my-6 text-center">
                  {plano.preco ? (
                    <>
                      <div
                        className={`text-4xl font-extrabold ${plano.enterprise ? "text-white" : "text-slate-900"}`}
                      >
                        <span className="text-lg font-normal align-top mr-1">
                          R$
                        </span>
                        {plano.preco}
                        <span className="text-lg font-normal text-slate-400">
                          /mês
                        </span>
                      </div>
                      {plano.limit && (
                        <p
                          className={`text-sm font-medium mt-2 ${plano.enterprise ? "text-emerald-400" : "text-emerald-600"}`}
                        >
                          {plano.limit}
                        </p>
                      )}
                      {plano.extraInfo && (
                        <p className="text-xs text-slate-400 mt-1">
                          {plano.extraInfo}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-white py-2">
                      Sob Consulta
                    </div>
                  )}
                </div>

                {/* Lista de Features */}
                <div className="w-full text-left space-y-4">
                  {/* Se for Enterprise, mostramos Público Alvo primeiro */}
                  {plano.enterprise && plano.publicoAlvo && (
                    <div className="space-y-2 mb-6 border-b border-slate-700 pb-4">
                      {plano.publicoAlvo.map((target, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-sm text-slate-300"
                        >
                          <Building2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          {target}
                        </div>
                      ))}
                    </div>
                  )}

                  {plano.enterprise && (
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Recursos Institucionais:
                    </p>
                  )}

                  <ul className="space-y-3">
                    {plano.features.map((f, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-3 text-sm ${plano.enterprise ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <Check
                          className={`h-4 w-4 shrink-0 ${plano.enterprise ? "text-emerald-400" : "text-emerald-600"}`}
                        />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-6 mt-auto">
                {plano.enterprise ? (
                  <Button
                    className="w-full h-12 text-base bg-white text-slate-900 hover:bg-slate-100 font-bold"
                    onClick={handleEnterpriseContact}
                  >
                    Fale com um consultor
                  </Button>
                ) : (
                  <Button
                    className={`w-full h-12 text-base font-bold ${
                      plano.destaque
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-md"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                    onClick={() => navigate(`/cadastro?plano=${plano.id}`)} // Passando ID simulado ou real
                  >
                    Começar agora
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* --- SEÇÃO INSTITUCIONAL --- */}
      <section className="bg-slate-900 text-slate-200 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-400 text-xs font-bold border border-emerald-800">
                <Building2 className="h-3 w-3" /> SOLUÇÕES CORPORATIVAS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Atende também instituições?
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                <strong className="text-white">Sim.</strong> O Vestris é
                utilizado por instituições que precisam padronizar condutas
                clínicas, manter histórico institucional confiável e garantir
                segurança científica no atendimento a animais silvestres.
              </p>
              <p className="text-slate-400">
                Para hospitais, ONGs, zoológicos, universidades e centros de
                conservação, oferecemos licenças institucionais personalizadas,
                adaptadas à realidade operacional, regulatória e acadêmica de
                cada organização.
              </p>
            </div>

            <div className="flex-1 bg-slate-800 p-8 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6">
                Planos definidos em conjunto, considerando:
              </h3>
              <ul className="space-y-4">
                {[
                  "Número de profissionais e alunos",
                  "Tipo de atendimento (Internação, Ambulatório, Campo)",
                  "Volume de pacientes",
                  "Necessidades de governança e histórico",
                  "Exigências legais e acadêmicas",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full mt-8 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
                onClick={handleEnterpriseContact}
              >
                Solicitar Proposta Institucional
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRANSPARÊNCIA --- */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Transparência e liberdade
            </h2>
            <p className="text-slate-500 text-lg">
              Você pode evoluir ou ajustar seu plano conforme sua operação
              cresce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <HeartHandshake className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="font-bold text-slate-800">Sem fidelidade</h3>
              <p className="text-sm text-slate-500 mt-2">
                Cancele quando quiser, sem multas.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <ShieldCheck className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="font-bold text-slate-800">Sem contratos longos</h3>
              <p className="text-sm text-slate-500 mt-2">
                Assinatura mensal ou anual flexível.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <HelpCircle className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="font-bold text-slate-800">Sem taxas ocultas</h3>
              <p className="text-sm text-slate-500 mt-2">
                O valor do plano é o que você paga.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- POR QUE VESTRIS --- */}
      <section className="py-20 px-6 bg-emerald-50 border-t border-emerald-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Por que o Vestris?
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
              Porque o atendimento a animais silvestres exige mais do que um
              prontuário comum.
            </p>
            <p className="text-slate-600">
              O Vestris foi criado para apoiar a decisão clínica, centralizar
              conhecimento científico, reduzir risco terapêutico e
              profissionalizar o atendimento.
            </p>
            <p className="mt-4 text-emerald-800 font-bold italic">
              Tudo isso sem engessar o veterinário ou limitar sua autonomia
              clínica.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {[
              "Apoiar a decisão clínica",
              "Centralizar conhecimento científico",
              "Reduzir risco terapêutico",
              "Organizar histórico clínico real",
              "Profissionalizar o atendimento",
            ].map((reason, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg shadow-sm border border-emerald-100 flex items-center gap-3"
              >
                <Zap className="h-5 w-5 text-emerald-500 fill-emerald-100" />
                <span className="text-sm font-semibold text-slate-700">
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER SIMPLES --- */}
      <footer className="bg-white py-12 px-6 border-t border-slate-200 text-center">
        <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
          <img src={logoImg} alt="Vestris" className="h-6 w-auto" />
          <span className="font-bold text-lg text-slate-900">VESTRIS</span>
        </div>
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} Vestris Tecnologia Veterinária. Todos os
          direitos reservados.
        </p>
      </footer>
    </div>
  );
}
