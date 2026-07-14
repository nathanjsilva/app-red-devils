# Context: Rankings e Dashboard

## Objetivo

Exibir rankings por categoria (vitórias, gols, assistências, participação em gols, goleiros) no dashboard (`HomeView`) e na visão de jogadores (`PlayersOverviewView`).

## Arquivos envolvidos

- `src/views/HomeView.vue` — dashboard público com resumo dos rankings.
- `src/views/PlayersOverviewView.vue` — também consome estatísticas agregadas por jogador.
- `src/stores/rankings.ts` — estado dos rankings para o dashboard.
- `src/services/rankingService.ts` — **normaliza** a resposta bruta da API (`ranking_type`/`ranking`) para o shape `Ranking { type, players: RankingPlayer[] }`.
- `src/services/statisticsService.ts` — expõe os mesmos endpoints de ranking **sem** normalizar (retorna o shape cru esperado como `Ranking` via cast, sem o parsing de `rankingService`).
- `src/types/index.ts` — `Ranking`, `RankingPlayer`.

## Endpoints (compartilhados pelos dois services)

`GET /statistics/rankings/{wins,goals,assists,goal-participation,goalkeepers}`.

## Fluxo

- `RankingService.normalizeRanking` lida com um formato de resposta onde o backend manda `{ ranking_type, ranking: [{ player, total_goals|total_assists|total_wins|total_goals_conceded|total_goal_participation, total_matches, avg_* }] }`, convertendo para `{ type, players: [{ id, name, nickname, position, total, matches, average }] }`.
- `RankingService.getAllRankings()` busca as 5 categorias em paralelo (`Promise.allSettled`) e retorna só as que tiveram sucesso — falha em uma categoria não derruba as outras.

## Pontos de atenção — **duplicação crítica**

Existem **dois services fazendo a mesma coisa de formas diferentes**:

- `rankingService.ts` — assume o formato `{ ranking_type, ranking }` e normaliza.
- `statisticsService.ts` — assume que a API já devolve o shape `Ranking` pronto, sem normalização.

Isso sugere que ou (a) o backend mudou de formato em algum momento e só um dos services foi atualizado, ou (b) endpoints diferentes por trás da mesma rota nominal retornam formatos diferentes dependendo do contexto. **Antes de consolidar, remover ou "corrigir" um dos dois**: confirmar com o usuário qual view usa qual service atualmente (grep por `RankingService` vs `StatisticsService` nas views), e qual é o formato real retornado pela API hoje — não presumir qual dos dois está "certo" sem essa checagem, pois isso é uma mudança de regra de negócio/contrato de API.

## Regras de negócio

- Categorias de ranking: `wins`, `goals`, `assists`, `goal-participation`, `goalkeepers` — goleiros têm ranking próprio (baseado em `goals_conceded`, quanto menor melhor, presumivelmente — confirmar com o usuário antes de inverter qualquer ordenação).
- `win_rate` pode vir como string com `%` (ex.: `"42%"`) — `rankingService.ts` já trata isso (`.replace('%', '')`) antes de converter para número.
