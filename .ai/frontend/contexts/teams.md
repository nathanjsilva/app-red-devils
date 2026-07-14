# Context: Organização de Times

## Objetivo

Distribuir os jogadores de uma pelada em times (considerando `qtd_times`, `qtd_jogadores_por_time`, `qtd_goleiros` da pelada) e exibir os times organizados, com ou sem estatísticas.

## Arquivos envolvidos

- `src/views/AdminOrganizeTeamsView.vue` — tela admin de organização.
- `src/services/teamService.ts` — único service de times. Leituras (`getTeamFields`, `getPeladaPlayers`, `getOrganizedTeams`, `getTeamsWithStatistics`) são **públicas**, sob `/teams/pelada/:peladaId/...`. Escrita (`organizeTeams`) exige admin, sob `/admin/teams/pelada/:peladaId/organize`.
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

- O fluxo legado (`AdminService.organizeTeams`, `POST /admin/peladas/:id/organize-teams`, só `player_ids` sem distribuição manual) **foi removido** por não ter nenhuma referência em nenhuma view — `TeamService.organizeTeams` (com `team_assignments` explícito por `team_number`) é hoje o único caminho. Se precisar de organização 100% automática (sem escolher manualmente quem vai em cada time), isso teria que ser reimplementado do zero — confirmar com o usuário antes, pois é uma funcionalidade que existia e foi retirada.
- `is_winner` em `TeamsWithStatisticsResponse` aparece tipado como `boolean | number` — o backend pode retornar `0`/`1` em vez de `true`/`false` nesse endpoint específico; ao consumir esse campo, não assumir tipo estritamente booleano.
- Como as leituras viraram públicas (refactor do backend), o frontend chegou a apontar pro caminho antigo `/admin/teams/pelada/...` pra tudo — isso quebrava silenciosamente `AdminOrganizeTeamsView` (404 em toda leitura). Corrigido em `teamService.ts`. Ao adicionar uma leitura nova de times, checar `routes/api.php` do backend antes de assumir que precisa de `/admin`.
