# Context: Rankings e Dashboard

## Objetivo

Exibir rankings por categoria (vitórias, gols, assistências, participação em gols, goleiros) no dashboard (`HomeView`) e alimentar os gráficos de ranking da página `/estatisticas` (`StatisticsView`, ver `.ai/frontend/contexts/statistics.md`).

## Arquivos envolvidos

- `src/views/HomeView.vue` — dashboard público com os 5 rankings completos.
- `src/stores/rankings.ts` — estado dos rankings para o dashboard (`fetchRankings`, `getAllRankings`).
- `src/services/rankingService.ts` — busca **e** normaliza a resposta da API pro shape `Ranking { type, players: RankingPlayer[] }` usado pela UI.
- `src/services/statisticsService.ts` — endpoints de estatística que não são "ranking" (dashboard, evolution, compare, overview) — não duplica mais lógica de ranking.
- `src/types/index.ts` — `Ranking`, `RankingPlayer`.

## Formato real da API (`{data, meta}` enriquecido)

Desde um refactor do backend, `GET /statistics/rankings/{wins,goals,assists,goal-participations,win-rate,appearances,goalkeepers}` devolvem:

```json
{
  "data": [
    { "position": 1, "player": { "id": 10, "name": "Nathan", "nickname": "nathan", "position": "linha" },
      "matches": 8, "goals": 30, "assists": 27, "goal_participations": 57, "wins": 4,
      "win_rate": 50, "average_per_match": 3.75, "value": 30 }
  ],
  "meta": { "ranking_type": "Gols", "filters": {}, "minimum_matches": 2, "current_page": 1, "per_page": 10, "total": 19, "last_page": 2 }
}
```

`value` é sempre a métrica principal daquele ranking (gols no ranking de gols, vitórias no de vitórias, média de gols sofridos no de goleiros); `average_per_match` é a taxa/média correspondente. Confirmado por chamada real à API — não assumir sem checar se o backend mudar de novo.

`RankingService.getFullRanking(type, perPage, filters?)` é o único lugar que faz esse parsing, mapeando pra `RankingPlayer`:
- `total` ← `item.value`
- `matches` ← `item.matches`
- `average` ← `item.average_per_match`
- `id/name/nickname/position` ← `item.player.*`
- `Ranking.type` ← `meta.ranking_type`

Esse método é **reaproveitado** tanto pelos 5 métodos de conveniência (`getWinsRanking`, `getGoalsRanking`, `getAssistsRanking`, `getGoalParticipationRanking`, `getGoalkeepersRanking` — usados por `stores/rankings.ts`) quanto pelo gráfico de barras da página `/estatisticas` (que passa `filters.division` e `perPage` menor, ex. top 8).

## ⚠️ Histórico: bug real causado por mudança de contrato não acompanhada

Antes desta correção, `rankingService.ts` normalizava um formato **antigo** (`{ ranking_type, ranking: [...] }`) que só o endpoint `rankings/goal-participation` (singular) ainda usa. Como o backend migrou `wins/goals/assists/goalkeepers` pro formato novo sem que o frontend acompanhasse, `normalizeRanking` recebia um array cru, devolvia ele sem `.type`/`.players`, e `stores/rankings.ts:getTotalMatches()` quebrava com `TypeError: Cannot read properties of undefined (reading 'forEach')` — a Home ficava travada pra sempre em "Carregando rankings da temporada...", sem erro visível na tela (só no console). **Lição**: ao ver a Home travando no loading, checar primeiro se o formato retornado por `/statistics/rankings/*` ainda bate com o que `RankingService` espera — teste com `curl` direto na API, não confie só nos `.ai/` do backend (podem estar descrevendo um estado planejado, não o que está de fato rodando).

A 5ª categoria (Participação em Gols) foi migrada do endpoint antigo `rankings/goal-participation` (singular) pro novo `rankings/goal-participations` (plural, mesmo formato enriquecido) — não há mais branch de formato antigo em `RankingService`.

## Regras de negócio

- Categorias hoje usadas no dashboard: `wins`, `goals`, `assists`, `goal-participations`, `goalkeepers`. Também existem (não usadas na Home, mas disponíveis) `win-rate` e `appearances` — ver `statistics.md`.
- Goleiros têm ranking próprio (`goalkeepers`, baseado em `average_per_match` = média de gols sofridos — **menor é melhor**, mas a API já devolve ordenado corretamente; não inverter a ordenação no frontend).
- `RankingService.getFullRanking` aceita um `StatisticsFilters` (`division: 'quinta'|'sabado'`, `start_date`, `end_date`, `year`, `month`) repassado direto como query params — usado pelo filtro de divisão em `/estatisticas`.
