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
- **Pelada**: `id, date, location, qtd_times, qtd_jogadores_por_time, qtd_goleiros`. É a entidade "jogo/evento".
- **MatchPlayer**: vínculo jogador↔pelada com estatísticas (`goals, assists, goals_conceded, is_winner, result: 'win'|'loss'|'draw'`).
- **Team**: time organizado dentro de uma pelada, com lista de `Player`.
- **Ranking / RankingPlayer**: agregações por categoria (vitórias, gols, assistências, participação em gols, goleiros).

## Endpoints consumidos pelo frontend (contrato com o backend Laravel)

Todas as respostas passam por `(response as any).data?.data ?? response.data` — o backend às vezes envolve o payload em `{ data: ... }`.

| Recurso | Método/Rota | Serviço |
|---|---|---|
| Login | `POST /login` | `authService.ts` |
| Usuário atual | `GET /admin/me` | `authService.ts` |
| Logout | `POST /admin/logout` | `authService.ts` |
| Listar jogadores | `GET /players`, `GET /players/:id` | `playerService.ts` |
| CRUD jogadores (admin) | `POST/PUT/DELETE /admin/players[/:id]` | `adminService.ts` |
| CRUD peladas | `POST/GET/PUT/DELETE /admin/peladas[/:id]`, `GET /admin/peladas/date/:date` | `peladaService.ts`, `adminService.ts` |
| CRUD match-players (estatísticas) | `POST/PUT/DELETE /admin/match-players[/:id]`, `PUT /admin/peladas/:peladaId/players/:playerId/statistics` | `adminService.ts` |
| Organizar times (legado) | `POST /admin/peladas/:id/organize-teams` | `adminService.ts` |
| Times por pelada | `GET /admin/teams/pelada/:id/fields`, `/players`, `/organized`, `/players-with-statistics`, `POST /admin/teams/pelada/:id/organize` | `teamService.ts` |
| Rankings | `GET /statistics/rankings/{wins,goals,assists,goal-participation,goalkeepers}` | `rankingService.ts`, `statisticsService.ts` |
| Estatísticas agregadas | `GET /statistics/players/overview`, `/statistics/player/:id/total`, `/statistics/pelada/:id`, `/statistics/player/:id/pelada/:peladaId` | `statisticsService.ts` |

> Existem dois serviços com sobreposição (`rankingService.ts` normaliza um formato de API diferente de `statisticsService.ts`). Ver `.ai/frontend/contexts/rankings.md` antes de mexer em qualquer um dos dois.

## Configuração relevante

- `API_BASE_URL` está hardcoded em `src/utils/constants.ts` (não usa `.env` atualmente).
- Alias `@` aponta para `src/` (Vite + tsconfig).
- Dev server na porta 3000.
