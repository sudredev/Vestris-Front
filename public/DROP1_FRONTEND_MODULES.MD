0. Regras Globais (Obrigatório)
   • Não criar telas fora do escopo
   • Não criar “módulo” novo (ONG, Zoo e Campanha são visões)
   • UI precisa respeitar:
   • perfil do usuário
   • clínica_id
   • modo Admin/Vet (admin clínico)

⸻

1. BLOCO — SWITCHER ADMIN CLÍNICO (MODO ADMIN / MODO VET)

Escopo

Admin clínico precisa alternar.

Regras
• Switcher fica no Header
• O modo muda permissões e UI

⸻

DOD
• Switcher visível apenas para ADMIN_CLINICO
• Admin gestor nunca vê switcher
• UI muda de acordo com modo selecionado
• Modo persistido (local storage)

⸻

Perguntas antes de começar 1. O modo vai ser salvo no backend ou só no front?
(recomendação: front)

⸻

⸻

2. BLOCO — BLOQUEIOS VISUAIS (ADMIN GESTOR)

Escopo

Admin gestor pode ver:
• listas
• logs
• estatísticas

Mas NÃO pode:
• abrir prontuário detalhado
• prescrever
• gerar PDF novo

⸻

DOD
• Ao clicar em atendimento: tela bloqueada
• Mensagem: “Acesso restrito (Governança)”
• Campos clínicos não renderizam

⸻

Perguntas antes de começar 1. Bloqueio é 100% UI ou depende do backend?
(resposta correta: os dois)

⸻

⸻

3. BLOCO — TELA DE AUDITORIA (TEMPO REAL)

Escopo

Tela para Admin gestor e admin clínico verem:
• o que está acontecendo na clínica
• histórico do que já foi feito antes

UI mínima
• tabela com:
• data/hora
• usuário
• ação
• entidade
• alvo
• filtros:
• por data
• por usuário
• por tipo de ação

⸻

DOD
• Lista carrega corretamente
• Paginação
• Filtros funcionando
• Sem “buracos” nos eventos principais (PDF, agenda, paciente)

⸻

Perguntas antes de começar 1. A tela vai atualizar via polling ou manual refresh?
(recomendação: botão refresh no Drop 1)

⸻

⸻

4. BLOCO — PROTOCOLOS (UI UNIFICADA)

Escopo

A tela do vet deve ser igual a do admin.

Regras de UI
• mostrar 3 abas:
• oficiais
• institucionais
• próprios

filtros:
• espécie
• doença

⸻

DOD
• Layout igual
• Filtros funcionando
• Vet não vê institucionais de outra clínica
• Vet não vê protocolos próprios alheios

⸻

Perguntas antes de começar 1. Como será exibida a origem? (badge)

⸻

⸻

5. BLOCO — VACINAÇÃO HUB

Escopo

Criar tela principal “Vacinação” no menu.

UI mínima
• listagem
• filtro por espécie
• filtro por doença
• tela de detalhe de vacina

⸻

DOD
• HUB acessível
• Filtros funcionando
• Registro no paciente continua existindo

⸻

Perguntas antes de começar 1. Vacinação HUB é somente leitura para vet?
(recomendação: sim no Drop 1)

⸻

⸻

6. BLOCO — PACIENTE ONG/ZOO (STATUS + SEM TUTOR)

Escopo

Adicionar campos no cadastro do paciente.

UI mínima
• checkbox “sem tutor”
• origem do caso
• instituição responsável
• status linha de vida

⸻

DOD
• Campos aparecem apenas para instituição tipo ONG/ZOO
• Para clínica normal, pode ocultar ou deixar opcional

⸻

Perguntas antes de começar 1. O tipo da instituição vem do backend? (SIM)

⸻

⸻

7. BLOCO — RELATÓRIOS SIMPLES

Escopo

Tela simples com cards:
• atendimentos no período
• por status
• soltura
• óbito

⸻

DOD
• Tela existe
• Admin gestor consegue acessar
• Não é BI avançado

⸻

Perguntas antes de começar 1. Layout: cards ou tabela? (recomendação: cards)

⸻

⸻

8. BLOCO — ANEXOS (3 UPGRADES)

Escopo

Ao anexar exame:
• selecionar tipo
• informar data do exame
• marcar relevante

UI mínima
• dropdown tipo
• datepicker
• toggle relevante

⸻

DOD
• Anexo mostra tipo/data
• Histórico destaca “relevante”

⸻

Perguntas antes de começar 1. “Relevante” é por atendimento ou por paciente?
(recomendação: por paciente)

⸻

⸻

9. BLOCO — MODO CAMPANHA (ONG)

Escopo

Criar uma visão de fluxo rápido.

UI mínima
• cadastro rápido
• campos essenciais
• gerar PDF final

Regras
• sem prontuário completo
• sem navegação pesada
• foco em velocidade

⸻

DOD
• Tela “Campanha” existe (somente ONG)
• Fluxo de registro é 1 tela
• Gera PDF
• Auditoria registra tudo

⸻

Perguntas antes de começar 1. Campanha fica no menu principal?
(recomendação: sim, mas só aparece para ONG)
