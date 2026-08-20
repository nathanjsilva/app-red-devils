# Context: Página de Estatísticas (`/estatisticas`)

## Objetivo

Página pública com visão "site de estatísticas esportivas" da temporada: KPIs gerais, evolução mensal (gráfico de linha), rankings em gráfico de barras por categoria, e comparador de até 4 jogadores em gráfico radar.

## Arquivos envolvidos

- `src/views/StatisticsView.vue` — a página (hero com filtro de divisão, KPIs, spotlights, evolução, rankings em abas, comparador).
- `src/components/charts/EvolutionChart.vue`, `RankingBarChart.vue`, `ComparisonRadarChart.vue` — wrappers `vue-chartjs` (`Line`, `Bar` horizontal, `Radar`). Recebem dados já prontos via props — não fazem fetch. `EvolutionChart` também é reaproveitado em `PlayerDetailView.vue` (perfil individual do jogador, fora desta página) — tem uma prop opcional `showGoalsConceded` (a partir de 2026-08-20) que adiciona a série "Gols sofridos" (`EvolutionPoint.total_goals_conceded`), usada só quando o jogador é goleiro.
- `src/utils/chartSetup.ts` — `Chart.register(...)` dos componentes do Chart.js necessários (escalas, elementos, tooltip, legend). Importado **uma vez** em `main.js`; não registrar de novo dentro de cada componente de gráfico.
- `src/services/statisticsService.ts` — `getDashboard`, `getEvolution`, `comparePlayers` (além dos métodos antigos, ver `.ai/frontend/contexts/match-players.md`).
- `src/services/rankingService.ts` — `getFullRanking(type, perPage, filters)` reaproveitado aqui pro gráfico de barras (ver `.ai/frontend/contexts/rankings.md`).
- `src/services/playerService.ts` — `getAllPlayers()` alimenta a busca do comparador.
- `src/types/index.ts` — `StatisticsFilters`, `DashboardOverview`, `StatLeader`, `EvolutionPoint`, `ComparePlayerEntry`.
- `src/assets/styles/statistics.css` — estilos da página (mobile-first, reaproveita os tokens de `global.css`, sem cor nova).

## Endpoints consumidos

| Rota | Uso na página |
|---|---|
| `GET /statistics/dashboard` | KPIs (peladas, gols, assistências, participações) + destaques (artilheiro, garçom, melhor goleiro) |
| `GET /statistics/evolution?group_by=month` | Gráfico de linha: gols/assistências por mês |
| `GET /statistics/rankings/{goals,assists,wins,win-rate,goalkeepers}` | Gráfico de barras horizontal, um por aba de categoria (top 8, `per_page=8`) |
| `GET /statistics/players/compare?player_ids[]=` | Radar de comparação — o backend já devolve os valores **normalizados 0-100** em `entry.radar`, não recalcular no frontend |

Todos os quatro aceitam o filtro `division` (`quinta`/`sabado`) via `StatisticsFilters` — a página tem um segmented-control "Todas/Quinta/Sábado" que reaplica esse filtro nas 4 seções ao mesmo tempo (`watch(division, ...)` refaz todos os fetches).

## Comparador de jogadores

- Busca client-side sobre `PlayerService.getAllPlayers()` (nome/apelido), máximo 4 jogadores selecionados por vez.
- Só dispara `comparePlayers` quando há **2 ou mais** jogadores selecionados (a API exige mínimo 2, ver `ComparePlayersRequest` no backend).
- Eixos do radar (fixos, mapeados em `ComparisonRadarChart.vue`): Gols, Assistências, Participações, Aproveitamento, Média/Partida — vêm de `entry.radar.{total_goals, total_assists, total_goal_participations, win_rate, avg_goal_participations_per_match}`. Se o backend adicionar/renomear uma métrica no `radar`, atualizar o array `AXES` nesse componente.

## Rotas da API disponíveis e **não usadas** aqui (fora de escopo desta entrega)

`GET /statistics/players/:id` (estatísticas individuais completas — sequências, assiduidade, melhor dupla), `GET /statistics/goalkeepers[/:id]`, `GET /statistics/matches/:id` (pelada enriquecida com líderes/times). Ficam disponíveis para uma página de "detalhe do jogador" ou "detalhe da pelada" futura — não implementadas por decisão explícita de escopo, não por limitação técnica.

## Pontos de atenção

- Os gráficos (`components/charts/*`) são "burros" (só recebem `props` e desenham) — toda a lógica de fetch, filtro e formatação de dados fica em `StatisticsView.vue`. Não colocar chamada de API dentro de um componente de gráfico.
- A API local usada em desenvolvimento (`http://localhost/api`, ver `.ai/project-context.md`) pode ser lenta (3-8s por request, especialmente `dashboard`/`rankings`/`compare`, que fazem agregação pesada) — ao testar manualmente ou escrever testes E2E, usar timeouts generosos (15-20s) em vez de assumir resposta imediata.
- Paleta dos gráficos é hardcoded em hex (`#b91c1c` etc.) dentro de cada componente, seguindo o mesmo padrão já usado em `avatarColors` de `PlayersOverviewView.vue` — não trocar por leitura de CSS custom properties em runtime sem necessidade real.
