# Context: Organização de Times

## Objetivo

Distribuir os jogadores de linha de uma pelada em times (considerando `qtd_times` e `qtd_jogadores_por_time`, que a partir de 2026-08-19 significa explicitamente **jogadores de linha** por time) e, separadamente, os goleiros (`qtd_goleiros`) — e exibir os times organizados, com ou sem estatísticas.

## Arquivos envolvidos

- `src/views/AdminOrganizeTeamsView.vue` — tela admin de organização (times manual/automática + card "Goleiros").
- `src/views/AdminMatchPlayersView.vue` — edição de estatísticas por jogador/pelada; inclui goleiros mesmo quando não pertencem a um time (goleiros em `goal_positions`).
- `src/services/teamService.ts` — único service de times. Leituras (`getTeamFields`, `getPeladaPlayers`, `getOrganizedTeams`, `getTeamsWithStatistics`) são **públicas**, sob `/teams/pelada/:peladaId/...`. Escrita (`organizeTeams`, `organizeTeamsAutomatically`) exige admin, sob `/admin/teams/pelada/:peladaId/organize` e `/admin/peladas/:peladaId/organize-teams`.
- `src/types/index.ts` — `Team`, `TeamField`, `TeamFieldsResponse`, `PeladaPlayersItem`, `PeladaPlayersResponse`, `TeamAssignmentEntry`, `GoalkeeperAssignmentEntry`, `GoalPositionEntry`, `OrganizePeladaTeamsRequest`, `OrganizedPeladaTeamsResponse`, `TeamsWithStatisticsResponse`.

## Fluxo (via `TeamService`, o caminho atual da view)

1. `getTeamFields(peladaId)` — retorna quantos "campos de time" existem (`team_fields`) com base na config da pelada.
2. `getPeladaPlayers(peladaId)` — lista jogadores disponíveis para aquela pelada, com flag `is_goalkeeper`.
3. `organizeTeams(peladaId, { team_assignments, goalkeeper_assignments })` — organização manual: `team_assignments` são só jogadores de linha (`{ team_number, player_ids }`); `goalkeeper_assignments` é `{ position, player_id }[]`, separado.
4. `organizeTeamsAutomatically(peladaId, { player_ids })` — organização automática: continua recebendo uma lista única (linha + goleiro juntos, o backend separa por `position` do jogador).
5. `getOrganizedTeams(peladaId)` — busca a organização já salva (404 tratado como "ainda não organizado", retorna `null`).
6. `getTeamsWithStatistics(peladaId)` — como (5), mas já com estatísticas de cada jogador embutidas (usado para telas de resultado/pós-jogo); inclui `goal_positions` quando aplicável.

## Regra de goleiro independente do time (a partir de 2026-08-19)

Goleiro deixou de ser necessariamente um membro fixo de um time de linha. O modo depende de `qtd_goleiros` x `qtd_times` (mesma regra usada pelo backend, ver `.ai/backend/contexts/teams.md` do repo da API):

- **`qtd_goleiros >= qtd_times`**: 1 goleiro fixo por time. Na `AdminOrganizeTeamsView`, o card "Goleiros" mostra um select por time ("Goleiro do Time N"); o `position` enviado em `goalkeeper_assignments` é o `team_number`.
- **`qtd_goleiros < qtd_times`**: goleiro vinculado a uma posição de gol independente do time (os times de linha se revezam nela). O card "Goleiros" mostra um select por posição ("Goleiro — Gol N"); o `position` enviado é o número da posição de gol (1..qtd_goleiros). Esses goleiros voltam em `goal_positions` na leitura, não em `teams[].players`.
- Os slots de time (grid manual) mostram só `qtd_jogadores_por_time` opções de **jogadores de linha** — não é mais preciso somar +1 pra caber o goleiro.
- `AdminMatchPlayersView` precisa mesclar `teamsResponse.goal_positions` na lista de jogadores exibidos, porque esses goleiros não vêm dentro de `teams[].players` quando estão em posição de gol independente.
- `team_number` é o identificador lógico do time dentro da pelada (não confundir com `Team.id`, que é o id do registro persistido).

## Pontos de atenção

- `is_winner` em `TeamsWithStatisticsResponse` aparece tipado como `boolean | number` — o backend pode retornar `0`/`1` em vez de `true`/`false` nesse endpoint específico; ao consumir esse campo, não assumir tipo estritamente booleano.
- Como as leituras viraram públicas (refactor do backend), o frontend chegou a apontar pro caminho antigo `/admin/teams/pelada/...` pra tudo — isso quebrava silenciosamente `AdminOrganizeTeamsView` (404 em toda leitura). Corrigido em `teamService.ts`. Ao adicionar uma leitura nova de times, checar `routes/api.php` do backend antes de assumir que precisa de `/admin`.
