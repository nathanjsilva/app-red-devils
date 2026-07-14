# Índice de Funcionalidades

Use esta tabela para descobrir qual context ler em `.ai/frontend/contexts/` antes de mexer em uma funcionalidade.

| Funcionalidade | Views principais | Store/Services | Context |
|---|---|---|---|
| Login / sessão / permissões | `LoginView.vue` | `stores/auth.ts`, `services/authService.ts`, `composables/useAuth.ts`, `router/index.js` | `.ai/frontend/contexts/auth.md` |
| Cadastro/gestão de jogadores | `AdminPlayersView.vue`, `PlayersOverviewView.vue` | `services/playerService.ts`, `services/adminService.ts` | `.ai/frontend/contexts/players.md` |
| Gestão de peladas (jogos) | `AdminPeladasView.vue` | `services/peladaService.ts`, `services/adminService.ts` | `.ai/frontend/contexts/peladas.md` |
| Registro de estatísticas por partida | `AdminMatchPlayersView.vue` | `services/adminService.ts` (match-players) | `.ai/frontend/contexts/match-players.md` |
| Organização de times | `AdminOrganizeTeamsView.vue` | `services/teamService.ts`, `services/adminService.ts` | `.ai/frontend/contexts/teams.md` |
| Rankings e dashboard | `HomeView.vue`, `PlayersOverviewView.vue` | `services/rankingService.ts`, `services/statisticsService.ts`, `stores/rankings.ts` | `.ai/frontend/contexts/rankings.md` |
| Layout/navegação | `App.vue`, `components/SidebarComponent.vue` | `composables/useResponsive.ts` | `.ai/frontend/overview.md` |

## Como adicionar uma nova funcionalidade

1. Crie o arquivo `.ai/frontend/contexts/<nome>.md` seguindo o padrão dos existentes (objetivo, fluxo, arquivos envolvidos, regras de negócio, pontos de atenção).
2. Adicione uma linha nesta tabela.
3. Se a funcionalidade expõe endpoints novos, atualize a tabela de endpoints em `.ai/project-context.md`.
