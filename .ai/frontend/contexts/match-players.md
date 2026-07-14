# Context: Estatísticas por Partida (Match Players)

## Objetivo

Registrar o desempenho de cada jogador dentro de uma pelada específica: gols, assistências, gols sofridos (goleiros), se venceu, e o resultado (`win`/`loss`/`draw`).

## Arquivos envolvidos

- `src/views/AdminMatchPlayersView.vue` — tela admin de lançamento/edição de estatísticas.
- `src/services/adminService.ts` — `createMatchPlayer`, `updateMatchPlayer`, `deleteMatchPlayer`, `updatePlayerStatistics` (`PUT /admin/peladas/:peladaId/players/:playerId/statistics`).
- `src/services/statisticsService.ts` — leitura agregada (`getPeladaStatistics`, `getPlayerStatisticsForPelada`, `getPlayerTotalStatistics`, `hasPeladaStatistics`).
- `src/types/index.ts` — `MatchPlayer`, `CreateMatchPlayerRequest`, `UpdateMatchPlayerRequest`, `PeladaStatisticsResponse`, `PlayerPeladaStatisticsResponse`, `PlayerTotalStatisticsResponse`.

## Modelo

`MatchPlayer { player_id, pelada_id, goals, assists, goals_conceded, is_winner, result }` — vínculo N:N entre `Player` e `Pelada` com dados de desempenho.

## Fluxo

1. Selecionar uma `Pelada` já existente (ver `.ai/frontend/contexts/peladas.md`).
2. Para cada jogador participante, criar/editar um `MatchPlayer` com suas estatísticas da partida.
3. `hasPeladaStatistics(peladaId)` verifica se já existem estatísticas lançadas para aquela pelada (usado para decidir se mostra "editar" vs "lançar").
4. Estatísticas agregadas por pelada (`getPeladaStatistics`) separam `field_players` (jogadores de linha) de `goalkeepers` — goleiros têm `goals_conceded` além do resto; jogadores de linha não.

## Regras de negócio

- `result` é sempre um de `'win' | 'loss' | 'draw'`; `is_winner` é um booleano relacionado mas tratado como campo separado no payload — ao editar, manter os dois consistentes (não é derivado automaticamente no frontend).
- `goal_participation` (presente nas respostas agregadas) é calculado pelo **backend**, não pelo frontend — não reimplementar esse cálculo localmente.
- Existem dois caminhos para atualizar estatística de um jogador numa pelada: `AdminService.updateMatchPlayer(id, ...)` (por id do registro `match_player`) e `AdminService.updatePlayerStatistics(peladaId, playerId, ...)` (por par pelada+jogador). Confirmar qual a view atual usa antes de assumir substituição de um pelo outro.

## Pontos de atenção

- Esta é a funcionalidade mais sensível a erros de cálculo (afeta rankings e overview de jogadores) — qualquer mudança em como os campos são enviados/lidos deve ser tratada como regra de negócio e confirmada com o usuário antes de aplicar.
