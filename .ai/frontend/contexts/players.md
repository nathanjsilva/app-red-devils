# Context: Jogadores

## Objetivo

Cadastro, edição, remoção e listagem de jogadores; visão pública de estatísticas agregadas por jogador.

## Arquivos envolvidos

- `src/views/AdminPlayersView.vue` — CRUD (admin).
- `src/views/PlayersOverviewView.vue` — visão pública agregada.
- `src/services/playerService.ts` — leitura pública (`GET /players`, `GET /players/:id`).
- `src/services/adminService.ts` — CRUD admin (`POST/PUT/DELETE /admin/players[/:id]`).
- `src/services/statisticsService.ts` — `getPlayersOverview` (`GET /statistics/players/overview`).
- `src/types/index.ts` — `Player`, `CreatePlayerRequest`, `UpdatePlayerRequest`, `PlayerOverviewItem`, `PlayersOverviewResponse`.

## Modelo

`Player { id, name, nickname, position: 'linha' | 'goleiro', created_at, updated_at }`.

## Fluxo

- **Admin**: `AdminPlayersView` usa `AdminService` para criar/editar/remover. Todas as respostas seguem `data?.data ?? data`.
- **Overview público**: `PlayersOverviewView` busca `StatisticsService.getPlayersOverview()`, que retorna, além da lista de jogadores com estatísticas, `reference_year`, `total_peladas_in_year` e `minimum_matches_for_ranking` — usados para exibir regras de elegibilidade para ranking (`eligible_for_ranking` por jogador).

## Regras de negócio

- `position` só aceita `'linha'` ou `'goleiro'` — isso influencia quais estatísticas fazem sentido (goleiro tem `goals_conceded`; jogador de linha não).
- `nickname` é usado como identificador "social" nas telas de ranking/overview (mais que `name`).
- Elegibilidade para ranking depende de `minimum_matches_for_ranking` (vindo do backend) comparado a `total_matches` do jogador no ano de referência — não é uma regra fixa no frontend, é apenas exibida.

## Pontos de atenção

- Exclusão de jogador (`DELETE /admin/players/:id`) é uma ação destrutiva do ponto de vista de dados — confirmar com o usuário antes de implementar qualquer atalho que remova sem diálogo de confirmação na UI.
- `PlayerService` (leitura pública) e `AdminService` (CRUD) são serviços separados por design — não fundir num só sem necessidade, pois refletem permissões diferentes no backend (`/players` vs `/admin/players`).
- **`GET /players` é paginado pelo Laravel (padrão 15 por página, máximo 100).** `PlayerService.getAllPlayers()` já manda `per_page: 100` explicitamente — isso corrigiu um bug real em que a lista de jogadores (`AdminPlayersView`, o seletor de `AdminOrganizeTeamsView`, e a busca do comparador em `/estatisticas`) só mostrava os primeiros 15 de 35 jogadores, silenciosamente. Se o elenco crescer além de 100, esse método vai precisar paginar de verdade (loop ou UI de paginação) — não subir o número arbitrariamente sem checar o limite do backend.
