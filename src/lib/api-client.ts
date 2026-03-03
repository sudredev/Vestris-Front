import {
  Configuration,
  AutenticacaoApi,
  EspeciesApi,
  DoencasApi,
  ProtocolosApi,
  CalculadoraApi,
  PacientesApi,
  AtendimentosApi,
  SugestoesApi,
  GestaoUsuariosApi,
  ExamesFisicosApi,
  VacinasApi,
  VacinacaoPacienteApi,
  SegurancaClinicaApi,
  MedicamentosApi,
  ClinicaApi,
  PublicoApi,
  AdminGlobalApi,
  PlanosApi, // <--- Novo (se precisar listar planos)
  AssinaturasApi, // <--- IMPORTANTE
  ContraindicacoesApi,
  PrincipiosAtivosApi,
  ExamesApi,
  AuditoriaApi,
  ProtocolosVacinaisApi,
} from "../api";

// Use Vite environment variable for the API base URL so we don't hardcode it here.
// In development define VITE_API_URL in `.env`. In production use `.env.production`.
function getViteApiUrl(): string | undefined {
  // import.meta.env has no stable TS type here (depends on Vite), so cast safely.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
    undefined
  );
}

const apiConfig = new Configuration({
  basePath: getViteApiUrl() ?? "http://localhost:8080/api/v1",
  accessToken: () => localStorage.getItem("vestris_token") || "",
});

export const authService = new AutenticacaoApi(apiConfig);
export const speciesService = new EspeciesApi(apiConfig);
export const diseasesService = new DoencasApi(apiConfig);
export const protocolsService = new ProtocolosApi(apiConfig);
export const calcService = new CalculadoraApi(apiConfig);
export const patientsService = new PacientesApi(apiConfig);
export const recordsService = new AtendimentosApi(apiConfig);
export const feedbackService = new SugestoesApi(apiConfig);
export const usersService = new GestaoUsuariosApi(apiConfig);
export const examination = new ExamesFisicosApi(apiConfig);
export const vacinasService = new VacinasApi(apiConfig);
export const patientVaccinationService = new VacinacaoPacienteApi(apiConfig);
export const segurancaService = new SegurancaClinicaApi(apiConfig);
export const medicamentosService = new MedicamentosApi(apiConfig);
export const clinicaService = new ClinicaApi(apiConfig);
export const publicService = new PublicoApi(apiConfig);
export const adminService = new AdminGlobalApi(apiConfig);

// NOVOS EXPORTS SAAS
export const planosService = new PlanosApi(apiConfig);
export const assinaturaService = new AssinaturasApi(apiConfig);
export const contraindicacoesService = new ContraindicacoesApi(apiConfig);
export const principiosService = new PrincipiosAtivosApi(apiConfig);
export const examesService = new ExamesApi(apiConfig);
export const auditoriaService = new AuditoriaApi(apiConfig);
export const vaccinationProtocolsService = new ProtocolosVacinaisApi(apiConfig);
