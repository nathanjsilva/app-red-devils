<template>
  <section class="page-shell championship-page">
    <header class="page-header championship-header">
      <div class="championship-heading">
        <span class="eyebrow">Campeonato</span>
        <div class="title-row">
          <h1 class="page-title">{{ details?.championship.name || 'Campeonatos' }}</h1>
          <span v-if="details" class="pill-badge" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <p v-if="details" class="page-subtitle championship-phase">
          <i class="bi bi-broadcast-pin" aria-hidden="true"></i>
          {{ phaseLabel(details.championship.phase) }}
          <span class="header-separator">•</span>
          {{ details.standings.length }} equipes acompanhadas
        </p>
      </div>
      <label v-if="championships.length" class="championship-picker">
        <span>Temporada</span>
        <select v-model="selectedId" class="form-select" @change="loadDetails">
          <option v-for="item in championships" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </label>
    </header>

    <div v-if="isLoading" class="surface-card state-card" role="status"><i class="bi bi-arrow-repeat spin" aria-hidden="true"></i><span>Carregando campeonato...</span></div>
    <div v-else-if="loadError" class="surface-card state-card state-card--error" role="alert"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i><span>{{ loadError }}</span><button type="button" class="btn btn-outline-secondary btn-sm" @click="loadDetails">Tentar novamente</button></div>
    <div v-else-if="!details" class="surface-card state-card empty-state"><i class="bi bi-trophy" aria-hidden="true"></i><h2>Nenhum campeonato cadastrado</h2><p>O painel público será preenchido depois que um administrador criar o primeiro campeonato.</p></div>

    <template v-else>
      <nav class="championship-tabs" aria-label="Seções do campeonato" role="tablist">
        <button v-for="tab in publicTabs" :key="tab.id" type="button" class="championship-tab" :class="{ active: publicTab === tab.id }" role="tab" :aria-selected="publicTab === tab.id" @click="publicTab = tab.id">
          <i :class="tab.icon" aria-hidden="true"></i><span>{{ tab.label }}</span><small>{{ tab.meta }}</small>
        </button>
      </nav>

      <section v-if="publicTab === 'overview'" class="championship-section" role="tabpanel">
        <article v-if="details.champion" class="surface-card champion-banner">
          <div class="team-crest team-crest--winner">
            <img v-if="details.champion.crest_url" :src="details.champion.crest_url" :alt="'Brasão do ' + details.champion.name">
            <span v-else>{{ initials(details.champion.name) }}</span>
          </div>
          <div class="champion-copy"><span class="eyebrow">Campeão</span><h2>{{ details.champion.name }}</h2><p>Grande Final concluída</p><small v-if="details.champion.campaign">{{ details.champion.campaign.points }} pontos <span>•</span> {{ details.champion.campaign.wins }} vitórias <span>•</span> saldo {{ details.champion.campaign.goal_difference }}</small></div>
          <i class="bi bi-trophy-fill champion-icon" aria-hidden="true"></i>
        </article>

        <section class="championship-team-grid" aria-label="Equipes participantes">
          <article v-for="team in details.championship.teams" :key="team.id" class="surface-card team-card">
            <div class="team-crest"><img v-if="team.crest_url" :src="team.crest_url" :alt="'Brasão do ' + team.name"><span v-else>{{ initials(team.name) }}</span></div>
            <div class="team-card-copy"><strong>{{ team.name }}</strong><span>{{ team.players?.length || 0 }} participantes</span></div>
          </article>
        </section>

        <article class="surface-card panel-card standings-card">
          <div class="section-toolbar"><div><span class="eyebrow">Fase atual</span><h2 class="section-title mb-0">Classificação</h2></div><span class="section-context"><i class="bi bi-arrow-down-up" aria-hidden="true"></i> Arraste para ver todas as colunas</span></div>
          <div class="table-wrap standings-table-wrap">
            <table class="data-table standings-table">
              <thead><tr><th class="sticky-col sticky-position">#</th><th class="sticky-col sticky-team">Equipe</th><th class="points-col">Pts</th><th>PJ</th><th>VIT</th><th>E</th><th>DER</th><th>GM</th><th>GC</th><th>SG</th><th>Últimas 5</th></tr></thead>
              <tbody>
                <tr v-for="row in details.standings" :key="row.team_id" :class="{ 'standings-leader': row.position === 1, 'standings-qualified': row.position <= 4 }">
                  <td class="sticky-col sticky-position position-cell"><strong>{{ row.position }}</strong></td>
                  <td class="sticky-col sticky-team team-cell"><div class="standing-team"><div class="team-crest team-crest--table"><img v-if="teamForStanding(row.team_id)?.crest_url" :src="teamForStanding(row.team_id)?.crest_url || ''" :alt="'Brasão do ' + row.name"><span v-else>{{ initials(row.name) }}</span></div><strong>{{ row.name }}</strong></div></td>
                  <td class="points-col"><strong>{{ row.points }}</strong></td><td>{{ row.played }}</td><td>{{ row.wins }}</td><td>{{ row.draws }}</td><td>{{ row.losses }}</td><td>{{ row.goals_for }}</td><td>{{ row.goals_against }}</td><td>{{ row.goal_difference > 0 ? '+' + row.goal_difference : row.goal_difference }}</td>
                  <td><div class="form-results" :aria-label="'Últimos resultados de ' + row.name"><span v-for="(result, index) in recentResults(row.team_id)" :key="row.team_id + '-' + index" class="result-dot" :class="'result-' + result" :title="resultLabel(result)">{{ resultSymbol(result) }}</span><span v-if="!recentResults(row.team_id).length" class="result-empty">—</span></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-legend"><span><i class="qualification-dot"></i> Classificado para as eliminatórias</span><span><b class="legend-win">V</b> Vitória</span><span><b class="legend-draw">E</b> Empate</span><span><b class="legend-loss">D</b> Derrota</span></div>
          <p class="table-note">Desempate: pontos, vitórias, saldo, gols marcados, confronto direto e sorteio registrado.</p>
        </article>
      </section>

      <section v-if="publicTab === 'matches'" class="championship-section" role="tabpanel">
        <div class="championship-columns">
          <article class="surface-card panel-card">
            <div class="section-toolbar"><div><span class="eyebrow">Calendário</span><h2 class="section-title mb-0">Partidas</h2></div><span class="pill-badge pill-muted">{{ details.matches.length }} jogos</span></div>
            <div v-if="!details.matches.length" class="empty-inline">Nenhum confronto gerado ainda.</div>
            <div v-for="match in details.matches" :key="match.id" class="match-row">
              <span class="match-team">{{ match.home_team.name }}</span><div class="match-score-box"><strong class="match-score" :class="{ pending: match.status !== 'finished' }">{{ score(match) }}</strong><small>{{ match.status === 'finished' ? 'Finalizado' : 'Agendado' }} • {{ phaseLabel(match.phase) }}</small></div><span class="match-team match-team--away">{{ match.away_team.name }}</span>
              <div v-if="match.odds" class="odds-inline" :title="'Modelo ' + (match.odds.parameters?.model || 'informativo')"><span>Odds informativas</span><strong>Casa {{ formatOdd(match.odds.home_odd) }} • Empate {{ formatOdd(match.odds.draw_odd) }} • Fora {{ formatOdd(match.odds.away_odd) }}</strong></div>
            </div>
          </article>
          <article class="surface-card panel-card match-summary-card">
            <div class="section-toolbar"><div><span class="eyebrow">Leitura rápida</span><h2 class="section-title mb-0">Resumo da fase</h2></div></div>
            <div class="phase-summary-list"><div><span>Jogos realizados</span><strong>{{ finishedMatchesCount }}</strong></div><div><span>Jogos agendados</span><strong>{{ details.matches.length - finishedMatchesCount }}</strong></div><div><span>Eliminatórias</span><strong>{{ knockoutMatchesCount }}</strong></div></div>
            <p class="summary-note">Os placares e as odds informativas são atualizados pela organização do campeonato.</p>
          </article>
        </div>
        <article class="surface-card panel-card bracket">
          <div class="section-toolbar"><div><span class="eyebrow">Fase eliminatória</span><h2 class="section-title mb-0">Chaveamento</h2></div><span class="text-muted small">Pênaltis decidem eliminatórias empatadas</span></div>
          <div class="bracket-grid"><div v-for="phase in ['semi_final', 'challenger_final', 'final']" :key="phase" class="bracket-stage"><h3>{{ phaseLabel(phase) }}</h3><div v-for="match in matchesByPhase(phase)" :key="match.id" class="bracket-match"><span>{{ match.home_team.name }}</span><strong>{{ score(match) }}</strong><span>{{ match.away_team.name }}</span></div><span v-if="!matchesByPhase(phase).length" class="empty-inline">Aguardando fase anterior</span></div></div>
        </article>
      </section>

      <section v-if="publicTab === 'stats'" class="championship-section" role="tabpanel">
        <article class="surface-card panel-card">
          <div class="section-toolbar"><div><span class="eyebrow">Desempenho</span><h2 class="section-title mb-0">Rankings</h2></div><select v-model="phaseFilter" class="form-select compact-select" @change="loadRankings"><option value="all">Campeonato completo</option><option value="group">Classificatória</option><option value="semi_final">Semifinais</option><option value="challenger_final">Final dos Desafiantes</option><option value="final">Grande Final</option></select></div>
          <div class="ranking-columns"><div class="ranking-block"><h3>Artilharia</h3><RankingList :rows="rankings.scorers" value-label="gols" value-key="goals" /></div><div class="ranking-block"><h3>Assistências</h3><RankingList :rows="rankings.assists" value-label="assistências" value-key="assists" /></div><div class="ranking-block"><h3>MVP</h3><RankingList :rows="rankings.mvp" value-label="prêmios" value-key="mvp" /></div><div class="ranking-block"><h3>Goleiros</h3><RankingList :rows="rankings.goalkeepers" value-label="SG sofridos" value-key="goals_conceded" :ascending="true" /></div></div>
        </article>
        <article class="surface-card panel-card">
          <div class="section-toolbar"><div><span class="eyebrow">Estatísticas</span><h2 class="section-title mb-0">Desempenho individual</h2></div><span class="text-muted small">Somente partidas válidas e finalizadas</span></div>
          <div class="table-wrap"><table class="data-table compact-table stats-table"><thead><tr><th>Jogador</th><th>J</th><th>V</th><th>G</th><th>A</th><th>PG</th><th>MVP</th><th v-if="hasGoalkeepers">GS / SG</th></tr></thead><tbody><tr v-for="row in statistics" :key="row.participant_id"><td><strong>{{ row.player.name }}</strong><small class="table-subline">{{ row.position === 'goalkeeper' ? 'Goleiro' : 'Linha' }}</small></td><td>{{ row.played }}</td><td>{{ row.wins }}</td><td>{{ row.goals }}</td><td>{{ row.assists }}</td><td>{{ row.goal_participations }}</td><td>{{ row.mvp }}</td><td v-if="hasGoalkeepers">{{ row.position === 'goalkeeper' ? row.goals_conceded + ' / ' + row.clean_sheets : '—' }}</td></tr></tbody></table></div>
          <div v-if="!statistics.length" class="empty-inline">As estatísticas aparecerão após os jogos finalizados.</div>
        </article>
      </section>

      <section v-if="publicTab === 'awards'" class="championship-section" role="tabpanel">
        <article class="surface-card panel-card awards-card">
          <div class="section-toolbar"><div><span class="eyebrow">Reconhecimento</span><h2 class="section-title mb-0">Premiações</h2></div><span class="text-muted small">Vote em uma categoria elegível</span></div>
          <div class="awards-grid">
            <article v-for="award in awards" :key="award.id" class="award-block">
              <div class="award-heading"><div><h3>{{ award.name }}</h3><p v-if="award.description">{{ award.description }}</p></div><span class="pill-badge" :class="award.type === 'vote' ? 'pill-info' : 'pill-muted'">{{ award.type === 'vote' ? 'Votação' : 'Automática' }}</span></div>
              <div v-if="award.published" class="award-results"><div v-for="result in award.results" :key="result.id" class="award-result"><span>{{ result.winner?.player?.name || 'Resultado automático' }}</span><strong>{{ result.votes }} votos • {{ result.percentage }}%</strong></div></div>
              <div v-else-if="award.type === 'vote' && award.voting_open && isAuthenticated" class="candidate-list"><button v-for="candidate in award.candidates" :key="candidate.id" type="button" class="candidate-button" @click="vote(award.id, candidate.id)">{{ candidate.player?.name }}<i class="bi bi-check2" aria-hidden="true"></i></button></div>
              <p v-else-if="award.type === 'vote' && award.voting_open" class="award-status">Faça login com uma conta vinculada a um participante para votar.</p>
              <p v-else-if="award.type === 'vote'" class="award-status">Votação encerrada. O resultado será publicado pela organização.</p>
            </article>
          </div>
          <div v-if="!awards.length" class="empty-inline">As premiações serão disponibilizadas ao longo do campeonato.</div>
        </article>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import { ChampionshipService, type ChampionshipMatch, type ChampionshipStatisticsRow } from '../services/championshipService'

type PublicTab = 'overview' | 'matches' | 'stats' | 'awards'
type FormResult = 'win' | 'draw' | 'loss'
const publicTabs: Array<{ id: PublicTab; label: string; meta: string; icon: string }> = [
  { id: 'overview', label: 'Classificação', meta: 'Tabela e equipes', icon: 'bi bi-list-ol' },
  { id: 'matches', label: 'Partidas', meta: 'Calendário e chave', icon: 'bi bi-calendar3' },
  { id: 'stats', label: 'Estatísticas', meta: 'Rankings individuais', icon: 'bi bi-bar-chart-line' },
  { id: 'awards', label: 'Premiações', meta: 'Votação e resultados', icon: 'bi bi-award' },
]

const RankingList = defineComponent({
  props: { rows: { type: Array, default: () => [] }, valueLabel: { type: String, required: true }, valueKey: { type: String, required: true }, ascending: { type: Boolean, default: false } },
  setup(props: { rows: ChampionshipStatisticsRow[]; valueLabel: string; valueKey: string; ascending: boolean }) {
    return () => h('div', { class: 'ranking-list' }, props.rows.slice(0, 5).map((row, index) => h('div', { class: 'ranking-row', key: row.participant_id }, [h('span', { class: 'ranking-player-name' }, [h('b', { class: 'ranking-position' }, String(index + 1)), row.player.name]), h('strong', {}, String(Number((row as unknown as Record<string, number>)[props.valueKey] || 0)) + ' ' + props.valueLabel)])))
  },
})

const authStore = useAuthStore()
const toast = useToast()
const championships = ref<Awaited<ReturnType<typeof ChampionshipService.list>>>([])
const selectedId = ref<number>()
const details = ref<Awaited<ReturnType<typeof ChampionshipService.details>> | null>(null)
const rankings = ref<Awaited<ReturnType<typeof ChampionshipService.rankings>>>({ scorers: [], assists: [], mvp: [], goalkeepers: [] })
const statistics = ref<ChampionshipStatisticsRow[]>([])
const awards = ref<Awaited<ReturnType<typeof ChampionshipService.awards>>>([])
const phaseFilter = ref('all')
const publicTab = ref<PublicTab>('overview')
const isLoading = ref(true)
const loadError = ref('')
const isAuthenticated = computed(() => authStore.isAuthenticated)
const hasGoalkeepers = computed(() => statistics.value.some((row) => row.position === 'goalkeeper'))
const finishedMatchesCount = computed(() => details.value?.matches.filter((match) => match.status === 'finished').length || 0)
const knockoutMatchesCount = computed(() => details.value?.matches.filter((match) => match.phase !== 'group').length || 0)
const statusLabel = computed(() => ({ draft: 'Configuração', active: 'Em andamento', playoffs: 'Eliminatórias', finished: 'Encerrado' } as Record<string, string>)[details.value?.championship.status || ''] || 'Sem status')
const statusClass = computed(() => details.value?.championship.status === 'finished' ? 'pill-ok' : details.value?.championship.status === 'draft' ? 'pill-muted' : 'pill-info')
const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
const phaseLabel = (phase: string) => ({ draft: 'Configuração', group: 'Classificatória', playoffs: 'Eliminatórias', semi_final: 'Semifinal', challenger_final: 'Final dos Desafiantes', final: 'Grande Final', finished: 'Encerrado' } as Record<string, string>)[phase] || phase
const score = (match: ChampionshipMatch) => {
  if (match.status !== 'finished' || match.home_score === null || match.away_score === null) return 'vs'
  const normal = String(match.home_score) + ' × ' + String(match.away_score)
  return match.home_score === match.away_score && match.home_penalty_score !== null && match.home_penalty_score !== undefined ? normal + ' (' + match.home_penalty_score + ' × ' + match.away_penalty_score + ' pen.)' : normal
}
const formatOdd = (value: number) => Number(value || 0).toFixed(2)
const matchesByPhase = (phase: string) => details.value?.matches.filter((match) => match.phase === phase) || []
const teamForStanding = (teamId: number) => details.value?.championship.teams.find((team) => team.id === teamId)
const resultLabel = (result: FormResult) => ({ win: 'Vitória', draw: 'Empate', loss: 'Derrota' })[result]
const resultSymbol = (result: FormResult) => ({ win: 'V', draw: 'E', loss: 'D' })[result]
const recentResults = (teamId: number): FormResult[] => {
  const matches = (details.value?.matches || []).filter((match) => match.phase === 'group' && match.status === 'finished' && (match.home_team.id === teamId || match.away_team.id === teamId)).sort((a, b) => (a.round || 0) - (b.round || 0) || a.id - b.id).slice(-5)
  return matches.map((match) => {
    if (match.home_score === match.away_score) return 'draw'
    const teamIsHome = match.home_team.id === teamId
    const teamWon = teamIsHome ? (match.home_score || 0) > (match.away_score || 0) : (match.away_score || 0) > (match.home_score || 0)
    return teamWon ? 'win' : 'loss'
  })
}

const loadRankings = async () => {
  if (!selectedId.value) return
  const [rankingData, statisticsData] = await Promise.all([ChampionshipService.rankings(selectedId.value, phaseFilter.value), ChampionshipService.statistics(selectedId.value, phaseFilter.value)])
  rankings.value = rankingData
  statistics.value = statisticsData
}
const loadDetails = async () => {
  if (!selectedId.value) { details.value = null; isLoading.value = false; return }
  isLoading.value = true
  loadError.value = ''
  try {
    details.value = await ChampionshipService.details(selectedId.value)
    await Promise.all([loadRankings(), ChampionshipService.awards(selectedId.value).then((data) => { awards.value = data })])
  } catch (error) {
    console.error(error)
    loadError.value = 'Não foi possível carregar este campeonato.'
  } finally { isLoading.value = false }
}
const vote = async (categoryId: number, candidateId: number) => {
  if (!isAuthenticated.value) { toast.info('Faça login para votar.'); return }
  try {
    await ChampionshipService.vote(categoryId, candidateId)
    toast.success('Voto registrado')
    if (selectedId.value) awards.value = await ChampionshipService.awards(selectedId.value)
  } catch { /* O interceptor exibe a mensagem devolvida pela API. */ }
}
onMounted(async () => {
  try {
    championships.value = await ChampionshipService.list()
    selectedId.value = championships.value[0]?.id
    await loadDetails()
  } catch (error) {
    console.error(error)
    loadError.value = 'Não foi possível carregar os campeonatos.'
    isLoading.value = false
  }
})
</script>

<style scoped>
.championship-page { container-type: inline-size; container-name: championship-page; padding-top: 1.25rem; }
.championship-header { align-items: flex-end; margin-bottom: 1rem; }
.championship-heading { min-width: 0; }
.title-row { display: flex; align-items: center; flex-wrap: wrap; gap: .6rem .75rem; }
.eyebrow { display: block; color: var(--red-devils-hover); font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.championship-phase { display: flex; align-items: center; gap: .5rem; }
.championship-phase i { color: var(--red-devils-hover); }
.header-separator { color: var(--line-strong); }
.championship-picker { width: min(100%, 250px); color: var(--text-muted); font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.championship-picker .form-select { margin-top: .35rem; }
.state-card { display: flex; align-items: center; justify-content: center; gap: .75rem; min-height: 180px; padding: 2rem; }
.state-card--error { color: #fca5a5; flex-wrap: wrap; }
.empty-state { flex-direction: column; text-align: center; color: var(--text-muted); }
.empty-state i { color: var(--red-devils-hover); font-size: 2rem; }
.empty-state h2 { color: var(--text-main); margin: 0; }
.empty-state p { max-width: 480px; margin: 0; }
.spin { animation: spin 1s linear infinite; color: var(--red-devils-hover); }
@keyframes spin { to { transform: rotate(360deg); } }
.championship-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .35rem; margin-bottom: 1rem; padding: .35rem; overflow-x: auto; border: 1px solid var(--line-soft); border-radius: 1rem; background: rgba(255,255,255,.025); }
.championship-tab { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; align-items: center; gap: .1rem .55rem; min-width: 150px; min-height: 58px; padding: .65rem .75rem; border: 1px solid transparent; border-radius: .75rem; background: transparent; color: var(--text-muted); text-align: left; cursor: pointer; }
.championship-tab i { grid-row: span 2; color: var(--red-devils-hover); font-size: 1.1rem; }
.championship-tab span { color: var(--text-main); font-weight: 800; font-size: .82rem; }
.championship-tab small { font-size: .68rem; white-space: nowrap; }
.championship-tab.active, .championship-tab:hover { border-color: var(--red-devils); background: var(--red-devils-soft); color: var(--text-main); }
.championship-section { display: grid; gap: 1rem; min-width: 0; }
.champion-banner { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.15rem; border-color: rgba(250, 204, 21, .28); background: linear-gradient(135deg, rgba(250, 204, 21, .1), rgba(220, 38, 38, .06)); }
.champion-copy h2 { margin: .2rem 0; }
.champion-copy p, .champion-copy small { margin: 0; color: var(--text-muted); }
.champion-copy small span { color: var(--line-strong); }
.champion-icon { margin-left: auto; color: #facc15; font-size: 1.6rem; }
.championship-team-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .6rem; }
.team-card { display: flex; align-items: center; gap: .65rem; min-width: 0; padding: .7rem .75rem; }
.team-card-copy { min-width: 0; }
.team-card strong, .team-card-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.team-card-copy span { margin-top: .18rem; color: var(--text-muted); font-size: .7rem; }
.team-crest { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 42px; overflow: hidden; border: 1px solid var(--line-strong); border-radius: .85rem; background: var(--red-devils-soft); color: var(--red-devils-hover); font-weight: 800; }
.team-crest--winner { width: 54px; height: 54px; flex-basis: 54px; border-radius: 1rem; }
.team-crest--table { width: 30px; height: 30px; flex-basis: 30px; border-radius: .55rem; font-size: .65rem; }
.team-crest img { width: 100%; height: 100%; object-fit: cover; }
.panel-card { min-width: 0; padding: 1rem; }
.section-context { display: inline-flex; align-items: center; gap: .35rem; color: var(--text-muted); font-size: .72rem; }
.table-wrap { min-width: 0; overflow-x: auto; scrollbar-color: var(--red-devils) var(--surface-strong); }
.standings-table-wrap { border: 1px solid var(--line-soft); border-radius: .75rem; }
.data-table th { background: var(--surface-muted); color: var(--text-muted); }
.standings-table { min-width: 820px; font-size: .82rem; }
.standings-table thead th { background: var(--surface-muted); color: var(--text-muted); padding: .7rem .65rem; }
.standings-table tbody td { padding: .7rem .65rem; }
.standings-table th, .standings-table td { white-space: nowrap; text-align: center; }
.standings-table .sticky-col { position: sticky; z-index: 2; background: var(--surface); }
.standings-table thead .sticky-col { z-index: 4; background: var(--surface-muted); }
.sticky-position { left: 0; width: 42px; min-width: 42px; }
.sticky-team { left: 42px; min-width: 166px; text-align: left !important; box-shadow: 8px 0 12px -12px rgba(0,0,0,.85); }
.standings-table .sticky-team { padding-left: .7rem; }
.standing-team { display: flex; align-items: center; gap: .55rem; min-width: 0; text-align: left; }
.standing-team strong { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
.standings-table .points-col { position: sticky; left: 208px; z-index: 2; min-width: 52px; color: var(--text-main); font-size: .95rem; font-weight: 800; background: var(--surface); box-shadow: 8px 0 12px -12px rgba(0,0,0,.85); }
.standings-table thead .points-col { z-index: 4; background: var(--surface-muted); }
.standings-table tbody tr:hover .sticky-col { background: #211719; }
.standings-table tbody tr:hover .points-col { background: #211719; }
.standings-leader { background: rgba(250, 204, 21, .07); }
.standings-leader .sticky-col { background: rgba(58, 48, 18, .9); }
.standings-leader .points-col { background: rgba(58, 48, 18, .9); }
.standings-qualified .sticky-position { box-shadow: inset 3px 0 0 var(--red-devils); }
.form-results { display: inline-flex; align-items: center; gap: .25rem; min-height: 28px; }
.result-dot, .legend-win, .legend-draw, .legend-loss { display: inline-flex; align-items: center; justify-content: center; width: 23px; height: 23px; border-radius: 50%; font-size: .65rem; font-weight: 900; }
.result-win, .legend-win { background: #25a75a; color: #fff; }
.result-draw, .legend-draw { background: #8d8c99; color: #fff; }
.result-loss, .legend-loss { background: #e4473f; color: #fff; }
.result-empty { color: var(--text-muted); }
.table-legend { display: flex; align-items: center; flex-wrap: wrap; gap: .75rem; margin-top: .75rem; color: var(--text-muted); font-size: .72rem; }
.table-legend span { display: inline-flex; align-items: center; gap: .3rem; }
.qualification-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--red-devils-hover); }
.table-note { margin: .65rem 0 0; color: var(--text-muted); font-size: .72rem; }
.championship-columns { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr); gap: 1rem; align-items: start; }
.match-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(94px, auto) minmax(0, 1fr); align-items: center; gap: .7rem; padding: .75rem 0; border-bottom: 1px solid var(--line-soft); }
.match-row:last-child { border-bottom: 0; }
.match-team { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; }
.match-team--away { text-align: right; }
.match-score-box { text-align: center; }
.match-score { display: block; color: var(--text-main); font-size: 1rem; }
.match-score.pending { color: var(--red-devils-hover); }
.match-score-box small { display: block; margin-top: .15rem; color: var(--text-muted); font-size: .66rem; white-space: nowrap; }
.odds-inline { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding-top: .45rem; color: var(--text-muted); font-size: .68rem; }
.odds-inline strong { color: var(--text-main); font-size: .7rem; }
.phase-summary-list { display: grid; gap: .5rem; }
.phase-summary-list div { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .7rem .75rem; border: 1px solid var(--line-soft); border-radius: .7rem; background: rgba(255,255,255,.025); }
.phase-summary-list span { color: var(--text-muted); font-size: .78rem; }
.phase-summary-list strong { font-size: 1.1rem; }
.summary-note { margin: .8rem 0 0; color: var(--text-muted); font-size: .75rem; line-height: 1.5; }
.bracket-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem; }
.bracket-stage { min-width: 0; padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255,255,255,.02); }
.bracket-stage h3 { margin: 0 0 .6rem; color: var(--red-devils-hover); font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; }
.bracket-match { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .4rem; padding: .6rem 0; border-bottom: 1px solid var(--line-soft); font-size: .8rem; }
.bracket-match:last-of-type { border-bottom: 0; }
.bracket-match span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bracket-match span:nth-of-type(2) { grid-column: 1; }
.bracket-match strong { grid-column: 2; grid-row: 1 / span 2; align-self: center; }
.ranking-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.ranking-block { min-width: 0; padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255,255,255,.02); }
.ranking-block h3 { margin: 0 0 .35rem; font-size: .78rem; }
.ranking-row { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .55rem 0; border-bottom: 1px solid var(--line-soft); font-size: .78rem; }
.ranking-row:last-child { border-bottom: 0; }
.ranking-player-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ranking-position { display: inline-grid; place-items: center; width: 22px; height: 22px; margin-right: .4rem; border-radius: .4rem; background: var(--red-devils-soft); color: var(--red-devils-hover); font-size: .68rem; }
.compact-select { width: min(100%, 230px); }
.compact-table { font-size: .8rem; }
.compact-table th, .compact-table td { white-space: nowrap; }
.table-subline { display: block; color: var(--text-muted); font-size: .68rem; }
.awards-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.award-block { min-width: 0; padding: .85rem; border: 1px solid var(--line-soft); border-radius: .8rem; background: rgba(255,255,255,.02); }
.award-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; }
.award-heading h3 { margin: 0; font-size: .9rem; }
.award-heading p { margin: .25rem 0 0; color: var(--text-muted); font-size: .72rem; line-height: 1.4; }
.award-results { margin-top: .7rem; }
.award-result { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .55rem 0; border-bottom: 1px solid var(--line-soft); font-size: .78rem; }
.award-result:last-child { border-bottom: 0; }
.candidate-list { display: grid; gap: .4rem; margin-top: .7rem; }
.candidate-button { display: flex; align-items: center; justify-content: space-between; gap: .75rem; min-height: 40px; padding: .5rem .65rem; border: 1px solid var(--line-soft); border-radius: .6rem; background: transparent; color: var(--text-main); text-align: left; cursor: pointer; }
.candidate-button:hover { border-color: var(--red-devils); background: var(--red-devils-soft); }
.candidate-button i { color: var(--red-devils-hover); }
.award-status { margin: .7rem 0 0; color: var(--text-muted); font-size: .75rem; line-height: 1.45; }
.empty-inline { padding: .8rem 0; color: var(--text-muted); font-size: .85rem; }
@container championship-page (max-width: 1050px) { .championship-team-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .championship-columns { grid-template-columns: 1fr; } }
@container championship-page (max-width: 680px) { .championship-page { padding-top: .4rem; } .championship-header { align-items: stretch; } .championship-picker { width: 100%; } .championship-tabs { grid-template-columns: repeat(4, minmax(150px, 1fr)); margin-right: -.75rem; padding-right: .75rem; border-right: 0; border-radius: .85rem 0 0 .85rem; } .championship-team-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .champion-banner { align-items: flex-start; } .section-context { max-width: 150px; text-align: right; } .ranking-columns, .awards-grid { grid-template-columns: 1fr; } .match-summary-card { order: -1; } }
@container championship-page (max-width: 420px) { .title-row { align-items: flex-start; flex-direction: column; gap: .35rem; } .championship-team-grid { gap: .45rem; } .team-card { padding: .6rem; } .team-crest { width: 36px; height: 36px; flex-basis: 36px; } .team-crest--winner { width: 46px; height: 46px; flex-basis: 46px; } .champion-banner { padding: .85rem; } .champion-icon { font-size: 1.2rem; } .section-context { display: none; } .panel-card { padding: .8rem; } .match-row { gap: .35rem; } .match-score-box { min-width: 80px; } .odds-inline { align-items: flex-start; flex-direction: column; gap: .2rem; } .table-legend { gap: .5rem; } }
</style>
