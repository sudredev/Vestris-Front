// pages/public/LandingPage.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  Building2,
  Lock,
  BookOpen,
  Pill,
  Calendar,
  Paperclip,
  FileText,
  Globe,
  Leaf,
  Plus,
} from "lucide-react";
import logoImg from "@/assets/logo-ofc-vestris.png";

// DADOS DOS PLANOS (Sincronizados com a página de Planos para máximo valor)
const PLANOS = [
  {
    id: "autonomo",
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
    destaque: true,
    limit: "Até 3 veterinários",
    features: [
      "Gestão de equipe",
      "Prontuário compartilhado por clínica",
      "Biblioteca científica centralizada",
      "Protocolos institucionais e individuais",
      "Calculadora terapêutica integrada",
      "Documentos personalizados",
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
    extraInfo: "(opção de expansão)",
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
      "Zoológicos e ONGs",
      "Universidades",
    ],
    features: [
      "Veterinários ilimitados",
      "Governança de acesso por função",
      "Histórico clínico institucional",
      "Padronização de protocolos",
      "Implantação assistida",
      "Integrações sob demanda",
    ],
  },
];

// Componente auxiliar para os Cards de Diferenciais
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FeatureCard = ({ icon: Icon, title, text, colorClass }: any) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300">
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${colorClass}`}
    >
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{text}</p>
  </div>
);

// Componente auxiliar para Itens de Funcionalidade
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FunctionalityItem = ({ icon: Icon, title, desc }: any) => (
  <div className="flex gap-4 items-start p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <div className="mt-1 p-2 bg-emerald-50 rounded-lg text-emerald-700 shrink-0">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h4 className="font-bold text-slate-800 text-base mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// Componente auxiliar para Planos
const PlanCard = ({
  title,
  desc,
  price,
  limit,
  extraInfo,
  features,
  highlight,
  enterprise,
  onClick,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => (
  <div
    className={`flex flex-col p-6 rounded-xl border relative h-full ${
      highlight
        ? "border-emerald-500 shadow-lg scale-105 z-10 bg-white"
        : enterprise
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-200 bg-white shadow-sm"
    }`}
  >
    {highlight && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        Mais Popular
      </div>
    )}

    <div className="mb-4">
      <h3
        className={`text-lg font-bold ${enterprise ? "text-white" : "text-slate-900"}`}
      >
        {title}
      </h3>
      <p
        className={`text-xs mt-1 h-8 ${enterprise ? "text-slate-400" : "text-slate-500"}`}
      >
        {desc}
      </p>
    </div>

    <div className="mb-6">
      {price ? (
        <>
          <div
            className={`text-3xl font-extrabold ${enterprise ? "text-white" : "text-slate-900"}`}
          >
            <span className="text-sm font-normal align-top mr-1">R$</span>
            {price}
            <span className="text-sm font-normal text-slate-400">/mês</span>
          </div>
          {limit && (
            <p
              className={`text-xs font-bold mt-1 ${enterprise ? "text-emerald-400" : "text-emerald-600"}`}
            >
              {limit}
            </p>
          )}
          {extraInfo && (
            <p className="text-[10px] text-slate-400">{extraInfo}</p>
          )}
        </>
      ) : (
        <div className="text-3xl font-bold text-white py-2">Sob Consulta</div>
      )}
    </div>

    <ul className="space-y-3 mb-8 flex-1">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {features.map((item: any, i: number) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Check
            className={`h-4 w-4 shrink-0 mt-0.5 ${enterprise ? "text-emerald-400" : "text-emerald-600"}`}
          />
          <span className={enterprise ? "text-slate-300" : "text-slate-600"}>
            {item}
          </span>
        </li>
      ))}
    </ul>

    <Button
      className={`w-full mt-auto ${
        enterprise
          ? "bg-white text-slate-900 hover:bg-slate-100 font-bold"
          : highlight
            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            : "bg-slate-900 hover:bg-slate-800 text-white"
      }`}
      onClick={onClick}
    >
      {enterprise ? "Falar com Consultor" : "Começar Agora"}
    </Button>
  </div>
);

export function LandingPage() {
  const navigate = useNavigate();

  // Função para rolar suavemente até os planos
  const scrollToPlanos = () => {
    const element = document.getElementById("planos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <img
              src={logoImg}
              alt="Vestris"
              className="h-9 w-auto object-contain"
            />
            <span className="font-bold text-xl tracking-tight text-slate-900">
              VESTRIS
            </span>
          </div>

          {/* BOTÕES DE ACESSO */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Entrar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white font-bold"
              onClick={() => navigate("/planos")}
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </nav>

      {/* --- 3️⃣ HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-50/50 to-transparent -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            {/* Selo */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Desenvolvido especificamente para Silvestres e Exóticos
            </div>

            {/* Título Principal */}
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900 tracking-tight">
              Inteligência Clínica para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Veterinários de Animais Silvestres.
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Chega de adaptar sistemas feitos para cães e gatos. <br />O
              Vestris é uma plataforma clínica completa, criada para aves,
              répteis, pequenos mamíferos e fauna silvestre, com foco em
              segurança farmacológica, padronização clínica e respaldo técnico.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200 transition-all"
                onClick={scrollToPlanos}
              >
                Começar agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => navigate("/login")}
              >
                Já sou cliente
              </Button>
            </div>

            {/* Prova de Risco Zero */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" /> Teste gratuito
                por 14 dias
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" /> Sem cartão de
                crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" /> Cancelamento a
                qualquer momento
              </span>
            </div>
          </div>

          {/* MOCKUP VISUAL */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* Background Blob */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>

            {/* Interface Mock */}
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 md:p-6 rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
              {/* Header Mock */}
              <div className="h-8 bg-slate-50 rounded-md mb-4 w-full flex items-center px-3 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* Body Mock - Simulação de Prontuário */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                    <Leaf className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-50 rounded"></div>
                    <div className="flex gap-2 mt-2">
                      <div className="h-6 w-20 bg-blue-50 rounded text-xs text-blue-600 flex items-center justify-center font-bold">
                        Silvestre
                      </div>
                      <div className="h-6 w-20 bg-orange-50 rounded text-xs text-orange-600 flex items-center justify-center font-bold">
                        Répteis
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full my-2"></div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-100 p-3">
                    <div className="w-8 h-8 bg-white rounded-full shadow-sm mb-2"></div>
                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-100 p-3">
                    <div className="w-8 h-8 bg-white rounded-full shadow-sm mb-2"></div>
                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Legendas Flutuantes */}
              <div className="absolute -right-6 top-20 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce duration-[3000ms]">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-700">
                  <Pill className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  Calculadora Farmacológica
                </span>
              </div>

              <div className="absolute -left-6 bottom-32 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce duration-[4000ms]">
                <div className="bg-blue-100 p-1.5 rounded text-blue-700">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  Prontuário Clínico
                </span>
              </div>

              <div className="absolute -right-2 bottom-10 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce duration-[3500ms]">
                <div className="bg-purple-100 p-1.5 rounded text-purple-700">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  Protocolos por Espécie
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4️⃣ A DOR QUE NINGUÉM FALA --- */}
      <section className="py-24 bg-slate-900 text-white text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tratar um papagaio não é o mesmo que tratar um cachorro.
          </h2>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
            A maioria dos sistemas veterinários ignora completamente as
            particularidades clínicas de espécies silvestres. Isso gera erros de
            dose, insegurança jurídica, perda de tempo e protocolos
            improvisados.
          </p>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full mt-8"></div>
          <p className="text-xl font-bold text-emerald-400 pt-4">
            O Vestris nasce exatamente para resolver isso.
          </p>
        </div>
      </section>

      {/* --- 5️⃣ POR QUE O VESTRIS É DIFERENTE --- */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Por que o Vestris é diferente?
            </h2>
            <p className="text-lg text-slate-600">
              Desenvolvido com base em medicina baseada em evidência, prática
              clínica real e responsabilidade técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Stethoscope}
              title="Protocolos Clínicos Específicos"
              text="Protocolos organizados por espécie, patologia e conduta terapêutica. Use os protocolos oficiais do sistema ou crie protocolos próprios, padronizando o atendimento da sua clínica ou instituição."
              colorClass="bg-purple-100 text-purple-600"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Segurança Farmacológica Real"
              text="Alertas automáticos de contraindicação por espécie, controle de dose mínima e máxima e histórico clínico integrado. Mais segurança para o paciente. Mais respaldo para o veterinário."
              colorClass="bg-red-100 text-red-600"
            />
            <FeatureCard
              icon={Zap}
              title="Produtividade sem perder critério"
              text="Prontuários inteligentes, histórico reutilizável, geração de PDFs profissionais e calculadora integrada — tudo no fluxo real do atendimento."
              colorClass="bg-blue-100 text-blue-600"
            />
          </div>
        </div>
      </section>

      {/* --- 6️⃣ O QUE EXATAMENTE O SISTEMA FAZ --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Uma plataforma clínica completa, <br />
              <span className="text-slate-500">
                do atendimento ao documento final.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FunctionalityItem
              icon={BookOpen}
              title="Biblioteca Clínica por Espécie"
              desc="Manejo, parâmetros fisiológicos, exame físico padrão, patologias comuns e conservação."
            />
            <FunctionalityItem
              icon={Pill}
              title="Medicamentos e Protocolos"
              desc="Dados farmacológicos, perfil de segurança, cálculo de dose e contraindicações por espécie."
            />
            <FunctionalityItem
              icon={FileText}
              title="Prontuário Veterinário Completo"
              desc="Anamnese, exame físico, diagnóstico, conduta terapêutica e acompanhamento."
            />
            <FunctionalityItem
              icon={Calendar}
              title="Agenda e Gestão"
              desc="Controle de atendimentos, retornos e organização da rotina clínica."
            />
            <FunctionalityItem
              icon={Paperclip}
              title="Anexo de Exames"
              desc="Upload e visualização de laudos laboratoriais e de imagem no prontuário."
            />
            <FunctionalityItem
              icon={ArrowRight}
              title="Geração de PDFs Profissionais"
              desc="Receita, manejo da espécie e prontuário completo — com dados da clínica, CRMV e assinatura."
            />
          </div>
        </div>
      </section>

      {/* --- 7️⃣ SEÇÃO INSTITUCIONAL --- */}
      <section className="py-24 px-6 bg-slate-900 text-slate-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 mb-4">
              <Building2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Preparado para Clínicas, Instituições, ONGs e Ensino.
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              O Vestris foi projetado para ambientes onde continuidade clínica,
              padronização e histórico institucional são fundamentais.
            </p>
            <p className="text-sm text-slate-500">
              Com controle claro de permissões, histórico institucional e
              separação entre dados clínicos e administrativos.
            </p>
          </div>

          <div className="flex-1 w-full bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" /> Ideal para:
            </h4>
            <ul className="space-y-4">
              {[
                "Clínicas especializadas",
                "Hospitais veterinários",
                "ONGs e centros de reabilitação",
                "Zoológicos",
                "Faculdades e hospitais-escola",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- 8️⃣ SEGURANÇA E RESPONSABILIDADE --- */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6">
            <Lock className="h-6 w-6 text-slate-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Segurança, privacidade e responsabilidade técnica.
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 mb-8">
            <span className="bg-white px-4 py-2 rounded-full border shadow-sm">
              Conformidade com LGPD
            </span>
            <span className="bg-white px-4 py-2 rounded-full border shadow-sm">
              Dados criptografados
            </span>
            <span className="bg-white px-4 py-2 rounded-full border shadow-sm">
              Controle de acesso por perfil
            </span>
            <span className="bg-white px-4 py-2 rounded-full border shadow-sm">
              Histórico clínico auditável
            </span>
            <span className="bg-white px-4 py-2 rounded-full border shadow-sm">
              Documentos com identificação profissional
            </span>
          </div>
          <p className="text-slate-500 italic font-medium">
            "O Vestris não substitui o médico veterinário — ele protege o
            exercício profissional."
          </p>
        </div>
      </section>

      {/* --- 9️⃣ PLANOS (Igual à Página de Planos) --- */}
      <section className="py-24 px-6 bg-white" id="planos">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              Planos e Preços
            </h2>
            <p className="text-slate-500 mt-2">
              Escolha a melhor opção para sua realidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {PLANOS.map((plano) => (
              <PlanCard
                key={plano.id}
                title={plano.nome}
                desc={plano.desc}
                price={plano.preco}
                limit={plano.limit}
                extraInfo={plano.extraInfo}
                features={plano.features}
                highlight={plano.destaque}
                enterprise={plano.enterprise}
                btnText={
                  plano.enterprise ? "Fale com um consultor" : "Começar agora"
                }
                onClick={() => {
                  if (plano.enterprise) {
                    window.location.href = "mailto:contato@vestris.com";
                  } else {
                    navigate(`/cadastro?plano=${plano.id}`);
                  }
                }}
              />
            ))}
          </div>

          {/* --- BOTÃO DE VER DETALHES --- */}
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-slate-300 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all gap-2"
              onClick={() => navigate("/planos")}
            >
              <Plus className="h-4 w-4" /> Ver comparação detalhada dos planos
            </Button>
          </div>
        </div>
      </section>

      {/* --- 🔟 CTA FINAL --- */}
      <section className="py-24 px-6 bg-emerald-900 text-center relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Pronto para elevar o nível do seu atendimento clínico?
          </h2>
          <p className="text-xl text-emerald-100 font-medium">
            O Vestris foi criado para quem leva a medicina veterinária de
            silvestres a sério.
          </p>
          <div className="pt-4">
            <Button
              size="lg"
              className="h-16 px-10 text-xl font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-2xl hover:scale-105 transition-transform"
              onClick={() => navigate("/cadastro?plano=autonomo")}
            >
              Comece seu teste gratuito agora
            </Button>
            <p className="text-emerald-400 text-sm mt-4">
              Sem compromisso. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logoImg}
                alt="Vestris"
                className="h-6 w-auto opacity-50 grayscale"
              />
              <span className="font-bold text-lg text-slate-400">VESTRIS</span>
            </div>
            <p className="max-w-xs">
              Tecnologia veterinária feita com responsabilidade e ciência.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-300 mb-4">Produto</h4>
            <ul className="space-y-2">
              <li>
                <a
                  onClick={() => navigate("/planos")}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Planos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Funcionalidades
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-300 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Privacidade
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 text-xs text-center flex flex-col md:flex-row justify-between items-center">
          <p>
            © {new Date().getFullYear()} Vestris Tecnologia Veterinária. Todos
            os direitos reservados.
          </p>
          <p className="mt-2 md:mt-0">
            Feito por quem se importa, para quem se importa.
          </p>
        </div>
      </footer>
    </div>
  );
}
