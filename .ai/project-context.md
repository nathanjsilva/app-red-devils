# Contexto Geral do Projeto — Red Devils

## O que é

Sistema de gerenciamento de estatísticas para peladas (partidas informais) de futebol. Jogadores, peladas (jogos), estatísticas por partida (gols, assistências, gols sofridos, resultado), organização de times e rankings.

## Stack

- **Frontend (este repositório)**: Vue 3 (Composition API, `<script setup>`), TypeScript, Pinia (state), Vue Router 4, Bootstrap 5 + Bootstrap Icons, Chart.js/vue-chartjs, Axios, vue-toastification, Vite, Vitest + Vue Test Utils.
- **Backend (repositório externo, não presente aqui)**: Laravel + Sanctum (autenticação por token). Consumido via REST em `API_BASE_URL`.
- Sem SSR — SPA pura com `createWebHistory`.

## Autenticação

- Token-based (Laravel Sanctum). Token e usuário são persistidos em `localStorage` (`STORAGE_KEYS.TOKEN`, `STORAGE_KEYS.USER`).
- Perfis de usuário: `admin` e `common` (campo `profile` em `User`). Rotas `/admin/*` exigem `requiresAuth` + `requiresAdmin` (ver `src/router/index.js`).
- Interceptor Axios (`src/services/api.ts`) injeta o header `Authorization` e trata globalmente 401/403/422/500 com toasts.

## Modelos de dados principais (`src/types/index.ts`)

- **User**: `id, name, username, profile ('admin'|'common')`.
- **Player**: `id, name, nickname, position ('linha'|'goleiro')`.
- **Pelada**: `id, date, division ('quinta'|'sabado'), location, qtd_times, qtd_jogadores_por_time, qtd_goleiros`. É a entidade "jogo/evento". `division` é **obrigatória** e deve bater com o dia da semana de `date` (quinta-feira → `quinta`, sábado → `sabado`) — o frontend não deixa o usuário escolher livremente, deriva o valor a partir da data escolhida (ver `AdminPeladasView.vue` / `.ai/frontend/contexts/peladas.md`).
- **MatchPlayer**: vínculo jogador↔pelada com estatísticas (`goals, assists, goals_conceded, is_winner, result: 'win'|'loss'|'draw'`).
- **Team**: time organizado dentro de uma pelada, com lista de `Player`.
- **Ranking / RankingPlayer**: agregações por categoria (vitórias, gols, assistências, participação em gols, goleiros) — shape normalizado no frontend, ver `.ai/frontend/contexts/rankings.md`.

## Endpoints consumidos pelo frontend (contrato com o backend Laravel)

Todas as respostas passam por `(response as any).data?.data ?? response.data` — o backend às vezes envolve o payload em `{ data: ... }`. **Exceção**: os rankings "completos" (`/statistics/rankings/*`) e as rotas novas de estatística (`dashboard`, `evolution`, `players/compare`) usam um envelope `{ data, meta }` que precisa ser lido por inteiro (ver `rankings.md`) — não aplicar o padrão de unwrap duplo nesses.

| Recurso | Método/Rota | Serviço |
|---|---|---|
| Login | `POST /login` | `authService.ts` |
| Usuário atual | `GET /admin/me` | `authService.ts` |
| Logout | `POST /admin/logout` | `authService.ts` |
| Listar jogadores | `GET /players` (`per_page=100`), `GET /players/:id` | `playerService.ts` |
| CRUD jogadores (admin) | `POST/PUT/DELETE /admin/players[/:id]` | `adminService.ts` |
| Ler peladas (**público**) | `GET /peladas`, `GET /peladas/:id`, `GET /peladas/date/:date` | `peladaService.ts` |
| CRUD peladas (admin) | `POST/PUT/DELETE /admin/peladas[/:id]` | `peladaService.ts`, `adminService.ts` |
| CRUD match-players (estatísticas) | `POST/PUT/DELETE /admin/match-players[/:id]`, `PUT /admin/peladas/:peladaId/players/:playerId/statistics` | `adminService.ts` |
| Ler times por pelada (**público**) | `GET /teams/pelada/:id/fields`, `/players`, `/organized`, `/players-with-statistics` | `teamService.ts` |
| Organizar times (admin) | `POST /admin/teams/pelada/:id/organize` | `teamService.ts` |
| Rankings completos | `GET /statistics/rankings/{wins,goals,assists,goal-participations,win-rate,appearances,goalkeepers}` (envelope `{data,meta}` enriquecido) | `rankingService.ts` |
| Visão geral da temporada | `GET /statistics/dashboard` | `statisticsService.ts` |
| Evolução (série temporal) | `GET /statistics/evolution?group_by=month` | `statisticsService.ts` |
| Comparação de jogadores (radar) | `GET /statistics/players/compare?player_ids[]=` | `statisticsService.ts` |
| Estatísticas agregadas (formato antigo) | `GET /statistics/players/overview`, `/statistics/player/:id/total`, `/statistics/pelada/:id`, `/statistics/player/:id/pelada/:peladaId` | `statisticsService.ts` |

Rotas que existem na API e **não são consumidas** pelo frontend hoje (disponíveis para uma próxima entrega): `GET /statistics/players/:id` (individual), `GET /statistics/goalkeepers[/:id]`, `GET /statistics/matches/:id`. Ver `.ai/frontend/contexts/statistics.md`.

> As rotas de **leitura** de `peladas` e `teams` viraram públicas num refactor do backend (antes eram `/admin/*`) — só escrita continua exigindo admin. Isso já causou uma quebra real no frontend (o código apontava pro caminho antigo); antes de assumir que uma rota é `/admin/*`, confirme em `routes/api.php` do repositório da API.

## Configuração relevante

- `API_BASE_URL` está hardcoded em `src/utils/constants.ts` (não usa `.env` atualmente). **Estado atual: aponta para `http://localhost/api`** (API rodando localmente via Docker, ver `docker-compose.yaml` do repositório `api-red-devils`) — trocar para a URL de produção antes de buildar/deployar para produção.
- Alias `@` aponta para `src/` (Vite + tsconfig).
- Dev server na porta 3000.
- `chart.js` + `vue-chartjs` são usados pela página `/estatisticas` (registro central em `src/utils/chartSetup.ts`, importado uma vez em `main.js`).
