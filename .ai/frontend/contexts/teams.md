# Context: Organização de Times

## Objetivo

Distribuir os jogadores de uma pelada em times (considerando `qtd_times`, `qtd_jogadores_por_time`, `qtd_goleiros` da pelada) e exibir os times organizados, com ou sem estatísticas.

## Arquivos envolvidos

- `src/views/AdminOrganizeTeamsView.vue` — tela admin de organização.
- `src/services/teamService.ts` — fluxo "novo" (`getTeamFields`, `getPeladaPlayers`, `organizeTeams`, `getOrganizedTeams`, `getTeamsWithStatistics`), todas sob `/admin/teams/pelada/:peladaId/...`.
- `src/services/adminService.ts` — método `organizeTeams(peladaId, playerIds)` (fluxo "legado", `POST /admin/peladas/:id/organize-teams`).
- `src/types/index.ts` — `Team`, `TeamField`, `TeamFieldsResponse`, `PeladaPlayersItem`, `PeladaPlayersResponse`, `TeamAssignmentEntry`, `OrganizePeladaTeamsRequest`, `OrganizedPeladaTeamsResponse`, `TeamsWithStatisticsResponse`.

## Fluxo (via `TeamService`, o caminho atual da view)

1. `getTeamFields(peladaId)` — retorna quantos "campos de time" existem (`team_fields`) com base na config da pelada.
2. `getPeladaPlayers(peladaId)` — lista jogadores disponíveis para aquela pelada, com flag `is_goalkeeper`.
3. `organizeTeams(peladaId, { team_assignments })` — envia a distribuição manual/escolhida: array de `{ team_number, player_ids }`.
4. `getOrganizedTeams(peladaId)` — busca a organização já salva (404 tratado como "ainda não organizado", retorna `null`).
5. `getTeamsWithStatistics(peladaId)` — como (4), mas já com estatísticas de cada jogador embutidas (usado para telas de resultado/pós-jogo).

## Regras de negócio

- Goleiros (`position: 'goleiro'` / `is_goalkeeper: true`) são tratados à parte na distribuição — `qtd_goleiros` da pelada define quantos por time.
- `team_number` é o identificador lógico do time dentro da pelada (não confundir com `Team.id`, que é o id do registro persistido).

## Pontos de atenção

- **Dois fluxos de organização de times coexistem**: `AdminService.organizeTeams` (legado, só `player_ids`, sem distribuição manual por time) e `TeamService.organizeTeams` (atual, com `team_assignments` explícito por `team_number`). Antes de alterar qualquer um, confirmar com o usuário qual está de fato em uso na `AdminOrganizeTeamsView.vue` — não presumir que o legado pode ser removido sem checar se algo ainda o referencia.
- `is_winner` em `TeamsWithStatisticsResponse` aparece tipado como `boolean | number` — o backend pode retornar `0`/`1` em vez de `true`/`false` nesse endpoint específico; ao consumir esse campo, não assumir tipo estritamente booleano.
